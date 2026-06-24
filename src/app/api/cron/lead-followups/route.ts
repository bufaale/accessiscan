/**
 * /api/cron/lead-followups — daily 11:00 UTC.
 *
 * For every public_scan_results row where the visitor claimed their
 * scan (email_captured IS NOT NULL) 3-10 days ago and we haven't sent
 * a follow-up yet (followup_sent_at IS NULL), send 1 polite nudge
 * email and mark the row.
 *
 * Why this exists:
 *   Captured emails are *warmer* than cold-outreach contacts — the
 *   visitor actively scanned a domain and asked for a copy. A 3-day
 *   "did the report help — want to chat about a fuller audit?"
 *   follow-up converts these into trial signups at ~5-10x the rate
 *   of cold-email follow-up.
 *
 * Hard gates:
 *   - email_captured must be present (otherwise nothing to send to)
 *   - followup_sent_at must be NULL (1 follow-up per row, ever)
 *   - 3 ≤ age ≤ 10 days (3 = enough breathing room; 10 = past that,
 *     the lead is stale)
 *   - Cap 5 follow-ups per run
 *
 * Auth: bearer CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export const maxDuration = 60;

const MIN_AGE_DAYS = 3;
const MAX_AGE_DAYS = 10;
const MAX_FOLLOWUPS_PER_RUN = 5;

interface ScanReport {
  url: string;
  health_score?: number;
  total_issue_count?: number;
  issues?: Array<{ severity?: string }>;
}

interface FollowupResult {
  candidates: number;
  sent: number;
  failed: number;
  details: Array<{
    token: string;
    email: string;
    status: "sent" | "error";
    resend_id?: string;
    error?: string;
  }>;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildBody(opts: {
  url: string;
  score: number;
  criticalCount: number;
  permalink: string;
}) {
  const { url, score, criticalCount, permalink } = opts;
  const subject = `Following up on your ${url} accessibility scan`;
  const verdict = score >= 90 ? "passing well" : score >= 75 ? "in the review band" : "below the WCAG 2.1 AA threshold";

  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;color:#0f172a;font-size:14px;line-height:1.55">
  <p>Hi,</p>
  <p>A few days back you ran an AccessiScan WCAG scan against <strong>${escapeHtml(url)}</strong>. Quick recap:</p>
  <ul>
    <li>Score: <strong>${score}/100</strong> (${verdict})</li>
    <li>Critical violations: <strong>${criticalCount}</strong></li>
    <li>Full scorecard: <a href="${permalink}">${permalink}</a></li>
  </ul>
  <p>Two questions:</p>
  <ol>
    <li>Did the report surface anything actionable for your team?</li>
    <li>Would you like a 20-minute walkthrough of the full Playwright-based scan (color contrast, focus order, JS-rendered content, ~80 more rules)? We can run it against ${escapeHtml(url)} live on the call and you get the recording + VPAT 2.5 export to share with procurement.</li>
  </ol>
  <p>Reply to this email if interested — happy to find a time. No newsletter, no automated drip after this. If you&apos;d rather just try the full scan yourself, <a href="https://accessiscan.piposlab.com/pricing">plans start at $39/mo</a>.</p>
  <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px">— Alejandro · Pipo&apos;s Lab LLC<br/>DOJ Title II web-accessibility deadline: April 2027. ADA Title III lawsuits keep landing.</p>
</div>`;

  const text = `Hi,

A few days back you ran an AccessiScan WCAG scan against ${url}. Quick recap:

- Score: ${score}/100 (${verdict})
- Critical violations: ${criticalCount}
- Full scorecard: ${permalink}

Two questions:

1. Did the report surface anything actionable for your team?
2. Would you like a 20-minute walkthrough of the full Playwright-based
   scan (color contrast, focus order, JS-rendered content, ~80 more
   rules)? We can run it against ${url} live on the call and you get
   the recording + VPAT 2.5 export to share with procurement.

Reply to this email if interested — happy to find a time. No newsletter,
no automated drip after this. If you'd rather just try the full scan
yourself, plans start at $39/mo:
https://accessiscan.piposlab.com/pricing

— Alejandro
Pipo's Lab LLC

DOJ Title II web-accessibility deadline: April 2027.`;

  return { subject, html, text };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  type LooseDb = { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = admin as unknown as LooseDb;

  const now = Date.now();
  const minCutoff = new Date(now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const maxCutoff = new Date(now - MIN_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error: queryErr } = await db
    .from("public_scan_results")
    .select("id, url, report, email_captured, created_at")
    .not("email_captured", "is", null)
    .is("followup_sent_at", null)
    .gte("created_at", minCutoff)
    .lte("created_at", maxCutoff)
    .order("created_at", { ascending: true })
    .limit(MAX_FOLLOWUPS_PER_RUN * 2);

  if (queryErr) {
    return NextResponse.json(
      { ok: false, error: "query_failed", message: queryErr.message },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as Array<{
    id: string;
    url: string;
    report: ScanReport;
    email_captured: string;
    created_at: string;
  }>;

  const result: FollowupResult = {
    candidates: rows.length,
    sent: 0,
    failed: 0,
    details: [],
  };

  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const row of rows) {
    if (result.sent >= MAX_FOLLOWUPS_PER_RUN) break;

    const score = typeof row.report?.health_score === "number" ? row.report.health_score : 0;
    const issues = Array.isArray(row.report?.issues) ? row.report.issues : [];
    const criticalCount = issues.filter((i) => i?.severity === "critical").length;
    const permalink = `https://accessiscan.piposlab.com/scan-result/${row.id}`;
    const { subject, html, text } = buildBody({
      url: row.url,
      score,
      criticalCount,
      permalink,
    });

    try {
      const sendRes = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
        replyTo: "alex@piposlab.com",
        to: row.email_captured,
        subject,
        html,
        text,
      });
      const resendId = sendRes.data?.id;
      if (!resendId) {
        result.failed += 1;
        result.details.push({
          token: row.id,
          email: row.email_captured,
          status: "error",
          error: sendRes.error?.message ?? "no_id_returned",
        });
        continue;
      }

      // Mark the row so the next run skips it
      await db
        .from("public_scan_results")
        .update({ followup_sent_at: new Date().toISOString() })
        .eq("id", row.id);

      result.sent += 1;
      result.details.push({
        token: row.id,
        email: row.email_captured,
        status: "sent",
        resend_id: resendId,
      });
    } catch (e) {
      result.failed += 1;
      result.details.push({
        token: row.id,
        email: row.email_captured,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ ok: true, ...result });
}

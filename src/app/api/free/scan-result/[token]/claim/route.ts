/**
 * POST /api/free/scan-result/[token]/claim — let a visitor "claim" their
 * scan by giving email AFTER they've seen the result.
 *
 * Why this endpoint exists:
 *   The /free/wcag-scanner form asked for email BEFORE the scan ran.
 *   78 scans tonight, 0 captured emails (0% conversion). Visitors don't
 *   give email until they see value. This endpoint accepts the email
 *   POST-result + persists to public_scan_results.email_captured + fires
 *   a Resend email with the scan permalink + top remediation tips.
 *
 * Also writes an `email_captured` row to `free_tool_events` — funnel step 2,
 * carrying the same UTM attribution as the scan so a campaign can be measured
 * end to end. That row never contains the email.
 *
 * Body: { email: string, utm_source?, utm_medium?, utm_campaign? }
 * Auth: none (public — same as /api/free/wcag-scan). IP rate-limit 4/min.
 *
 * Returns 200 on success, 400 on bad input, 404 on bogus token, 409 if
 * already claimed (idempotent — the same token+email is a no-op).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { deriveScanOutcome, displayHealthScore } from "@/lib/free-scan/outcome";
import { parseAttribution } from "@/lib/free/attribution";
import { countBySeverity, logFreeToolEvent } from "@/lib/free/funnel-events";

export const maxDuration = 15;

// 12/min/IP — generous enough that E2E + multi-tab users don't trip it,
// strict enough that scripted brute-force of token+email pairs is slowed.
// Abuse is already capped by (a) token-must-exist lookup, (b) 409 on a
// different-email re-claim (can't hijack someone else's scan).
const RATE_LIMIT_PER_MIN = 12;
const ipHits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = ipHits.get(ip);
  if (!cur || cur.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  cur.count += 1;
  return cur.count > RATE_LIMIT_PER_MIN;
}

function sanitizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase();
  if (t.length === 0 || t.length > 254) return null;
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(t)) return null;
  return t;
}

interface ScanReport {
  url: string;
  outcome?: "ok" | "blocked" | "failed";
  fetched_status?: number | null;
  error?: string;
  health_score?: number | null;
  total_issue_count?: number;
  issues?: Array<{ rule?: string; severity?: string; count?: number; fix_hint?: string }>;
}

/**
 * `score: null` means the scan measured NOTHING — the host blocked us, or the
 * page was unreachable. The email must say that instead of claiming "0/100",
 * which would land in the recipient's inbox as a false accusation about their
 * own site. The UI does not offer the capture form in that state; this branch
 * exists because the endpoint is public and can be called directly.
 */
function renderClaimEmail(opts: { url: string; score: number | null; permalink: string; topIssues: Array<{ rule: string; severity: string; fix_hint: string }> }) {
  const { url, score, permalink, topIssues } = opts;
  const scoreLineHtml =
    score === null
      ? `<p>We couldn't complete the scan: the site didn't return a page to our lite scanner, so there is no score and no issue list. That says nothing about the site's accessibility either way — the full scan drives a real Chromium browser and usually gets through.</p>`
      : `<p>Your score: <strong style="font-size:18px">${score}/100</strong> — <a href="${permalink}">view the full scorecard</a></p>`;
  const scoreLineText =
    score === null
      ? `We couldn't complete the scan: the site didn't return a page to our lite scanner, so there is no score and no issue list. That says nothing about the site's accessibility either way — the full scan drives a real Chromium browser and usually gets through.`
      : `Your score: ${score}/100 — view the full scorecard: ${permalink}`;
  const issueListHtml = topIssues.length
    ? `<ol style="padding-left:18px;margin:12px 0;">${topIssues
        .map(
          (i) =>
            `<li style="margin-bottom:8px;font-size:14px;line-height:1.5"><strong>${escapeHtml(
              i.rule,
            )}</strong> <span style="color:#64748b;font-size:12px;text-transform:uppercase">(${escapeHtml(
              i.severity,
            )})</span><br/><span style="color:#475569">${escapeHtml(i.fix_hint)}</span></li>`,
        )
        .join("")}</ol>`
    : "";
  const issueListText = topIssues.length
    ? topIssues.map((i, n) => `${n + 1}. ${i.rule} (${i.severity})\n   Fix: ${i.fix_hint}`).join("\n\n")
    : "";

  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;color:#0f172a;font-size:14px;line-height:1.55">
  <p>Hi,</p>
  <p>Thanks for running an AccessiScan WCAG scan against <strong>${escapeHtml(url)}</strong>.</p>
  ${scoreLineHtml}
  ${topIssues.length ? `<p>Top issues + remediation hints:</p>${issueListHtml}` : ""}
  <p style="margin-top:24px">For a full Playwright-based scan that runs ~80 more rules (color contrast, focus order, JS-rendered content), plus Auto-Fix PRs against your repo, see <a href="https://accessiscan.piposlab.com/pricing">AccessiScan plans</a> from $39/mo; VPAT 2.5 comes with the $149 audit.</p>
  <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px">DOJ Title II web-accessibility deadline: April 2027. ADA Title III lawsuits keep landing — start the remediation conversation now.</p>
  <p style="color:#64748b;font-size:12px">— Alejandro<br/>Pipo&apos;s Lab LLC · <a href="https://accessiscan.piposlab.com">accessiscan.piposlab.com</a></p>
</div>`;

  const text = `Hi,

Thanks for running an AccessiScan WCAG scan against ${url}.

${scoreLineText}

${issueListText ? `Top issues + remediation hints:\n\n${issueListText}\n\n` : ""}For a full Playwright-based scan that runs ~80 more rules (color contrast, focus order, JS-rendered content), plus Auto-Fix PRs against your repo, see AccessiScan plans from $39/mo; VPAT 2.5 comes with the $149 audit:
https://accessiscan.piposlab.com/pricing

DOJ Title II web-accessibility deadline: April 2027.

— Alejandro
Pipo's Lab LLC
https://accessiscan.piposlab.com`;

  return { html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: unknown } & Record<string, unknown>;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = sanitizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const admin = createAdminClient();
  type LooseDb = { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = admin as unknown as LooseDb;

  // Lookup the scan
  const { data: row, error: lookupErr } = await db
    .from("public_scan_results")
    .select("id, url, report, email_captured")
    .eq("id", token)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json(
      { ok: false, error: "lookup_failed", message: lookupErr.message },
      { status: 500 },
    );
  }
  if (!row) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Idempotent — if same email already on the row, treat as success
  if (row.email_captured && row.email_captured.toLowerCase() === email) {
    return NextResponse.json({ ok: true, claimed: true, idempotent: true });
  }
  // Conflict if a different email already claimed
  if (row.email_captured && row.email_captured.toLowerCase() !== email) {
    return NextResponse.json(
      { ok: false, error: "already_claimed" },
      { status: 409 },
    );
  }

  // Persist the email capture + stamp the claim time (used by the cap below).
  const { error: updateErr } = await db
    .from("public_scan_results")
    .update({ email_captured: email, claimed_at: new Date().toISOString() })
    .eq("id", token);
  if (updateErr) {
    return NextResponse.json(
      { ok: false, error: "persist_failed", message: updateErr.message },
      { status: 500 },
    );
  }

  // Funnel step 2. Aggregate only — the email stays in public_scan_results and
  // is deliberately NOT copied into free_tool_events. Logged here, right after
  // the capture is persisted, so it is recorded even when the send is later
  // skipped by the global cap below.
  {
    const claimed = (row.report ?? {}) as ScanReport;
    logFreeToolEvent({
      event: "email_captured",
      outcome: deriveScanOutcome(claimed),
      attribution: parseAttribution(body),
      referer: req.headers.get("referer"),
      healthScore: displayHealthScore(claimed),
      issueCount: claimed.total_issue_count ?? null,
      criticalCount: countBySeverity(claimed.issues, "critical"),
    });
  }

  // SECURITY — email-bomb circuit breaker. This endpoint sends mail from our
  // Resend domain to a caller-supplied address; the per-IP limiter above is
  // in-memory and does NOT hold across Vercel's distributed instances, so an
  // attacker could loop scan->claim with arbitrary recipients and get
  // piposlab.com flagged (killing ALL portfolio email). Bound the blast radius
  // with a shared, DB-backed global daily cap: past the cap we still capture
  // the email (no UX break) but skip the send. Cap is far above real volume.
  const GLOBAL_DAILY_CLAIM_SEND_CAP = 300;
  let overGlobalCap = false;
  try {
    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { count } = await db
      .from("public_scan_results")
      .select("id", { count: "exact", head: true })
      .gte("claimed_at", since);
    if (typeof count === "number" && count > GLOBAL_DAILY_CLAIM_SEND_CAP) {
      overGlobalCap = true;
      console.warn(`[claim] global daily send cap hit (${count}); skipping send`);
    }
  } catch (e) {
    overGlobalCap = true; // fail SAFE — protecting the sender domain wins
    console.error("[claim] cap check failed, skipping send", e);
  }
  if (overGlobalCap) {
    return NextResponse.json({ ok: true, claimed: true, emailed: false });
  }

  // Build + send the email
  const report = (row.report ?? {}) as ScanReport;
  // null when the scan measured nothing — never coerced to 0 (see renderClaimEmail).
  const score = displayHealthScore(report);
  const topIssues = (Array.isArray(report.issues) ? report.issues : [])
    .slice(0, 5)
    .map((i) => ({
      rule: i.rule ?? "Unknown",
      severity: i.severity ?? "moderate",
      fix_hint: i.fix_hint ?? "",
    }));
  const permalink = `https://accessiscan.piposlab.com/scan-result/${token}`;
  const { html, text } = renderClaimEmail({ url: row.url, score, permalink, topIssues });

  let resendId: string | undefined;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sendRes = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
      replyTo: "alex@piposlab.com",
      to: email,
      subject:
        score === null
          ? `Your WCAG scan of ${row.url} — we couldn't reach the site`
          : `Your WCAG scan of ${row.url} — score ${score}/100`,
      html,
      text,
    });
    resendId = sendRes.data?.id;
  } catch (e) {
    // Email send failed but capture is persisted — that's OK; return ok:true
    // so the visitor's flow doesn't break, log the issue server-side.
    console.error("[claim] resend send failed", e);
  }

  return NextResponse.json({ ok: true, claimed: true, resend_id: resendId });
}

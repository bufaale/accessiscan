import { Resend } from "resend";
import { scanUrlDeep } from "@/lib/audit/deep-scanner";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fulfil a paid $79 "Automated WCAG Report": run the automated scan and email the
 * buyer their prioritized findings + a 30/60/90-day plan. Called by the Stripe
 * webhook on checkout.session.completed when metadata.kind === "snapshot".
 *
 * Deliberately LIGHTER than fulfilPaidAudit ($149): same deep scan engine, but
 * NO Legal Evidence Pack / hash baseline / VPAT / manual review / /verify URL.
 * The report is the fast, low-risk "see exactly where you stand" entry product;
 * the email upsells the full $149 audit for the Evidence Pack + manual review.
 *
 * Isolated from fulfill.ts on purpose so this can never break the live $149 flow.
 *
 * Legal framing (legal-compliance agent): states the automated-scope limit
 * explicitly, NEVER claims the site is "compliant", not legal advice.
 */

interface SnapshotArgs {
  sessionId: string;
  email: string;
  targetUrl: string;
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, serious: 1, moderate: 2 };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderSnapshotEmail(opts: {
  url: string;
  score: number;
  total: number;
  issues: Array<{ rule: string; severity: string; count: number; wcag_ref?: string; fix_hint?: string }>;
}) {
  const { url, score, total, issues } = opts;
  const auditUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://accessiscan.piposlab.com"}/audit`;
  const nCritical = issues.filter((i) => i.severity === "critical").reduce((s, i) => s + i.count, 0);
  const nSerious = issues.filter((i) => i.severity === "serious").reduce((s, i) => s + i.count, 0);
  const nModerate = issues.filter((i) => i.severity === "moderate").reduce((s, i) => s + i.count, 0);
  const plan = [
    `Days 1–30: clear the ${nCritical} critical issue${nCritical === 1 ? "" : "s"} above — these are the ones most cited in ADA complaints.`,
    `Days 31–60: work through the ${nSerious} serious issue${nSerious === 1 ? "" : "s"}.`,
    `Days 61–90: handle the ${nModerate} moderate issue${nModerate === 1 ? "" : "s"}, then re-scan to confirm your score moved.`,
  ];
  const rows = issues
    .map(
      (i) =>
        `<li style="margin-bottom:14px;font-size:14px;line-height:1.5">
          <strong>${escapeHtml(i.rule)}</strong>
          <span style="color:#64748b;font-size:12px;text-transform:uppercase"> (${escapeHtml(i.severity)}, ${i.count}x)</span>
          ${i.wcag_ref ? `<br/><span style="color:#94a3b8;font-size:12px">${escapeHtml(i.wcag_ref)}</span>` : ""}
          ${i.fix_hint ? `<br/><span style="color:#475569">Fix: ${escapeHtml(i.fix_hint)}</span>` : ""}
        </li>`,
    )
    .join("");

  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;color:#0f172a;font-size:14px;line-height:1.55">
  <p>Thanks for your purchase. Here is your Automated WCAG Report for <strong>${escapeHtml(url)}</strong>.</p>
  <p style="font-size:18px"><strong>Automated score: ${score}/100</strong> — ${total} issue${total === 1 ? "" : "s"} detected.</p>
  <p>Your top issues, ranked by severity (most lawsuit-cited first), each with the WCAG reference and a concrete fix:</p>
  <ol style="padding-left:18px">${rows}</ol>
  <p style="margin-top:18px"><strong>Your 30/60/90-day plan:</strong></p>
  <ul style="padding-left:18px;font-size:13px;color:#334155">${plan.map((p) => `<li style="margin-bottom:6px">${escapeHtml(p)}</li>`).join("")}</ul>
  <p style="margin-top:20px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;font-size:13px;color:#78350f">
    <strong>Scope + honest limits:</strong> this is an automated WCAG 2.1 AA scan. Automated checks reliably
    catch roughly 30-40% of WCAG issues (the mechanical ones: missing alt text, contrast, labels, structure).
    They cannot judge whether alt text is meaningful or whether a custom widget makes sense to a screen reader.
    This snapshot is a documented good-faith starting point, not a certificate of compliance, and full
    conformance still requires manual testing with a screen reader. This is not legal advice.
  </p>
  <p style="margin-top:16px;padding:12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;font-size:13px;color:#0c4a6e">
    <strong>Need to hand this to a lawyer or procurement?</strong> The <a href="${auditUrl}" style="color:#0369a1">$149 documented audit</a>
    adds manual review of your key pages, a hash-signed Legal Evidence Pack (the dated proof a demand-letter
    response needs), a public /verify URL for the record, and a VPAT-style conformance report.
  </p>
  <p style="margin-top:16px">Reply to this email if you want help prioritizing these fixes.</p>
  <p style="color:#64748b;font-size:12px;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:12px">
    Alejandro, Pipo Labs LLC<br/>accessiscan.piposlab.com
  </p>
</div>`;

  const text = `Thanks for your purchase. Automated WCAG Report for ${url}.

Automated score: ${score}/100 — ${total} issues detected.

Your top issues (most lawsuit-cited first):
${issues.map((i, n) => `${n + 1}. ${i.rule} (${i.severity}, ${i.count}x)${i.wcag_ref ? ` [${i.wcag_ref}]` : ""}${i.fix_hint ? `\n   Fix: ${i.fix_hint}` : ""}`).join("\n\n")}

YOUR 30/60/90-DAY PLAN:
${plan.map((p) => `- ${p}`).join("\n")}

SCOPE + HONEST LIMITS: this is an automated WCAG 2.1 AA scan. Automated checks catch roughly 30-40% of WCAG issues. This report is a documented good-faith starting point, not a certificate of compliance; full conformance requires manual screen-reader testing. This is not legal advice.

NEED TO HAND THIS TO A LAWYER OR PROCUREMENT? The $149 documented audit (${auditUrl}) adds manual review, a hash-signed Legal Evidence Pack for demand-letter responses, a public /verify URL, and a VPAT-style report.

Reply if you want help prioritizing these fixes.

Alejandro, Pipo Labs LLC
accessiscan.piposlab.com`;

  return { html, text };
}

async function notifyOperatorOfSale(email: string, targetUrl: string): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
      to: "alex@piposlab.com",
      subject: `SALE: $79 Automated WCAG Report purchased — ${targetUrl}`,
      text: `A $79 Automated WCAG Report was just paid for.\n\nBuyer: ${email}\nTarget: ${targetUrl}\n\nFulfilment (scan + report email) is running now. Check paid_audits for status.`,
    });
  } catch (e) {
    console.error("[snapshot/fulfill] operator sale alert failed", e);
  }
}

export async function fulfilSnapshot({ sessionId, email, targetUrl }: SnapshotArgs): Promise<void> {
  const db = createAdminClient() as unknown as {
    from: (t: string) => {
      update: (v: unknown) => { eq: (c: string, val: string) => Promise<{ error: unknown }> };
    };
  };
  const setStatus = (patch: Record<string, unknown>) =>
    db.from("paid_audits").update(patch).eq("stripe_session_id", sessionId);

  await notifyOperatorOfSale(email, targetUrl);
  await setStatus({ status: "scanning" });

  try {
    const report = await scanUrlDeep(targetUrl);
    const issues = [...(report.issues ?? [])].sort(
      (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
    );
    const score = report.health_score ?? 0;
    const total = report.total_issue_count ?? issues.length;

    const { html, text } = renderSnapshotEmail({ url: targetUrl, score, total, issues });

    let resendId: string | undefined;
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
        replyTo: "alex@piposlab.com",
        to: email,
        subject: `Your Automated WCAG Report for ${targetUrl} — ${score}/100`,
        html,
        text,
      });
      resendId = res.data?.id;
    } catch (e) {
      console.error("[snapshot/fulfill] resend send failed", e);
      await setStatus({ status: "failed", scan_score: score, scan_issue_count: total, error_detail: "email_send_failed" });
      return;
    }

    await setStatus({
      status: "delivered",
      scan_score: score,
      scan_issue_count: total,
      resend_message_id: resendId ?? null,
      delivered_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[snapshot/fulfill] scan failed", e);
    await setStatus({ status: "failed", error_detail: e instanceof Error ? e.message.slice(0, 300) : "scan_failed" });
  }
}

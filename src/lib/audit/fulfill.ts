import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { scanUrlLite } from "@/lib/free-scan/lite-scanner";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertBaseline } from "@/lib/audit/baseline-store";
import { buildEvidencePack } from "@/lib/audit/evidence-pack-content";

/**
 * Fulfil a paid one-time WCAG audit: run the scan, persist results, and email
 * the buyer their report. Called by the Stripe webhook on
 * checkout.session.completed when metadata.kind === "one_time_audit".
 *
 * Legal framing (enforced by legal-compliance agent): the email + report state
 * the automated-scope limitation explicitly and NEVER claim the site is
 * "compliant". We sell a documented good-faith audit, not a legal guarantee.
 */

interface FulfilArgs {
  sessionId: string;
  email: string;
  targetUrl: string;
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, serious: 1, moderate: 2 };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderAuditEmail(opts: {
  url: string;
  score: number;
  total: number;
  issues: Array<{ rule: string; severity: string; count: number; wcag_ref?: string; fix_hint?: string }>;
  evidence?: { html: string; text: string };
}) {
  const { url, score, total, issues, evidence } = opts;
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
  <p>Thanks for your purchase. Here is your WCAG 2.1 AA audit for <strong>${escapeHtml(url)}</strong>.</p>
  <p style="font-size:18px"><strong>Automated score: ${score}/100</strong> — ${total} issue${total === 1 ? "" : "s"} detected.</p>
  <p>Prioritized findings (most lawsuit-cited first):</p>
  <ol style="padding-left:18px">${rows}</ol>
  ${evidence ? evidence.html : `<p style="margin-top:20px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;font-size:13px;color:#78350f">
    <strong>Scope + honest limits:</strong> this is an automated WCAG 2.1 AA scan. Automated checks reliably
    catch roughly 30-40% of WCAG issues (the mechanical ones: missing alt text, contrast, labels, structure).
    They cannot judge whether alt text is meaningful or whether a custom widget makes sense to a screen reader.
    A clean automated result is a documented good-faith starting point, not a certificate of compliance, and
    full conformance still requires manual testing with a screen reader. This report does not constitute legal advice.
  </p>`}
  <p style="margin-top:16px">Reply to this email if you want help prioritizing the fixes, or a re-scan after you remediate. A re-scan to document your improved score is included.</p>
  <p style="color:#64748b;font-size:12px;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:12px">
    Alejandro, Pipo Labs LLC<br/>accessiscan.piposlab.com
  </p>
</div>`;

  const text = `Thanks for your purchase. WCAG 2.1 AA audit for ${url}.

Automated score: ${score}/100 — ${total} issues detected.

Prioritized findings:
${issues.map((i, n) => `${n + 1}. ${i.rule} (${i.severity}, ${i.count}x)${i.wcag_ref ? ` [${i.wcag_ref}]` : ""}${i.fix_hint ? `\n   Fix: ${i.fix_hint}` : ""}`).join("\n\n")}

${evidence ? evidence.text : "SCOPE + HONEST LIMITS: this is an automated WCAG 2.1 AA scan. Automated checks catch roughly 30-40% of WCAG issues. A clean result is a documented good-faith starting point, not a certificate of compliance; full conformance requires manual screen-reader testing. This is not legal advice."}

Reply if you want help prioritizing fixes or a re-scan after remediation.

Alejandro, Pipo Labs LLC
accessiscan.piposlab.com`;

  return { html, text };
}

/**
 * Fire-and-forget operator alert the instant a paid audit's webhook fires.
 * The payment is already captured by the time fulfilPaidAudit runs, so this
 * is the session-independent first/next-sale alarm: it does not depend on the
 * scan or the customer email succeeding, and it never throws (a failed alert
 * must not roll back fulfilment).
 */
async function notifyOperatorOfSale(email: string, targetUrl: string): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
      to: "alex@piposlab.com",
      subject: `SALE: $149 WCAG audit purchased — ${targetUrl}`,
      text: `A one-time WCAG audit was just paid for.\n\nBuyer: ${email}\nTarget: ${targetUrl}\n\nFulfilment (scan + report email) is running now. Check paid_audits for status.`,
    });
  } catch (e) {
    console.error("[audit/fulfill] operator sale alert failed", e);
  }
}

export async function fulfilPaidAudit({ sessionId, email, targetUrl }: FulfilArgs): Promise<void> {
  const db = createAdminClient() as unknown as {
    from: (t: string) => {
      update: (v: unknown) => { eq: (c: string, val: string) => Promise<{ error: unknown }> };
    };
  };
  const setStatus = (patch: Record<string, unknown>) =>
    db.from("paid_audits").update(patch).eq("stripe_session_id", sessionId);

  // First thing: ping the operator. Money has already landed at this point.
  await notifyOperatorOfSale(email, targetUrl);

  await setStatus({ status: "scanning" });

  try {
    const report = await scanUrlLite(targetUrl);
    const issues = [...(report.issues ?? [])].sort(
      (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
    );
    const score = report.health_score ?? 0;
    const total = report.total_issue_count ?? issues.length;

    // Legal Evidence Pack: persist an immutable, hash-signed baseline and build
    // the verifiable record + 30/60/90 plan + accessibility statement + demand-
    // letter template. Best-effort — a failure here must never block delivery.
    let evidence: { html: string; text: string } | undefined;
    let baselineId: string | null = null;
    let evidenceToken: string | null = null;
    try {
      const adb = createAdminClient();
      const { data: paidRow } = await adb
        .from("paid_audits")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .single();
      const auditId = (paidRow as { id?: string } | null)?.id;
      if (auditId) {
        const scannedAt = new Date().toISOString();
        const inserted = await insertBaseline({ paidAuditId: auditId, targetUrl, scannedAt, issues });
        if (inserted) {
          baselineId = inserted.baselineId;
          evidenceToken = randomBytes(24).toString("base64url");
          const base = process.env.NEXT_PUBLIC_APP_URL || "https://accessiscan.piposlab.com";
          const verifyUrl = `${base}/verify/${auditId}`;
          const packUrl = `${base}/audit/${auditId}/pack?token=${evidenceToken}`;
          const rescanUrl = `${base}/audit/${auditId}/rescan?token=${evidenceToken}`;
          evidence = buildEvidencePack(
            { url: targetUrl, scannedAtUtc: scannedAt, hash: inserted.record.violationsHash, verifyUrl, packUrl, rescanUrl, platform: report.platform },
            issues,
          );
        }
      }
    } catch (e) {
      console.error("[audit/fulfill] evidence pack build failed", e);
    }

    const { html, text } = renderAuditEmail({ url: targetUrl, score, total, issues, evidence });

    let resendId: string | undefined;
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "AccessiScan <no-reply@piposlab.com>",
        replyTo: "alex@piposlab.com",
        to: email,
        subject: `Your automated WCAG audit of ${targetUrl} — ${score}/100`,
        html,
        text,
      });
      resendId = res.data?.id;
    } catch (e) {
      // Email failed but the scan succeeded + is persisted. Mark delivered=false
      // path so an operator can re-send. Do NOT throw — the payment is captured.
      console.error("[audit/fulfill] resend send failed", e);
      await setStatus({ status: "failed", scan_score: score, scan_issue_count: total, error_detail: "email_send_failed" });
      return;
    }

    await setStatus({
      status: "delivered",
      scan_score: score,
      scan_issue_count: total,
      resend_message_id: resendId ?? null,
      delivered_at: new Date().toISOString(),
      ...(baselineId ? { baseline_id: baselineId } : {}),
      ...(evidenceToken ? { evidence_token: evidenceToken } : {}),
    });
  } catch (e) {
    console.error("[audit/fulfill] scan failed", e);
    await setStatus({ status: "failed", error_detail: e instanceof Error ? e.message.slice(0, 300) : "scan_failed" });
  }
}

/**
 * Regression alert email via Resend.
 *
 * Fired by the continuous-monitoring cron when a monitored site's compliance
 * score drops by `regression_threshold` points or the critical issue count
 * increases versus the last baseline.
 */

import { Resend } from "resend";

export interface RegressionAlertInput {
  toEmail: string;
  siteLabel: string;
  siteUrl: string;
  previousScore: number;
  currentScore: number;
  previousCritical: number;
  currentCritical: number;
  previousSerious: number;
  currentSerious: number;
  scanDashboardUrl: string;
}

function fmtDelta(prev: number, curr: number): string {
  const d = curr - prev;
  if (d === 0) return "0";
  return d > 0 ? `+${d}` : String(d);
}

export async function sendRegressionAlert(input: RegressionAlertInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping regression alert");
    return;
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "AccessiScan <alerts@accessiscan.app>";

  const scoreDelta = fmtDelta(input.previousScore, input.currentScore);
  const criticalDelta = fmtDelta(input.previousCritical, input.currentCritical);
  const seriousDelta = fmtDelta(input.previousSerious, input.currentSerious);

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <div style="background:#dc2626;color:#ffffff;padding:18px 22px">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.85">AccessiScan · regression alert</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px">Compliance score dropped on ${escapeHtml(input.siteLabel)}</div>
      </div>

      <div style="padding:22px">
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#334155">
          A new scan of <a href="${escapeHtml(input.siteUrl)}" style="color:#0f172a">${escapeHtml(input.siteUrl)}</a>
          shows a drop in WCAG conformance versus the last baseline. Numbers below.
        </p>

        <table role="presentation" style="width:100%;border-collapse:collapse;margin:6px 0 18px 0">
          <tr style="background:#f1f5f9">
            <th align="left" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Metric</th>
            <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Previous</th>
            <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Current</th>
            <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b">Delta</th>
          </tr>
          <tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0">Compliance score</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0">${input.previousScore}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;font-weight:600">${input.currentScore}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;color:#dc2626;font-weight:600">${scoreDelta}</td></tr>
          <tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0">Critical issues</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0">${input.previousCritical}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;font-weight:600">${input.currentCritical}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;color:#dc2626;font-weight:600">${criticalDelta}</td></tr>
          <tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0">Serious issues</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0">${input.previousSerious}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;font-weight:600">${input.currentSerious}</td>
            <td align="right" style="padding:10px 12px;border-top:1px solid #e2e8f0;color:#dc2626;font-weight:600">${seriousDelta}</td></tr>
        </table>

        <a href="${escapeHtml(input.scanDashboardUrl)}" style="display:inline-block;background:#0b1f3a;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
          Open scan report
        </a>

        <p style="margin:22px 0 0 0;font-size:12px;line-height:1.5;color:#64748b">
          You configured this alert for the site above. Disable or adjust the
          regression threshold from your AccessiScan dashboard &rarr; Monitored sites.
        </p>
      </div>
    </div>
  </body>
</html>`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.toEmail,
    subject: `[AccessiScan] ${input.siteLabel} score dropped ${scoreDelta}`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

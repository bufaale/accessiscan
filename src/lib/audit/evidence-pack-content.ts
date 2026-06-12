import type { WcagFreeIssue } from "@/lib/free-scan/lite-scanner";

/**
 * Legal Evidence Pack content builders. Copy is the ship-approved wording from
 * the legal-compliance gate (FTC accessiBe precedent): documents good-faith
 * action, NEVER claims compliance/protection. Do not edit the legal sentences
 * without re-running the legal gate.
 */

export interface EvidenceMeta {
  url: string;
  scannedAtUtc: string; // ISO 8601 UTC
  hash: string; // SHA-256 hex
  verifyUrl: string;
}

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function domainOf(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Group issues into the 30/60/90-day plan by severity. */
export function remediationBuckets(issues: WcagFreeIssue[]) {
  const d30 = issues.filter((i) => i.severity === "critical");
  const d60 = issues.filter((i) => i.severity === "serious");
  const d90 = issues.filter((i) => i.severity === "moderate");
  return { d30, d60, d90 };
}

/** Build the full Evidence Pack as HTML + plain-text sections for the delivery email. */
export function buildEvidencePack(meta: EvidenceMeta, issues: WcagFreeIssue[]): { html: string; text: string } {
  const { d30, d60, d90 } = remediationBuckets(issues);
  const org = domainOf(meta.url);
  const dateOnly = meta.scannedAtUtc.slice(0, 10);

  const bucketHtml = (title: string, list: WcagFreeIssue[]) =>
    `<p style="margin:10px 0 4px"><strong>${esc(title)}</strong></p>` +
    (list.length
      ? `<ul style="margin:0 0 8px;padding-left:18px;font-size:13px;color:#334155">${list
          .map((i) => `<li>${esc(i.rule)}${i.wcag_ref ? ` <span style="color:#94a3b8">(${esc(i.wcag_ref)})</span>` : ""} — ${i.count}×</li>`)
          .join("")}</ul>`
      : `<p style="margin:0 0 8px;font-size:13px;color:#64748b">None in this tier.</p>`);

  const html = `
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
<h2 style="font-size:16px;margin:0 0 4px">Verifiable audit record</h2>
<div style="font-size:13px;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;line-height:1.6">
  <div>Scanned: <strong>${esc(meta.scannedAtUtc)}</strong> (UTC)</div>
  <div>SHA-256: <code style="font-size:11px;word-break:break-all">${esc(meta.hash)}</code></div>
  <div>Verify independently: <a href="${esc(meta.verifyUrl)}">${esc(meta.verifyUrl)}</a></div>
  <div style="margin-top:8px;color:#64748b;font-size:12px">This record confirms the audit file was generated on the date shown and has not been altered since. It does not confirm that the website meets WCAG 2.1 AA, satisfies ADA Title III, or is free from accessibility barriers.</div>
</div>

<h2 style="font-size:16px;margin:22px 0 4px">Your 30 / 60 / 90-day remediation plan</h2>
${bucketHtml("First 30 days — critical issues", d30)}
${bucketHtml("By 60 days — serious issues", d60)}
${bucketHtml("By 90 days — moderate issues", d90)}

<h2 style="font-size:16px;margin:22px 0 4px">Draft accessibility statement (publish at ${esc(org)}/accessibility)</h2>
<div style="font-size:13px;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;line-height:1.55">
<p style="margin:0 0 8px"><strong>Accessibility Statement</strong></p>
<p style="margin:0 0 8px">${esc(org)} is committed to ensuring digital accessibility for people with disabilities and to continuously improving the user experience for all visitors to ${esc(meta.url)}.</p>
<p style="margin:0 0 8px"><strong>Our current status.</strong> We conducted an automated accessibility scan of ${esc(meta.url)} on ${esc(dateOnly)} against WCAG 2.1 Level AA. Automated tools identify a portion of potential accessibility barriers; a full conformance evaluation also requires manual testing by assistive-technology users.</p>
<p style="margin:0 0 8px"><strong>Remediation in progress.</strong> We are actively working to address the barriers identified, with milestones at 30, 60, and 90 days from ${esc(dateOnly)}, and will update this statement as issues are resolved.</p>
<p style="margin:0 0 8px"><strong>Feedback.</strong> If you encounter a barrier, contact us at [CONTACT_EMAIL]; we aim to respond within [X] business days.</p>
<p style="margin:0">This statement describes our current efforts and our commitment to ongoing improvement. It does not represent a declaration that ${esc(meta.url)} fully conforms to WCAG 2.1 Level AA at this time.</p>
</div>

<h2 style="font-size:16px;margin:22px 0 4px">Demand-letter response template</h2>
<p style="font-size:12px;color:#b91c1c;margin:0 0 6px"><strong>DRAFT — FOR ATTORNEY REVIEW ONLY. DO NOT SEND WITHOUT QUALIFIED LEGAL COUNSEL.</strong></p>
<div style="font-size:13px;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;line-height:1.55">
<p style="margin:0 0 8px">Re: [CLAIMANT] v. ${esc(org)} — Accessibility Demand Letter dated [DEMAND_DATE]</p>
<p style="margin:0 0 8px">${esc(org)} takes accessibility seriously and has been actively engaged in remediation. On ${esc(dateOnly)}, ${esc(org)} commissioned an automated accessibility audit of ${esc(meta.url)} (report hash ${esc(meta.hash.slice(0, 16))}…, independently verifiable at ${esc(meta.verifyUrl)}). That audit identified items for remediation, and ${esc(org)} adopted a written 30/60/90-day remediation plan, enclosed.</p>
<p style="margin:0 0 8px">Nothing in this letter constitutes an admission of liability or a representation that ${esc(meta.url)} is fully conformant with WCAG 2.1 Level AA, the ADA, Section 508, or any other statute. The audit documentation is provided to demonstrate ${esc(org)}'s good-faith effort to identify and address barriers.</p>
<p style="margin:0;color:#b91c1c;font-size:12px"><strong>This draft was prepared as a starting-point template only. It is not legal advice and must be reviewed and approved by your qualified legal counsel before it is sent.</strong></p>
</div>

<p style="margin-top:20px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;font-size:12px;color:#78350f;line-height:1.5">
This report was generated by AccessiScan automated scanning tools and covers approximately 30–40% of WCAG 2.1 AA success criteria; the remaining criteria require manual expert review. It documents the conformance status of the pages scanned on the date shown and is intended to evidence a good-faith remediation effort, not to certify legal compliance with the ADA, Section 508, or any other statute. AccessiScan is a software tool, not a law firm; nothing here constitutes legal advice. The organization commissioning this report remains solely responsible for the accessibility of its digital properties.
</p>`;

  const text = `--- VERIFIABLE AUDIT RECORD ---
Scanned: ${meta.scannedAtUtc} (UTC)
SHA-256: ${meta.hash}
Verify independently: ${meta.verifyUrl}
(Confirms the audit file existed on this date and is unaltered. Does NOT confirm the site meets WCAG 2.1 AA or the ADA.)

--- 30/60/90-DAY REMEDIATION PLAN ---
First 30 days (critical): ${d30.map((i) => `${i.rule} (${i.count}x)`).join("; ") || "none"}
By 60 days (serious): ${d60.map((i) => `${i.rule} (${i.count}x)`).join("; ") || "none"}
By 90 days (moderate/minor): ${d90.map((i) => `${i.rule} (${i.count}x)`).join("; ") || "none"}

--- DRAFT ACCESSIBILITY STATEMENT (publish at ${org}/accessibility) ---
${org} is committed to digital accessibility and to continuously improving ${meta.url}. We conducted an automated WCAG 2.1 AA scan on ${dateOnly}; automated tools identify a portion of barriers and full evaluation also needs manual testing. We are remediating with 30/60/90-day milestones. Feedback: [CONTACT_EMAIL]. This statement does not declare full WCAG 2.1 AA conformance at this time.

--- DEMAND-LETTER RESPONSE TEMPLATE (DRAFT — FOR ATTORNEY REVIEW ONLY) ---
Re: Accessibility demand letter. ${org} commissioned an automated audit of ${meta.url} on ${dateOnly} (hash ${meta.hash.slice(0, 16)}..., verifiable at ${meta.verifyUrl}) and adopted a 30/60/90-day remediation plan. Nothing herein is an admission of liability or a representation of full conformance. Provided to demonstrate good-faith effort. THIS IS NOT LEGAL ADVICE; your attorney must review and approve before sending.

SCOPE: automated scan covers ~30-40% of WCAG 2.1 AA; the rest needs manual review. Documents good-faith effort, not a certificate of compliance. Not legal advice.`;

  return { html, text };
}

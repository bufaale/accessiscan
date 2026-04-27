"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: 'What does "WCAG 2.1 AA" actually mean for my site?',
    a: "WCAG 2.1 AA is the conformance level the U.S. Department of Justice cites in the April 2024 Title II Final Rule. It covers 50 success criteria — text contrast, keyboard navigation, alt-text on images, ARIA roles, focus order, captioning. It's also what Section 508 and EN 301 549 reference. AccessiScan tests against all 50 with axe-core plus AI vision for criteria code-only scanners can't see.",
  },
  {
    q: "Does an overlay widget make me compliant?",
    a: 'No. The FTC fined accessiBe $1M in 2025 for deceptive "fully compliant" claims. Overlays don\'t fix source-level violations — they layer JavaScript over them. 22.6% of 2025 ADA digital lawsuits explicitly named overlay providers. Plaintiffs argue overlays interfere with screen readers users already configured. AccessiScan fixes the source; the audit trail lives in your repo.',
  },
  {
    q: "What is a VPAT 2.5 and why do I need one?",
    a: "A Voluntary Product Accessibility Template is the document procurement officers, GSA contractors, and Section 508 buyers ask for in RFPs. Version 2.5 maps each requirement to A, AA, Section 508, and EN 301 549. We generate yours from your latest scan — the export is signed, dated, and includes remediation status per criterion.",
  },
  {
    q: "How does the Auto-Fix PR work?",
    a: "Install the AccessiScan GitHub App on your repo. We scan, identify safe-to-auto-fix issues (alt-text, lang attrs, link/button names, ARIA labels, contrast tweaks), and open a Pull Request with isolated commits per violation. Branch protection, CODEOWNERS, and required reviewers are respected. The bot re-runs the scan in CI before requesting review.",
  },
  {
    q: "Can the AI break my code?",
    a: 'Auto-fix is scoped to a conservative ruleset where the safe edit is mechanical. Anything ambiguous (e.g. "is this image decorative or content?") is filed as an issue, not a PR. Every diff has citations to the WCAG criterion and a human-readable explanation. You merge only what you review.',
  },
  {
    q: "How is this different from Siteimprove or Deque axe?",
    a: "Siteimprove starts at $15,000/yr and is an enterprise audit dashboard — no fix code, no PRs. Deque axe is a great open-source rule engine (we use it), but it's a library, not a workflow. AccessiScan is the workflow on top: scan → fix code → VPAT → CI gate, from $19/mo.",
  },
  {
    q: "Is AccessiScan suitable for a public entity under Title II?",
    a: "Yes. Public entities with populations of 50,000+ must meet WCAG 2.1 AA by April 26, 2027; smaller entities by April 26, 2028. Our Government tier includes FedRAMP-aligned hosting, SSO + audit logs, Section 508 reports, and a dedicated CSM. Existing customers include several state and municipal IT shops (under NDA pending procurement).",
  },
  {
    q: "What does AccessiScan not warrant?",
    a: "Legal compliance. Accessibility law is fact-specific and jurisdiction-dependent. We provide evidence — scans, fix code, signed VPATs — that's defensible in audit and procurement. For legal opinions, retain qualified counsel.",
  },
];

function PlusIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section
      id="faq"
      style={{
        background: "#fff",
        padding: "96px 32px",
        fontFamily: "var(--font-inter), sans-serif",
        borderTop: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 64,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#06b6d4",
            }}
          >
            Frequently asked
          </span>
          <h2
            style={{
              marginTop: 12,
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 600,
              fontSize: 38,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0b1f3a",
            }}
          >
            Questions procurement asks first.
          </h2>
          <p
            style={{
              marginTop: 16,
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            If you&apos;re filing a VPAT next quarter or briefing in-house counsel on Title II,
            start here. Need something specific?{" "}
            <a
              href="mailto:legal@accessiscan.piposlab.com"
              style={{ color: "#0b1f3a", fontWeight: 600 }}
            >
              Email our compliance team
            </a>
            .
          </p>
        </div>
        <div style={{ borderTop: "1px solid #e2e8f0" }}>
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "20px 4px",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-inter), sans-serif",
                    color: "#0b1f3a",
                  }}
                >
                  <span style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#06b6d4",
                        minWidth: 28,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontSize: 17,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {it.q}
                    </span>
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#fff" : "#0b1f3a",
                      background: isOpen ? "#0b1f3a" : "#fff",
                    }}
                  >
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 4px 22px 60px",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: "#475569",
                    }}
                  >
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

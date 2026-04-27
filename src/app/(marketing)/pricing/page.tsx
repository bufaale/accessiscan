import type { Metadata } from "next";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { PricingCards } from "./client-pricing-cards";
import { PricingFaq } from "./client-pricing-faq";

export const metadata: Metadata = {
  title: "AccessiScan Pricing — Start free, scale to government",
  description:
    "Transparent pricing for the AccessiScan WCAG 2.1 AA scanner. Free forever tier, Pro from $19/mo, Agency from $49/mo, Business from $299/mo. VPAT 2.5 exports, Auto-Fix PRs, and CI/CD on every paid plan.",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const SLATE_500 = "#64748b";

// ---------- Icons ----------

function IconCheck({ size = 16, sw = 2.5, color, style }: { size?: number; sw?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX({ size = 16, sw = 2, color, style }: { size?: number; sw?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMinus({ size = 16, sw = 2, color, style }: { size?: number; sw?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// ---------- Eyebrow ----------

function Eyebrow({ children, color = "slate" }: { children: ReactNode; color?: "slate" | "cyan" | "cyan-pill" }) {
  if (color === "cyan-pill") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          border: "1px solid rgba(6,182,212,.40)",
          background: "rgba(6,182,212,.10)",
          borderRadius: 4,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: CYAN }} />
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            // cyan700 (#0e7490) keeps brand teal but passes AA on the light
            // cyan-pill background (5.66:1 vs 4.5 required). CYAN (#06b6d4)
            // fails at 2.21:1.
            color: "#0e7490",
          }}
        >
          {children}
        </span>
      </span>
    );
  }
  return (
    <span
      style={{
        fontFamily: FONT_INTER,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color === "cyan" ? "#0e7490" : SLATE_500,
      }}
    >
      {children}
    </span>
  );
}

// ---------- Hero / Header ----------

function PricingHeader() {
  const trustSignals = [
    "14-day Pro trial",
    "30-day money-back guarantee",
    "Cancel anytime",
    "Pay by card, ACH, or PO",
  ];
  return (
    <section
      style={{
        background: "#fff",
        padding: "80px 32px 56px",
        borderBottom: "1px solid #e2e8f0",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow color="cyan-pill">Pricing built for the DOJ deadline</Eyebrow>
        <h1
          style={{
            marginTop: 22,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 60,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            color: NAVY,
            maxWidth: 920,
            marginInline: "auto",
          }}
        >
          Start free, scale to government.
        </h1>
        <p
          style={{
            marginTop: 22,
            maxWidth: 680,
            marginInline: "auto",
            fontSize: 18,
            lineHeight: 1.55,
            color: "#475569",
          }}
        >
          One scanner. Five tiers. Transparent monthly pricing — no annual lock-in,
          no per-seat surcharge, and a free forever tier so you can prove it works
          before you pay.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "inline-flex",
            flexWrap: "wrap",
            gap: "8px 22px",
            fontSize: 13,
            color: SLATE_500,
            justifyContent: "center",
          }}
        >
          {trustSignals.map((t) => (
            <span
              key={t}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconCheck size={14} sw={2.5} color={CYAN} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Comparison table (capability x competitor) ----------

type CellValue = "yes" | "no" | "partial" | string;

function ComparisonCell({ v }: { v: CellValue }) {
  if (v === "yes") return <IconCheck size={16} color={CYAN} />;
  if (v === "no") return <IconX size={16} color="#cbd5e1" />;
  if (v === "partial") return <IconMinus size={16} color="#94a3b8" />;
  return <span style={{ fontSize: 13, color: "#475569" }}>{v}</span>;
}

function VendorComparison() {
  const tools = ["AccessiScan", "accessiBe", "UserWay", "Siteimprove", "Deque axe"];
  const sections: Array<{
    title: string;
    rows: Array<{ label: string; values: CellValue[] }>;
  }> = [
    {
      title: "Pricing & terms",
      rows: [
        { label: "Starting price", values: ["$19/mo", "$49/mo", "$49/mo", "$15,000/yr", "$45/user/mo"] },
        { label: "Monthly billing", values: ["yes", "yes", "yes", "no", "yes"] },
        { label: "Free tier", values: ["yes", "no", "no", "no", "partial"] },
        { label: "30-day money back", values: ["yes", "no", "no", "no", "no"] },
      ],
    },
    {
      title: "Compliance & reporting",
      rows: [
        { label: "WCAG 2.1 AA scan", values: ["yes", "partial", "partial", "yes", "yes"] },
        { label: "VPAT 2.5 export", values: ["yes", "no", "no", "yes", "no"] },
        { label: "Section 508 reports", values: ["yes", "no", "no", "yes", "no"] },
        { label: "PDF accessibility scan", values: ["yes", "no", "no", "yes", "no"] },
      ],
    },
    {
      title: "Engineering integrations",
      rows: [
        { label: "Auto-Fix Pull Requests", values: ["yes", "no", "no", "no", "no"] },
        { label: "GitHub Action (CI/CD)", values: ["yes", "no", "no", "no", "partial"] },
        { label: "Source-code patches", values: ["yes", "no", "no", "no", "no"] },
        { label: "REST API", values: ["yes", "no", "no", "yes", "yes"] },
      ],
    },
  ];

  return (
    <section
      style={{
        background: "#fff",
        padding: "96px 32px",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">Competitive landscape</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 40,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: NAVY,
            }}
          >
            How AccessiScan compares.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>
            Compiled April 2026 from public pricing pages. We update this table quarterly.
          </p>
        </div>
        <div
          style={{
            marginTop: 40,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    fontSize: 11,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: SLATE_500,
                    fontWeight: 600,
                    width: "26%",
                  }}
                >
                  Capability
                </th>
                {tools.map((tool, i) => (
                  <th
                    key={tool}
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: i === 0 ? NAVY : SLATE_500,
                      fontWeight: 700,
                      background: i === 0 ? "rgba(236,254,255,0.5)" : "transparent",
                      boxShadow: i === 0 ? `inset 3px 0 0 ${CYAN}` : "none",
                    }}
                  >
                    {tool}
                    {i === 0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: NAVY,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                        }}
                      >
                        US
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr style={{ background: "#fff" }}>
                    <td
                      colSpan={6}
                      style={{
                        padding: "18px 20px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: CYAN,
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, ri) => (
                    <tr
                      key={`${section.title}-${row.label}`}
                      style={{
                        borderBottom:
                          ri === section.rows.length - 1 ? "none" : "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "14px 20px", color: "#334155", fontWeight: 500 }}>
                        {row.label}
                      </td>
                      {row.values.map((v, ci) => (
                        <td
                          key={`${section.title}-${row.label}-${ci}`}
                          style={{
                            padding: "14px 20px",
                            background: ci === 0 ? "rgba(236,254,255,0.4)" : "transparent",
                            boxShadow: ci === 0 ? `inset 3px 0 0 ${CYAN}` : "none",
                            fontWeight: ci === 0 ? 600 : 400,
                            color: ci === 0 ? NAVY : "#475569",
                          }}
                        >
                          <ComparisonCell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ---------- Universal "every plan includes" grid ----------

function UniversalFeatures() {
  const features = [
    {
      title: "WCAG 2.1 AA scanner",
      detail:
        "All A and AA success criteria, refreshed monthly as the W3C ships errata.",
    },
    {
      title: "axe-core engine",
      detail:
        "The same engine Microsoft and Google audit with — battle-tested across millions of pages.",
    },
    {
      title: "Unlimited team members",
      detail:
        "No per-seat pricing on the SaaS tiers. Invite your engineers, designers, PMs, and counsel.",
    },
    {
      title: "Encrypted at rest & in transit",
      detail:
        "AES-256 at rest, TLS 1.3 in transit. Scan data isolated per tenant.",
    },
    {
      title: "DOJ Title II readiness flag",
      detail:
        "Every scan surfaces the criteria that map to public-entity Title II obligations.",
    },
    {
      title: "Export everything",
      detail:
        "PDF, CSV, JSON, and VPAT 2.5 (paid plans). Your data, your compliance evidence.",
    },
    {
      title: "Stripe-secured checkout",
      detail:
        "PCI-DSS handled by Stripe. No card data ever touches our servers.",
    },
    {
      title: "Self-service cancellation",
      detail:
        "Cancel from Settings → Billing. We retain scan history for 90 days post-cancellation.",
    },
  ];
  return (
    <section
      style={{
        background: "#f8fafc",
        padding: "96px 32px",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">Every plan, including Free</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 40,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: NAVY,
            }}
          >
            What&apos;s included in every plan.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>
            The compliance basics aren&apos;t gated behind upgrade tiers. If it&apos;s
            foundational to a credible WCAG audit, it ships on Free.
          </p>
        </div>
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 1,
            background: "#e2e8f0",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#fff",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "#ecfeff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={16} color={CYAN} />
              </span>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 16,
                  color: NAVY,
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>
                {f.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Government callout ----------

function GovernmentCallout() {
  const badges = ["SOC 2 Type II (in progress)", "Section 508", "EN 301 549", "WCAG 2.1 AA"];
  return (
    <section
      style={{
        background: NAVY,
        color: "#fff",
        padding: "80px 32px",
        fontFamily: FONT_INTER,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          <Eyebrow color="cyan-pill">For public entities & federal contractors</Eyebrow>
          <h2
            style={{
              marginTop: 22,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 42,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Procurement-ready on the{" "}
            <span style={{ color: CYAN }}>Team tier.</span>
          </h2>
          <p
            style={{
              marginTop: 22,
              maxWidth: 560,
              fontSize: 16,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            The Team tier ships with SSO (SAML 2.0), audit log streaming,
            org-wide policy enforcement, and a dedicated customer success
            manager. Net-30 / net-60 invoice terms available for state and
            federal procurement.
          </p>
          <ul
            style={{
              marginTop: 24,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              "SSO via SAML 2.0 + audit log export (SIEM-ready)",
              "Section 508 quarterly reports, RFP-ready",
              "Net-30 / net-60 PO terms available",
              "Auto-Fix PRs across all repos in your org",
              "Dedicated customer success manager",
              "Up to 50 monitored properties",
            ].map((t) => (
              <li
                key={t}
                style={{ display: "flex", gap: 10, fontSize: 14.5, color: "rgba(255,255,255,0.85)" }}
              >
                <IconCheck
                  size={18}
                  color={CYAN}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                {t}
              </li>
            ))}
          </ul>
          <div
            style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <a
              href="mailto:alex@piposlab.com?subject=AccessiScan%20Team%20tier"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                padding: "0 22px",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FONT_INTER,
                borderRadius: 8,
                textDecoration: "none",
                background: "#dc2626",
                color: "#fff",
              }}
            >
              Talk to government sales
            </a>
          </div>
        </div>

        <aside
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            padding: 28,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 600,
            }}
          >
            Team tier · From $599/mo
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 28,
              color: "#fff",
            }}
          >
            Annual contract <span style={{ color: CYAN }}>$5,990/yr</span>
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Up to 50 monitored properties · unlimited admins
          </div>

          <div style={{ marginTop: 22 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 12,
              }}
            >
              Procurement-ready
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {badges.map((b) => (
                <span
                  key={b}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    padding: "5px 10px",
                    border: "1px solid rgba(255,255,255,0.20)",
                    borderRadius: 4,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 22,
              borderTop: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 12,
              }}
            >
              Typical procurement timeline
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {[
                ["Week 1", "Discovery call · scoping"],
                ["Week 2", "Security review · DPA"],
                ["Week 3", "PO issued · tenant provisioned"],
                ["Week 4", "Onboarding · first scan live"],
              ].map(([w, l]) => (
                <div
                  key={w}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      color: CYAN,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {w}
                  </span>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ---------- Page composition ----------

export default function PricingPage() {
  return (
    <div
      data-screen-label="AccessiScan Pricing"
      style={{ background: "#fff", color: NAVY }}
    >
      <PricingHeader />
      <PricingCards />
      <UniversalFeatures />
      <VendorComparison />
      <GovernmentCallout />
      <PricingFaq />
    </div>
  );
}

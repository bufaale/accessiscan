"use client";

import React, { useState, type CSSProperties, type ReactNode } from "react";

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Icons
// ============================================================
type IcProps = { size?: number; sw?: number; style?: CSSProperties };
const wrap = (children: ReactNode, p: IcProps, fill: string = "none") => (
  <svg
    width={p.size ?? 16}
    height={p.size ?? 16}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={p.sw ?? 1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={p.style}
    aria-hidden
  >
    {children}
  </svg>
);

const IcShield = (p: IcProps) => wrap(<path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />, p);
const IcArrow = (p: IcProps) => wrap(<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>, p);
const IcCheck = (p: IcProps) => wrap(<polyline points="20 6 9 17 4 12" />, p);
const IcX = (p: IcProps) => wrap(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, p);
const IcMinus = (p: IcProps) => wrap(<><circle cx="12" cy="12" r="9" /><line x1="8" y1="12" x2="16" y2="12" /></>, p);
const IcAlert = (p: IcProps) => wrap(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, p);
const IcPlus = (p: IcProps) => wrap(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, p);

// ============================================================
// Logo
// ============================================================
function Logo({ dark = false, size = "md" }: { dark?: boolean; size?: "md" | "lg" }) {
  const dim = size === "lg" ? { tile: 32, ic: 18, font: 22, gap: 10 } : { tile: 24, ic: 14, font: 18, gap: 8 };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dim.gap,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: dim.font,
        letterSpacing: "-0.01em",
        color: dark ? "#fff" : "#0b1f3a",
      }}
    >
      <span
        style={{
          width: dim.tile,
          height: dim.tile,
          borderRadius: 6,
          background: "#06b6d4",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <IcShield size={dim.ic} sw={2.5} />
      </span>
      AccessiScan
    </div>
  );
}

// ============================================================
// Eyebrow
// ============================================================
type EyebrowColor = "slate" | "cyan" | "cyan-pill";
function Eyebrow({ children, color = "slate" }: { children: ReactNode; color?: EyebrowColor }) {
  if (color === "cyan-pill") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          border: "1px solid rgba(6,182,212,0.40)",
          background: "rgba(6,182,212,0.10)",
          borderRadius: 4,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
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
        color: color === "cyan" ? "#06b6d4" : "#64748b",
      }}
    >
      {children}
    </span>
  );
}

// ============================================================
// Buttons
// ============================================================
type BtnVariant = "primary" | "urgent" | "outline" | "outline-dark" | "white" | "ghost";
type BtnSize = "sm" | "md" | "lg";
function Btn({
  children,
  variant = "primary",
  size = "md",
  href,
  leadIcon,
  trailIcon,
  style,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  href?: string;
  leadIcon?: ReactNode;
  trailIcon?: ReactNode;
  style?: CSSProperties;
}) {
  const sizes: Record<BtnSize, { h: number; px: number; fs: number }> = {
    lg: { h: 48, px: 22, fs: 15 },
    md: { h: 40, px: 16, fs: 14 },
    sm: { h: 32, px: 12, fs: 13 },
  };
  const s = sizes[size];
  const variants: Record<BtnVariant, { bg: string; color: string; border: string }> = {
    primary: { bg: "#0b1f3a", color: "#fff", border: "none" },
    urgent: { bg: "#dc2626", color: "#fff", border: "none" },
    outline: { bg: "#fff", color: "#0b1f3a", border: "1px solid #cbd5e1" },
    "outline-dark": { bg: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" },
    white: { bg: "#fff", color: "#0b1f3a", border: "none" },
    ghost: { bg: "transparent", color: "#0b1f3a", border: "none" },
  };
  const v = variants[variant];
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: s.h,
    padding: `0 ${s.px}px`,
    fontSize: s.fs,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 8,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all .15s ease",
    background: v.bg,
    color: v.color,
    border: v.border,
    ...style,
  };
  if (href) {
    return (
      <a href={href} style={baseStyle}>
        {leadIcon}
        {children}
        {trailIcon}
      </a>
    );
  }
  return (
    <button type="button" style={baseStyle}>
      {leadIcon}
      {children}
      {trailIcon}
    </button>
  );
}

// ============================================================
// DOJ Banner
// ============================================================
function DojBanner() {
  const cells: ReadonlyArray<readonly [string, string]> = [
    ["365", "Days"],
    ["07", "Hrs"],
    ["42", "Min"],
    ["18", "Sec"],
  ];
  return (
    <div
      style={{
        background: "#dc2626",
        color: "#fff",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        fontFamily: FONT_INTER,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IcAlert size={18} sw={2} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>DOJ Title II Web Accessibility Deadline</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)" }}>Public entities with 50,000+ residents</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, fontFamily: FONT_MONO }}>
        {cells.map(([n, l], i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36 }}>
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</span>
              <span
                style={{
                  fontSize: 8.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 2,
                }}
              >
                {l}
              </span>
            </span>
            {i < cells.length - 1 && <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>}
          </span>
        ))}
      </div>
      <Btn size="sm" variant="white" trailIcon={<IcArrow size={12} sw={2.5} />} style={{ color: "#7f1d1d" }}>
        Scan for Title II violations
      </Btn>
    </div>
  );
}

// ============================================================
// Pricing Navbar
// ============================================================
function PricingNavbar() {
  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#475569", fontWeight: 500 }}>
          <a style={{ color: "#475569", textDecoration: "none" }}>Product</a>
          <a style={{ color: "#475569", textDecoration: "none" }}>Compare</a>
          <a
            style={{
              color: "#0b1f3a",
              textDecoration: "none",
              fontWeight: 600,
              position: "relative",
            }}
          >
            Pricing
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -19,
                height: 2,
                background: "#06b6d4",
              }}
            />
          </a>
          <a style={{ color: "#475569", textDecoration: "none" }}>For government</a>
          <a style={{ color: "#475569", textDecoration: "none" }}>Docs</a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Btn variant="ghost" size="sm">
          Sign in
        </Btn>
        <Btn variant="primary" size="sm" trailIcon={<IcArrow size={12} sw={2.5} />}>
          Free scan
        </Btn>
      </div>
    </nav>
  );
}

// ============================================================
// Pricing Header
// ============================================================
function PricingHeader() {
  const trustItems = [
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
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: "#0b1f3a",
            maxWidth: 920,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Start free, scale to government.
        </h1>
        <p
          style={{
            marginTop: 22,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: 18,
            lineHeight: 1.55,
            color: "#475569",
          }}
        >
          One scanner. Three tiers. Transparent monthly pricing — no annual lock-in, no per-seat surcharge, no &ldquo;call us&rdquo;
          gate before $10K/yr.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "inline-flex",
            flexWrap: "wrap",
            gap: "8px 22px",
            fontSize: 13,
            color: "#64748b",
            justifyContent: "center",
          }}
        >
          {trustItems.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IcCheck size={14} sw={2.5} style={{ color: "#0e7490" }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Pricing Cards Detailed
// ============================================================
type Billing = "monthly" | "annual";
type TierFeature = { label: string; detail: string };
type Tier = {
  name: string;
  tagline: string;
  price: Record<Billing, string>;
  per: string;
  cta: string;
  ctaVariant: BtnVariant;
  popular?: boolean;
  features: TierFeature[];
  excluded?: string[];
};

function PricingCardsDetailed() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const tiers: Tier[] = [
    {
      name: "Free",
      tagline: "Kick the tires. No card.",
      price: { monthly: "$0", annual: "$0" },
      per: "/forever",
      cta: "Start free scan",
      ctaVariant: "outline",
      features: [
        { label: "1 site · 2 scans/month", detail: "Up to 500 pages per scan" },
        { label: "WCAG 2.1 AA scanner", detail: "axe-core engine + 30+ AccessiScan rules" },
        { label: "PDF report export", detail: "Branded with your logo, public-share link" },
        { label: "Issue table & code snippets", detail: "View violations, locations, suggested fixes" },
        { label: "Community support", detail: "GitHub Discussions + public docs" },
      ],
      excluded: ["Auto-Fix PR (GitHub)", "VPAT 2.5 export", "CI/CD action", "Continuous monitoring"],
    },
    {
      name: "Pro",
      tagline: "The plan that ships fixes.",
      price: { monthly: "$19", annual: "$15" },
      per: "/mo",
      cta: "Start 14-day trial",
      ctaVariant: "primary",
      popular: true,
      features: [
        { label: "10 sites · unlimited scans", detail: "Up to 25,000 pages per site" },
        { label: "Everything in Free, plus —", detail: "All scanner rules, all report formats" },
        {
          label: "Auto-Fix PR for GitHub",
          detail: "Claude-written patches for alt-text, ARIA, lang, link/button names",
        },
        {
          label: "VPAT 2.5 export",
          detail: "Mapped to A and AA — for procurement, RFPs, Section 508 officers",
        },
        { label: "GitHub Action for CI/CD", detail: "Fail builds on critical/serious violations" },
        { label: "Continuous monitoring", detail: "Weekly re-scans + Slack/email alerts on regressions" },
        { label: "PDF document scanning", detail: "Tag-tree analysis, reading-order checks" },
        { label: "Email support · 24h SLA", detail: "Senior a11y engineer on every ticket" },
      ],
    },
    {
      name: "Agency",
      tagline: "For shops billing remediation.",
      price: { monthly: "$49", annual: "$39" },
      per: "/mo",
      cta: "Start 14-day trial",
      ctaVariant: "outline",
      features: [
        { label: "Unlimited sites · unlimited scans", detail: "Across all client tenants" },
        { label: "Everything in Pro, plus —", detail: "All Pro features for every client workspace" },
        {
          label: "White-label PDF reports",
          detail: "Your logo, your domain, your colors on the share page",
        },
        {
          label: "Multi-client workspace",
          detail: "Separate tenants, billing, and team members per client",
        },
        {
          label: "Bulk VPAT generation",
          detail: "Generate 10 VPATs at a time — perfect for state-contract bids",
        },
        { label: "API access · 10K calls/day", detail: "Wire scans into your own dashboards" },
        { label: "Priority email + chat support", detail: "4h SLA, named senior engineer" },
        { label: "Quarterly compliance review", detail: "Live call with our DOJ-specialist counsel" },
      ],
    },
  ];

  const billingOptions: Billing[] = ["monthly", "annual"];

  return (
    <section style={{ background: "#f8fafc", padding: "72px 32px 96px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            {billingOptions.map((opt) => {
              const isActive = billing === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBilling(opt)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT_INTER,
                    fontSize: 13,
                    fontWeight: 600,
                    background: isActive ? "#0b1f3a" : "transparent",
                    color: isActive ? "#fff" : "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {opt === "monthly" ? "Monthly" : "Annual"}
                  {opt === "annual" && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: isActive ? "#06b6d4" : "#ecfeff",
                        color: isActive ? "#fff" : "#0891b2",
                      }}
                    >
                      Save 20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, alignItems: "stretch" }}>
          {tiers.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "32px 28px",
                borderTop: t.popular ? "3px solid #06b6d4" : "1px solid #e2e8f0",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {t.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: -1,
                    right: 24,
                    transform: "translateY(-50%)",
                    padding: "5px 12px",
                    background: "#0b1f3a",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: 4,
                  }}
                >
                  Most popular
                </span>
              )}
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#0b1f3a",
                  letterSpacing: "-0.01em",
                }}
              >
                {t.name}
              </div>
              <div style={{ marginTop: 6, fontSize: 13.5, color: "#64748b" }}>{t.tagline}</div>
              <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 52,
                    color: "#0b1f3a",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {t.price[billing]}
                </span>
                <span style={{ fontSize: 14, color: "#64748b" }}>{t.per}</span>
              </div>
              {billing === "annual" && t.price.annual !== "$0" && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                  billed annually · <span style={{ textDecoration: "line-through" }}>{t.price.monthly}/mo</span>
                </div>
              )}

              <Btn
                variant={t.ctaVariant}
                size="md"
                style={{ marginTop: 22, justifyContent: "center", width: "100%" }}
              >
                {t.cta}
              </Btn>

              <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    marginBottom: 14,
                  }}
                >
                  What&apos;s included
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {t.features.map((f) => (
                    <li key={f.label} style={{ display: "flex", gap: 10 }}>
                      <IcCheck
                        size={16}
                        sw={2.5}
                        style={{ color: "#0e7490", flexShrink: 0, marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", lineHeight: 1.4 }}>
                          {f.label}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2, lineHeight: 1.45 }}>
                          {f.detail}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {t.excluded && (
                  <ul
                    style={{
                      marginTop: 18,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {t.excluded.map((e) => (
                      <li key={e} style={{ display: "flex", gap: 10, fontSize: 12.5, color: "#94a3b8" }}>
                        <IcX
                          size={14}
                          sw={2}
                          style={{ color: "#cbd5e1", flexShrink: 0, marginTop: 3 }}
                        />
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#64748b" }}>
          All plans include unlimited team members. Need 100+ sites?{" "}
          <a href="#" style={{ color: "#0b1f3a", fontWeight: 600, textDecoration: "underline" }}>
            Talk to sales →
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Universal Features
// ============================================================
function UniversalFeatures() {
  const features = [
    {
      title: "WCAG 2.1 AA scanner",
      detail: "All A and AA success criteria, refreshed monthly as the W3C ships errata.",
    },
    {
      title: "axe-core engine + AI vision",
      detail:
        "The same engine Microsoft and Google audit with — plus our vision model for image-contrast and touch-target issues code-only scanners miss.",
    },
    {
      title: "Unlimited team members",
      detail:
        "No per-seat pricing. Invite your engineers, designers, PMs, and counsel at no extra cost.",
    },
    {
      title: "SOC 2 Type II hosting",
      detail:
        "AWS us-east-1 and us-west-2. Type II report available under NDA. Type II audit completes Q3 2026.",
    },
    {
      title: "Encrypted at rest & in transit",
      detail: "AES-256 at rest, TLS 1.3 in transit. Customer scan data isolated per tenant.",
    },
    {
      title: "DOJ Title II readiness check",
      detail:
        "Every scan includes a Title II readiness flag — surfaces the exact criteria that map to public-entity obligations.",
    },
    {
      title: "Export everything",
      detail:
        "PDF, CSV, JSON, SARIF, and VPAT 2.5 (Pro+). Your data, your compliance evidence — never locked in.",
    },
    {
      title: "Unaffected by legacy tech",
      detail:
        "Scans Next.js, WordPress, Drupal, Webflow, Squarespace, plain HTML, and PDFs. If it renders, we audit it.",
    },
  ];
  return (
    <section style={{ background: "#f8fafc", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">Every plan, including Free</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0b1f3a",
            }}
          >
            What&apos;s included in every plan.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>
            The compliance basics aren&apos;t gated behind upgrade tiers. If it&apos;s foundational to a credible WCAG audit, it ships in
            Free.
          </p>
        </div>
        <div
          style={{
            marginTop: 56,
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
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "#ecfeff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IcCheck size={18} sw={2.5} style={{ color: "#0e7490" }} />
              </span>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#0b1f3a",
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{f.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Vendor Comparison
// ============================================================
type CellValue = "yes" | "no" | "partial" | string;

function ComparisonCell({ v }: { v: CellValue }) {
  if (v === "yes") return <IcCheck size={16} sw={2.5} style={{ color: "#0e7490" }} />;
  if (v === "partial") return <IcMinus size={16} sw={2} style={{ color: "#94a3b8" }} />;
  if (v === "no") return <IcX size={16} sw={2} style={{ color: "#cbd5e1" }} />;
  return <span style={{ fontSize: 13, color: "#475569" }}>{v}</span>;
}

function VendorComparison() {
  const tools = ["AccessiScan", "accessiBe", "UserWay", "Siteimprove", "Deque axe"];
  type Row = { label: string; values: CellValue[] };
  type Section = { title: string; rows: Row[] };
  const sections: Section[] = [
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
    {
      title: "Approach",
      rows: [
        {
          label: "Approach",
          values: ["Source-code fixes", "Overlay widget", "Overlay widget", "Audit dashboard", "Dev tooling"],
        },
        { label: "FTC consent order history", values: ["no", "yes — $1M (2025)", "no", "no", "no"] },
        { label: "Lawsuit risk for buyer", values: ["Reduces", "Increases (22.6%)", "Increases", "Reduces", "Reduces"] },
      ],
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">Competitive landscape</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0b1f3a",
            }}
          >
            How AccessiScan compares.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>
            Compiled April 2026 from public pricing pages. We update this table quarterly — if a competitor&apos;s pricing has
            changed,{" "}
            <a href="#" style={{ color: "#0b1f3a", fontWeight: 600 }}>
              let us know
            </a>
            .
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
                    color: "#64748b",
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
                      color: i === 0 ? "#0b1f3a" : "#64748b",
                      fontWeight: 700,
                      background: i === 0 ? "rgba(236,254,255,0.5)" : "transparent",
                      boxShadow: i === 0 ? "inset 3px 0 0 #06b6d4" : "none",
                    }}
                  >
                    {tool}
                    {i === 0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: "#0b1f3a",
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
                <React.Fragment key={section.title}>
                  <tr style={{ background: "#fff" }}>
                    <td
                      colSpan={6}
                      style={{
                        padding: "18px 20px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#0e7490",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, ri) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: ri === section.rows.length - 1 ? "none" : "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "14px 20px", color: "#334155", fontWeight: 500 }}>{row.label}</td>
                      {row.values.map((v, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: "14px 20px",
                            background: ci === 0 ? "rgba(236,254,255,0.4)" : "transparent",
                            boxShadow: ci === 0 ? "inset 3px 0 0 #06b6d4" : "none",
                            fontWeight: ci === 0 ? 600 : 400,
                            color: ci === 0 ? "#0b1f3a" : "#475569",
                          }}
                        >
                          <ComparisonCell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Guarantee Strip
// ============================================================
function GuaranteeStrip() {
  const items = [
    {
      title: "14-day Pro trial",
      detail:
        "Full Pro feature set, no credit card. We email a reminder 3 days before it ends — no auto-charge surprises.",
    },
    {
      title: "30-day money back",
      detail:
        "Don't love it? Email billing@accessiscan.com within 30 days of upgrade. No forms, no exit interview.",
    },
    {
      title: "Cancel any time",
      detail:
        "Self-service from settings. We keep your data 90 days in case you come back, then it's deleted on request.",
    },
    {
      title: "Lock-in your rate",
      detail:
        "Annual subscribers keep their rate for the duration of their contract — even if list pricing rises.",
    },
  ];
  return (
    <section
      style={{
        background: "#fff",
        padding: "72px 32px",
        fontFamily: FONT_INTER,
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 32,
        }}
      >
        {items.map((it) => (
          <div key={it.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Eyebrow color="cyan">Promise</Eyebrow>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 22,
                color: "#0b1f3a",
                letterSpacing: "-0.01em",
              }}
            >
              {it.title}
            </div>
            <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{it.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Government Callout
// ============================================================
function GovernmentCallout() {
  const badges = ["FedRAMP-aligned", "SOC 2 Type II", "Section 508", "EN 301 549", "GovCloud-ready", "WCAG 2.1 AA"];
  const bullets = [
    "Dedicated AWS GovCloud tenant — no co-mingled data",
    "SSO via SAML 2.0 + audit log export (SIEM-ready)",
    "Section 508 quarterly reports, RFP-ready",
    "Net-30 / net-60 PO terms · GSA Schedule available",
    "Dedicated CSM with DOJ Title II expertise",
    "BAA signed for HIPAA-adjacent agencies",
  ];
  const timeline: ReadonlyArray<readonly [string, string]> = [
    ["Week 1", "Discovery call · scoping"],
    ["Week 2", "Security review · BAA / DPA"],
    ["Week 3", "PO issued · tenant provisioned"],
    ["Week 4", "Onboarding · first scan live"],
  ];
  return (
    <section
      style={{
        background: "#0b1f3a",
        color: "#fff",
        padding: "96px 32px",
        fontFamily: FONT_INTER,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
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
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <Eyebrow color="cyan-pill">For public entities &amp; federal contractors</Eyebrow>
          <h2
            style={{
              marginTop: 22,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 48,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Need FedRAMP-aligned hosting?
            <br />
            <span style={{ color: "#0e7490" }}>Talk to government sales.</span>
          </h2>
          <p
            style={{
              marginTop: 22,
              maxWidth: 560,
              fontSize: 17,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Our Government tier ships in single-tenant AWS GovCloud, with SSO (Okta · Azure AD · PIV/CAC), Section 508 reporting
            templates, BAA available, and net-30/net-60 invoice terms for procurement.
          </p>
          <ul
            style={{
              marginTop: 26,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {bullets.map((t) => (
              <li
                key={t}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14.5,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <IcCheck size={18} sw={2.5} style={{ color: "#0e7490", flexShrink: 0, marginTop: 2 }} />
                {t}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn variant="urgent" size="lg" trailIcon={<IcArrow size={16} sw={2.5} />}>
              Talk to government sales
            </Btn>
            <Btn variant="outline-dark" size="lg">
              Download capability statement
            </Btn>
          </div>
        </div>

        {/* RFP-style sidebar */}
        <aside
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            padding: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingBottom: 18,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 600,
                }}
              >
                Government tier · Custom
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 36,
                  color: "#fff",
                }}
              >
                Starts at <span style={{ color: "#0e7490" }}>$2,400</span>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.55)" }}>/mo</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Annual contract · 5 named admins included
              </div>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 14,
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

          <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 12,
              }}
            >
              Typical procurement timeline
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {timeline.map(([w, l]) => (
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
                      color: "#0e7490",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {w}
                  </span>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ============================================================
// Pricing FAQ
// ============================================================
function PricingFaq() {
  const [open, setOpen] = useState<number>(0);
  const items: { q: string; a: string }[] = [
    {
      q: "How does billing work?",
      a: "We bill monthly or annually via Stripe (Visa, Mastercard, Amex, ACH for US customers). Annual subscribers save 20% and lock in their rate for the contract term. Government and Agency customers can pay by purchase order with net-30 or net-60 terms — email billing@accessiscan.com to set up an invoice.",
    },
    {
      q: "Can I upgrade, downgrade, or cancel any time?",
      a: "Yes. Upgrades are pro-rated and take effect immediately. Downgrades take effect at the start of your next billing cycle — you keep paid features until then. Cancellation is self-service from Settings → Billing. We retain your scan history for 90 days post-cancellation; after that, all data is deleted on request.",
    },
    {
      q: "Do you offer refunds?",
      a: "Yes. Within 30 days of your first paid charge, email billing@accessiscan.com for a full refund — no forms, no exit interview. After 30 days, we pro-rate refunds for annual plans on a case-by-case basis. Government POs are governed by the terms of your contract.",
    },
    {
      q: "How are taxes handled?",
      a: "US sales tax is calculated automatically based on your billing address (we collect in 24 states + DC where required). EU/UK customers can supply a VAT ID at checkout for zero-rated invoicing under reverse charge. Canadian customers see GST/HST applied. All tax calculations follow Stripe Tax.",
    },
    {
      q: "What payment terms do you offer government and education buyers?",
      a: "We accept purchase orders with net-30 or net-60 terms for government, K-12, higher ed, and Fortune 500 finance teams. We're listed on GSA Schedule 70 (contract holder via Pipo Labs, Inc.) and can quote against state cooperative contracts. For sole-source justifications, request our capability statement from sales@accessiscan.com.",
    },
    {
      q: "What counts as a 'site' on Pro and Agency plans?",
      a: "A site is a single domain or sub-domain (e.g. acme.com or staging.acme.com). www and root resolve to the same site. Subdomains for marketing, app, and docs each count separately. PDFs hosted on a counted domain do not consume an extra slot.",
    },
    {
      q: "Is there a per-seat charge for team members?",
      a: "No. Every plan — including Free — includes unlimited team members. Invite your entire engineering, design, legal, and procurement orgs at no extra cost. The only seat-related limit is the named admin count on the Government tier (5 included; additional admins $400/yr each).",
    },
    {
      q: "Will my price increase at renewal?",
      a: "Monthly subscribers receive 60 days' notice before any list-price change takes effect on their account. Annual subscribers keep their original rate for the entire contract term, even if list pricing rises. Government customers' rates are governed by their contract.",
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow color="cyan">Pricing FAQ</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0b1f3a",
            }}
          >
            Questions about billing.
          </h2>
          <p style={{ marginTop: 18, fontSize: 16, color: "#475569" }}>
            Don&apos;t see yours? Email{" "}
            <a href="mailto:billing@accessiscan.com" style={{ color: "#0b1f3a", fontWeight: 600 }}>
              billing@accessiscan.com
            </a>{" "}
            — a real human replies within 24 hours.
          </p>
        </div>
        <div style={{ borderTop: "1px solid #e2e8f0" }}>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    padding: "22px 4px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                    fontFamily: FONT_INTER,
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 600, color: "#0b1f3a" }}>{it.q}</span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginLeft: 16,
                      transition: "transform .15s",
                    }}
                  >
                    <IcPlus
                      size={14}
                      sw={2.5}
                      style={{
                        color: "#0b1f3a",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                        transition: "transform .15s",
                      }}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 4px 26px",
                      maxWidth: 760,
                      fontSize: 15,
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

// ============================================================
// Final Pricing CTA
// ============================================================
function FinalPricingCta() {
  return (
    <section
      style={{
        background: "#0b1f3a",
        color: "#fff",
        padding: "80px 32px",
        textAlign: "center",
        fontFamily: FONT_INTER,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Less than your office coffee budget. <br />
          <span style={{ color: "#0e7490" }}>More compliance than your last RFP.</span>
        </h2>
        <p style={{ marginTop: 18, fontSize: 17, color: "rgba(255,255,255,0.72)" }}>
          Start with a free scan. Upgrade when you&apos;re ready to ship fixes.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Btn variant="urgent" size="lg" trailIcon={<IcArrow size={16} sw={2.5} />}>
            Start free Title II scan
          </Btn>
          <Btn variant="outline-dark" size="lg">
            Compare plans in detail
          </Btn>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Free scan", "WCAG audit", "Auto-Fix PR", "VPAT 2.5 export", "CI/CD action", "Pricing"],
    },
    {
      title: "Compliance",
      links: ["WCAG 2.1 AA", "ADA Title II", "Section 508", "EN 301 549", "DOJ deadline guide"],
    },
    { title: "Company", links: ["About", "Customers", "Security", "Contact", "Careers"] },
    { title: "Resources", links: ["Docs", "API reference", "Status", "Changelog", "Blog"] },
  ];
  return (
    <footer
      style={{
        background: "#071428",
        color: "rgba(255,255,255,0.7)",
        padding: "64px 32px 32px",
        fontFamily: FONT_INTER,
        fontSize: 13.5,
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.5fr repeat(4,1fr)",
          gap: 40,
        }}
      >
        <div>
          <Logo dark />
          <p
            style={{
              marginTop: 16,
              maxWidth: 280,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Real WCAG 2.1 AA compliance — VPATs, Section 508 reports, and PR-based auto-fixes for engineering teams.
          </p>
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["WCAG 2.1 AA", "Section 508", "EN 301 549"].map((b) => (
              <span
                key={b}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 4,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 600,
              }}
            >
              {c.title}
            </div>
            <ul
              style={{
                marginTop: 14,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {c.links.map((l) => (
                <li key={l}>
                  <a style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1320,
          margin: "48px auto 0",
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span>© 2026 AccessiScan, Inc. · SOC 2 Type II in progress.</span>
        <span>Privacy · Terms · Accessibility statement (we eat our own cooking)</span>
      </div>
    </footer>
  );
}

// ============================================================
// Page composition
// ============================================================
export default function PricingV2PreviewPage() {
  return (
    <>
      <style>{`body { background: #fff; color: #0b1f3a; }`}</style>
      <DojBanner />
      <PricingNavbar />
      <PricingHeader />
      <PricingCardsDetailed />
      <UniversalFeatures />
      <VendorComparison />
      <GuaranteeStrip />
      <GovernmentCallout />
      <PricingFaq />
      <FinalPricingCta />
      <Footer />
    </>
  );
}

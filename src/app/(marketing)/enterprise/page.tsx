import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { EnterpriseContactForm } from "./client-contact-form";

/**
 * /enterprise — procurement-led positioning.
 *
 * Why this page exists: AccessiScan as a brand reads as a "scanner tool" to
 * a procurement officer scanning a SERP. That mental category caps contract
 * size at SMB tooling levels (≤$50/mo) and routes evaluation to a junior
 * dev rather than a Compliance VP. The /pricing page reinforces that
 * (transparent monthly numbers, "Start free" CTA).
 *
 * /enterprise is the same product reframed for a different buyer: no
 * monthly numbers visible, language built around risk reduction, audit
 * trail, ongoing remediation, and the procurement workflow (MSA, DPA,
 * BAA, SLAs). Same SKU, different door.
 *
 * Inspired by Drata, Vanta, OneTrust, and Snyk Enterprise. None of those
 * companies show $/mo on their /enterprise pages — they let the SDR
 * tailor pricing to scope.
 *
 * Specifically responds to feedback from @aryan_sinh on Indie Hackers
 * (May 9, 2026): "AccessiScan reads like a checker. The buyer is
 * paying for risk reduction, compliance confidence, and ongoing
 * remediation — heavier than 'scan'." The 3-jobs framing on this page
 * is his.
 */

export const metadata: Metadata = {
  title:
    "AccessiScan Enterprise — Compliance infrastructure for procurement-led teams",
  description:
    "Continuous WCAG 2.1 AA monitoring, version-controlled remediation, and audit-ready evidence for organizations under DOJ Title II, Section 508, EAA, and AODA obligations. Custom contracts, MSA/DPA/BAA review, dedicated CSM. Schedule a procurement review.",
  alternates: { canonical: "/enterprise" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

const NAVY = "#0b1f3a";
const NAVY_DEEP = "#050d1c";
const CYAN = "#06b6d4";
// AA-safe text shade (5.66:1 on white).
const CYAN_TEXT = "#0e7490";
const SLATE_500 = "#64748b";
const SLATE_600 = "#475569";
const SLATE_700 = "#334155";
const SLATE_900 = "#0f172a";

// ---------- Atoms ----------

function Eyebrow({
  children,
  variant = "light",
}: {
  children: ReactNode;
  variant?: "light" | "dark" | "pill-light" | "pill-dark";
}) {
  if (variant === "pill-light") {
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
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: CYAN,
          }}
        />
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: CYAN_TEXT,
          }}
        >
          {children}
        </span>
      </span>
    );
  }
  if (variant === "pill-dark") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          border: "1px solid rgba(6,182,212,.55)",
          background: "rgba(6,182,212,.16)",
          borderRadius: 4,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: CYAN,
          }}
        />
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: CYAN,
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
        color: variant === "dark" ? CYAN : CYAN_TEXT,
      }}
    >
      {children}
    </span>
  );
}

function CheckIcon({ size = 16, color = CYAN, sw = 2.5, style }: { size?: number; color?: string; sw?: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={style}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ size = 16, color = "#cbd5e1", sw = 2 }: { size?: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ---------- Hero ----------

function Hero() {
  const trust = [
    "SOC 2 on roadmap",
    "Section 508",
    "EN 301 549",
    "WCAG 2.1 AA · 2.2 AA",
    "ACAA",
    "AODA",
  ];
  return (
    <section
      style={{
        background: `radial-gradient(circle at 20% 0%, rgba(6,182,212,0.08) 0%, transparent 55%), ${NAVY_DEEP}`,
        color: "#fff",
        padding: "112px 32px 88px",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_INTER,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* faint grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        <div>
          <Eyebrow variant="pill-dark">
            For procurement-led compliance teams
          </Eyebrow>
          <h1
            style={{
              marginTop: 26,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "#fff",
              maxWidth: 760,
            }}
          >
            Accessibility compliance,
            <br />
            run as <span style={{ color: CYAN }}>infrastructure.</span>
          </h1>
          <p
            style={{
              marginTop: 26,
              maxWidth: 620,
              fontSize: 19,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            Continuous WCAG 2.1 AA monitoring, version-controlled remediation,
            and audit-ready evidence for organizations under{" "}
            <strong style={{ color: "#fff" }}>DOJ Title II</strong>,{" "}
            <strong style={{ color: "#fff" }}>Section 508</strong>,{" "}
            <strong style={{ color: "#fff" }}>EAA</strong>, and{" "}
            <strong style={{ color: "#fff" }}>AODA</strong> obligations. Built
            to survive a procurement review and a DOJ Title II complaint —
            not to run a one-off scan.
          </p>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <Link
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 52,
                padding: "0 26px",
                fontSize: 15,
                fontWeight: 600,
                background: CYAN,
                color: NAVY_DEEP,
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: FONT_INTER,
              }}
            >
              Schedule a procurement review →
            </Link>
            <Link
              href="#what-is-included"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 52,
                padding: "0 22px",
                fontSize: 15,
                fontWeight: 500,
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: FONT_INTER,
              }}
            >
              See what enterprise contracts include
            </Link>
          </div>

          <div style={{ marginTop: 44 }}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              Compliance frameworks supported
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {trust.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    padding: "5px 10px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 4,
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — what we are NOT */}
        <aside
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 12,
            padding: 30,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CYAN,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            ── this isn&apos;t a scanner
          </div>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 20,
            }}
          >
            Scanners produce a PDF and walk away. AccessiScan stays
            connected to your repos, files version-controlled fix PRs against
            them, and maintains a continuous audit trail your General
            Counsel can hand to the DOJ.
          </p>
          <ul
            style={{
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 22,
            }}
          >
            {[
              "Continuous WCAG 2.1 AA monitoring across all properties",
              "Auto-Fix PRs filed against your GitHub / GitLab / Bitbucket",
              "Version-controlled remediation history per criterion",
              "Audit log streaming (SIEM-ready)",
              "Quarterly compliance reviews with named CSM",
              "VPAT 2.5 + Section 508 attestations on letterhead",
            ].map((t) => (
              <li
                key={t}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <CheckIcon
                  size={16}
                  color={CYAN}
                  style={{ flexShrink: 0, marginTop: 3 }}
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div
            style={{
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.04em",
            }}
          >
            Looking for the self-service tier? See{" "}
            <Link
              href="/pricing"
              style={{
                color: CYAN,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              /pricing
            </Link>{" "}
            (Free → Team, $19–599/mo).
          </div>
        </aside>
      </div>
    </section>
  );
}

// ---------- 3 jobs (Aryan's framework) ----------

function ThreeJobs() {
  const jobs = [
    {
      tag: "Job 1",
      h: "Risk reduction",
      sub: "DOJ Title II · Section 508 · EAA · AODA",
      body:
        "Public entities and federal contractors face a $50,000–$500,000 settlement range when a DOJ Title II complaint lands. AccessiScan maintains the continuous, version-controlled record of remediation that turns a complaint into a closed file rather than a consent decree.",
      bullets: [
        "Continuous monitoring across all monitored properties",
        "DOJ-aligned methodology (W3C errata + 4th edition WCAG techniques)",
        "Lawsuit-precedent flag on each violation (which criteria show up in actual settlements)",
      ],
    },
    {
      tag: "Job 2",
      h: "Compliance confidence",
      sub: "For boards · counsel · auditors · the CIO",
      body:
        "When the General Counsel asks 'are we covered?', a screenshot of a green dashboard isn't an answer. AccessiScan ships an evidence package that holds up: who changed what, when, on which deploy, with which test result and what remediation followed.",
      bullets: [
        "Audit-trail database (immutable, exportable as CSV/PDF/JSON)",
        "VPAT 2.5 attestations on AccessiScan letterhead",
        "Quarterly Compliance Review report co-signed with your CSM",
      ],
    },
    {
      tag: "Job 3",
      h: "Ongoing remediation support",
      sub: "Not a one-time scan, an operating system",
      body:
        "A scan that finds 612 violations and walks away leaves a compliance officer with a problem, not a solution. AccessiScan files Auto-Fix PRs against your repos, owns the remediation backlog as a living artifact, and re-tests on every deploy — closing the loop the scanner industry leaves open.",
      bullets: [
        "Auto-Fix PRs filed by AccessiScan into your VCS",
        "Re-scan delta on every deploy (status: passing / regressed / new)",
        "Dedicated CSM + named technical contact for remediation prioritization",
      ],
    },
  ];

  return (
    <section
      style={{
        background: "#fff",
        padding: "104px 32px 96px",
        fontFamily: FONT_INTER,
      }}
      id="three-jobs"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 760 }}>
          <Eyebrow>What enterprise teams are actually buying</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: NAVY,
            }}
          >
            Three jobs. None of them is &quot;run a scan.&quot;
          </h2>
          <p
            style={{
              marginTop: 18,
              fontSize: 16.5,
              lineHeight: 1.6,
              color: SLATE_600,
            }}
          >
            A scanner answers <em>what&apos;s broken right now</em>. A
            compliance team needs answers to three different questions, and
            those answers compound over time. Each job below maps to a
            framework AccessiScan is built around — not a feature toggle.
          </p>
        </div>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {jobs.map((j) => (
            <article
              key={j.tag}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: CYAN_TEXT,
                }}
              >
                {j.tag}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 24,
                    color: NAVY,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {j.h}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11.5,
                    color: SLATE_500,
                    marginTop: 4,
                    letterSpacing: "0.04em",
                  }}
                >
                  {j.sub}
                </div>
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: SLATE_600,
                  margin: 0,
                }}
              >
                {j.body}
              </p>
              <ul
                style={{
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 6,
                  paddingTop: 14,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                {j.bullets.map((b) => (
                  <li
                    key={b}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: SLATE_700,
                    }}
                  >
                    <CheckIcon
                      size={14}
                      color={CYAN}
                      style={{ flexShrink: 0, marginTop: 3 }}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Scanner vs Infrastructure comparison ----------

function ScannerVsPlatform() {
  const rows: Array<{ label: string; scanner: string; platform: string }> = [
    { label: "Cadence", scanner: "One-off / on-demand", platform: "Continuous · re-tests on every deploy" },
    { label: "Output", scanner: "PDF report (frozen in time)", platform: "Live audit-trail database (queryable, exportable)" },
    { label: "Remediation", scanner: "List of issues — your team fixes them", platform: "Auto-Fix PRs filed into your VCS by AccessiScan" },
    { label: "Coverage proof", scanner: "Date-stamped scan", platform: "Version-controlled history per WCAG criterion" },
    { label: "Procurement fit", scanner: "Junior-IT discretionary", platform: "MSA / DPA / BAA · CSM · SLA · custom legal terms" },
    { label: "DOJ-defensible", scanner: "Snapshot evidence", platform: "Continuous evidence + remediation history" },
    { label: "Pricing", scanner: "Per-seat / per-scan", platform: "Custom annual contract · scoped to properties + repos" },
    { label: "Buyer", scanner: "Engineer / IT analyst", platform: "Compliance VP · CIO · General Counsel · procurement" },
  ];

  return (
    <section
      style={{
        background: "#f8fafc",
        padding: "104px 32px 96px",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ maxWidth: 760 }}>
          <Eyebrow>Why this isn&apos;t a scanner play</Eyebrow>
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
            A scanner closes a ticket.
            <br />
            <span style={{ color: CYAN_TEXT }}>
              Infrastructure closes the loop.
            </span>
          </h2>
          <p
            style={{
              marginTop: 18,
              fontSize: 16,
              lineHeight: 1.6,
              color: SLATE_600,
            }}
          >
            The product line below is the same in both columns. The contract,
            the support model, and the evidence package on the right is what
            makes it survive a procurement review.
          </p>
        </div>

        <div
          style={{
            marginTop: 48,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.4fr 1.4fr",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 24px",
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: SLATE_500,
            }}
          >
            <span>Dimension</span>
            <span style={{ color: SLATE_700 }}>Scanner tool</span>
            <span style={{ color: NAVY }}>Compliance infrastructure</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.4fr 1.4fr",
                padding: "18px 24px",
                borderBottom: i === rows.length - 1 ? "none" : "1px solid #f1f5f9",
                alignItems: "start",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 15,
                  color: NAVY,
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: SLATE_500,
                  fontStyle: "italic",
                }}
              >
                {r.scanner}
              </span>
              <span
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: SLATE_700,
                  fontWeight: 500,
                }}
              >
                <CheckIcon
                  size={14}
                  color={CYAN}
                  style={{ flexShrink: 0, marginTop: 4 }}
                />
                <span>{r.platform}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- What enterprise contracts include ----------

function WhatsIncluded() {
  const sections: Array<{
    title: string;
    items: string[];
  }> = [
    {
      title: "Legal & procurement",
      items: [
        "MSA review (we sign your paper or ours)",
        "DPA (Data Processing Agreement) — GDPR + CCPA aligned",
        "BAA available (HIPAA-eligible workloads)",
        "Net-30 / net-60 / net-90 invoice terms",
        "Purchase order billing (no card on file required)",
        "Custom security questionnaires (CAIQ, SIG, vendor-specific)",
        "Indemnification + IP warranty terms",
        "Data residency election (US / EU)",
      ],
    },
    {
      title: "Identity, access, audit",
      items: [
        "SSO via SAML 2.0 (Okta, Azure AD, Google Workspace, OneLogin)",
        "SCIM provisioning · just-in-time deprovisioning",
        "Audit log streaming (Splunk, Datadog, generic Syslog)",
        "Role-based access control (org-admin, property-admin, viewer)",
        "Session timeout policies + IP allowlisting",
        "Org-wide policy enforcement (force-on for SSO, MFA, etc.)",
      ],
    },
    {
      title: "Service & support",
      items: [
        "Dedicated Customer Success Manager (named contact)",
        "Quarterly Compliance Review with co-signed report",
        "SLA tier — 99.9% uptime + tiered response time",
        "White-glove onboarding (dedicated implementation lead)",
        "Custom integration support (Jira, ServiceNow, Asana, GitHub Enterprise)",
        "Priority engineering support · escalation path",
        "Architecture review on request",
      ],
    },
    {
      title: "Compliance evidence",
      items: [
        "VPAT 2.5 attestation on AccessiScan letterhead",
        "Section 508 quarterly compliance report",
        "EN 301 549 self-assessment (EAA-aligned)",
        "ACAA mapping (federal contractors)",
        "Audit-trail database export (CSV / JSON / SIEM-ready)",
        "Security questionnaires (CAIQ / SIG) on request; SOC 2 on roadmap",
      ],
    },
  ];

  return (
    <section
      style={{
        background: "#fff",
        padding: "104px 32px 96px",
        fontFamily: FONT_INTER,
      }}
      id="what-is-included"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 760 }}>
          <Eyebrow>What enterprise contracts include</Eyebrow>
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
            Built so your procurement, security, and legal teams say yes.
          </h2>
          <p
            style={{
              marginTop: 18,
              fontSize: 16,
              lineHeight: 1.6,
              color: SLATE_600,
            }}
          >
            Enterprise contracts at AccessiScan are scoped per organization, but
            every one ships with the floor below. Anything missing here, ask
            on the procurement review — we&apos;ll either add it or tell you
            exactly when it lands on the roadmap.
          </p>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {sections.map((s) => (
            <div
              key={s.title}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: CYAN_TEXT,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                ── {s.title}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                  margin: 0,
                }}
              >
                {s.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: SLATE_700,
                    }}
                  >
                    <CheckIcon
                      size={14}
                      color={CYAN}
                      style={{ flexShrink: 0, marginTop: 3 }}
                    />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Procurement timeline ----------

function ProcurementTimeline() {
  const steps: Array<{ when: string; title: string; detail: string }> = [
    {
      when: "Day 0",
      title: "Discovery call · 30 min",
      detail:
        "We map your obligations (DOJ / Section 508 / EAA / AODA), your monitored properties, and your remediation workflow. No price quoted yet.",
    },
    {
      when: "Day 2",
      title: "Tailored quote",
      detail:
        "Sent within 48h of discovery. Includes: scoped properties, repos under remediation, SLA tier, attestations included, MSA terms.",
    },
    {
      when: "Week 2",
      title: "Security review · DPA signed",
      detail:
        "We complete your security questionnaire (CAIQ / SIG / vendor-specific) and sign your DPA + BAA where applicable.",
    },
    {
      when: "Week 3",
      title: "Procurement · PO issued",
      detail:
        "MSA finalized, PO issued, tenant provisioned. Implementation lead assigned to your account.",
    },
    {
      when: "Week 4",
      title: "Onboarding · first scan live",
      detail:
        "First continuous monitoring scan executes against your properties. Auto-Fix PR pipeline opens. CSM kickoff scheduled.",
    },
  ];

  return (
    <section
      style={{
        background: NAVY,
        color: "#fff",
        padding: "104px 32px 96px",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_INTER,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 56,
        }}
      >
        <div>
          <Eyebrow variant="pill-dark">Procurement timeline</Eyebrow>
          <h2
            style={{
              marginTop: 22,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            From discovery to live in <span style={{ color: CYAN }}>4 weeks.</span>
          </h2>
          <p
            style={{
              marginTop: 22,
              fontSize: 16,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 440,
            }}
          >
            Most enterprise SaaS quotes 8–12 weeks for a procurement cycle.
            Ours is built around a 4-week target because the DOJ Title II
            deadline doesn&apos;t care about quarter ends. Scope dependent.
          </p>
        </div>

        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {steps.map((s, i) => (
            <li
              key={s.when}
              style={{
                display: "grid",
                gridTemplateColumns: "108px 1fr",
                gap: 22,
                alignItems: "start",
                paddingBottom: 22,
                borderBottom:
                  i === steps.length - 1
                    ? "none"
                    : "1px dashed rgba(255,255,255,0.10)",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: CYAN,
                  paddingTop: 4,
                }}
              >
                {s.when}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#fff",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {s.title}
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {s.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------- Pricing transparency callout (no $ on page) ----------

function PricingTransparency() {
  const factors = [
    "Number of monitored properties (sites, web apps, mobile apps, PDFs)",
    "Number of repositories under Auto-Fix PR remediation",
    "SLA tier (99.5% / 99.9% / 99.95%)",
    "Attestations required (Section 508, EN 301 549, ACAA, custom)",
    "Custom integrations (Jira, ServiceNow, GitHub Enterprise, etc.)",
    "Data residency election (US / EU)",
    "Onboarding scope (white-glove vs self-serve)",
  ];
  return (
    <section
      style={{
        background: "#fff",
        padding: "96px 32px",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow>How enterprise pricing works</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: NAVY,
            }}
          >
            Custom — because enterprise scope is custom.
          </h2>
          <p
            style={{
              marginTop: 18,
              fontSize: 16,
              lineHeight: 1.6,
              color: SLATE_600,
            }}
          >
            We don&apos;t publish enterprise pricing on this page because
            anchoring a number ahead of scope is misleading on both sides:
            the SMB tier our /pricing page lists ($19–599/mo) doesn&apos;t
            describe the value at enterprise scope, and a five-figure
            enterprise number scares off SMBs that genuinely fit /pricing.
          </p>
          <p
            style={{
              marginTop: 14,
              fontSize: 16,
              lineHeight: 1.6,
              color: SLATE_600,
            }}
          >
            What we <em>can</em> commit to: a tailored quote within{" "}
            <strong>48h of the discovery call</strong>, with an itemized scope
            and a not-to-exceed annual figure. The factors that drive the
            quote:
          </p>
        </div>

        <ul
          style={{
            marginTop: 28,
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 28px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "24px 28px",
            margin: "28px 0 0",
          }}
        >
          {factors.map((f) => (
            <li
              key={f}
              style={{
                display: "flex",
                gap: 10,
                fontSize: 14,
                lineHeight: 1.55,
                color: SLATE_700,
              }}
            >
              <CheckIcon
                size={14}
                color={CYAN}
                style={{ flexShrink: 0, marginTop: 3 }}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: 28,
            fontSize: 14,
            color: SLATE_500,
            lineHeight: 1.55,
            fontStyle: "italic",
          }}
        >
          For organizations evaluating self-service tiers (single property,
          one team, no procurement workflow), see{" "}
          <Link
            href="/pricing"
            style={{
              color: CYAN_TEXT,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            /pricing
          </Link>{" "}
          — Free tier through Team ($599/mo).
        </div>
      </div>
    </section>
  );
}

// ---------- FAQ ----------

function EnterpriseFaq() {
  const faqs: Array<{ q: string; a: ReactNode }> = [
    {
      q: "Are you SOC 2 certified?",
      a: (
        <>
          Not yet — we won&apos;t claim a certification we don&apos;t hold. We
          follow standard security practices (encryption in transit and at rest,
          least-privilege access, RLS-isolated tenant data), we can share our
          internal security policies, and we complete vendor security
          questionnaires (CAIQ, SIG, custom) on request. A formal SOC 2 audit is
          on our roadmap; we&apos;ll share the report once it&apos;s complete
          rather than promise a date we can&apos;t guarantee.
        </>
      ),
    },
    {
      q: "Will you sign our paper, or do we sign yours?",
      a: (
        <>
          Either. Our default MSA is enterprise-friendly (mutual
          indemnification, cap at 12 months fees, IP warranty included), but
          we redline yours just as readily. Most contracts close on customer
          paper.
        </>
      ),
    },
    {
      q: "What payment terms do you support?",
      a: (
        <>
          Net-30 by default. Net-60 and Net-90 available for state/federal
          procurement and qualifying enterprise customers. Purchase orders
          accepted; we don&apos;t require a card on file. Wire and ACH
          supported. Annual contracts billed up-front or in equal quarterly
          installments.
        </>
      ),
    },
    {
      q: "How does Auto-Fix PR work with our existing GitHub Enterprise?",
      a: (
        <>
          We install a GitHub App into the repos you scope for remediation.
          The app reads (to map violations to source code) and writes (to file
          a remediation branch + PR). You review and merge the PR like any
          internal contributor — we never push directly to a default branch.
          GitLab and Bitbucket equivalents available.
        </>
      ),
    },
    {
      q: "Can we run this against internal apps behind our VPN?",
      a: (
        <>
          Yes. We deploy a self-hosted scanner runner into your VPC (or your
          Kubernetes cluster) that scans internal properties and ships
          violation telemetry to AccessiScan over an outbound TLS tunnel. No
          inbound firewall rules required.
        </>
      ),
    },
    {
      q: "What does data residency look like?",
      a: (
        <>
          Election at contract signing: US (us-east-1, us-west-2) or EU
          (eu-west-1, eu-central-1). Audit-trail database, scan results, and
          remediation history all stay in-region. We do not replicate
          customer data outside the elected region.
        </>
      ),
    },
    {
      q: "Do you have a federal sales lead?",
      a: (
        <>
          Federal procurement (FedRAMP-aligned tenants, GSA schedule) is on
          the roadmap for 2027. Today we serve federal contractors and state
          public entities under standard MSA + Section 508 attestations.
        </>
      ),
    },
    {
      q: "What happens if we churn?",
      a: (
        <>
          Audit-trail and remediation history exportable as CSV/JSON for 12
          months post-contract end. We don&apos;t hold compliance evidence
          hostage — that data is yours, not ours.
        </>
      ),
    },
  ];

  return (
    <section
      style={{
        background: "#f8fafc",
        padding: "104px 32px 96px",
        fontFamily: FONT_INTER,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow>Procurement FAQ</Eyebrow>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: NAVY,
            }}
          >
            The questions our procurement-led prospects always ask first.
          </h2>
        </div>

        <dl
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {faqs.map((f, i) => (
            <Fragment key={f.q}>
              <div
                style={{
                  padding: "24px 28px",
                  borderBottom:
                    i === faqs.length - 1 ? "none" : "1px solid #f1f5f9",
                }}
              >
                <dt
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: 17,
                    color: NAVY,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.q}
                </dt>
                <dd
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: SLATE_600,
                  }}
                >
                  {f.a}
                </dd>
              </div>
            </Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ---------- Contact / Final CTA ----------

function ContactCta() {
  return (
    <section
      id="contact"
      style={{
        background: NAVY_DEEP,
        color: "#fff",
        padding: "112px 32px 120px",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_INTER,
      }}
    >
      <div
        aria-hidden
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
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        <div>
          <Eyebrow variant="pill-dark">Schedule a procurement review</Eyebrow>
          <h2
            style={{
              marginTop: 22,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
            }}
          >
            Tell us your obligations. We&apos;ll send a tailored quote in
            48 hours.
          </h2>
          <p
            style={{
              marginTop: 22,
              maxWidth: 460,
              fontSize: 16,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            30-minute discovery call to map your scope. No slide deck, no
            pitch — we ask questions, you decide whether the fit is real.
            Quote follows within 48h, with itemized scope and a
            not-to-exceed annual figure.
          </p>
          <div
            style={{
              marginTop: 32,
              padding: "20px 22px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 10,
              maxWidth: 460,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: CYAN,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              ── Or contact directly
            </div>
            <ul
              style={{
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                margin: 0,
              }}
            >
              <li style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    marginRight: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </span>
                <a
                  href="mailto:enterprise@piposlab.com?subject=AccessiScan%20Enterprise%20%E2%80%94%20procurement%20review"
                  style={{
                    color: CYAN,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  enterprise@piposlab.com
                </a>
              </li>
              <li style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    marginRight: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Calendly
                </span>
                <a
                  href="https://cal.com/piposlab/accessiscan-procurement-review"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: CYAN,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Book a 30-min discovery →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <EnterpriseContactForm />
      </div>
    </section>
  );
}

// ---------- Page composition ----------

export default function EnterprisePage() {
  return (
    <div
      data-screen-label="AccessiScan Enterprise"
      style={{ background: "#fff", color: NAVY }}
    >
      <Hero />
      <ThreeJobs />
      <ScannerVsPlatform />
      <WhatsIncluded />
      <ProcurementTimeline />
      <PricingTransparency />
      <EnterpriseFaq />
      <ContactCta />
    </div>
  );
}

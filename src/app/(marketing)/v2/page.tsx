import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { DojBannerLive } from "./client-doj-banner";
import { Faq } from "./client-faq";

export const metadata: Metadata = {
  title: "AccessiScan — Real WCAG 2.1 AA compliance, not an overlay band-aid",
  description:
    "AI-powered WCAG 2.1 AA scanner that ships actual fix code as GitHub PRs, plus VPAT 2.5 export and a CI/CD action. Built for the DOJ Title II deadline. From $19/mo.",
};

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ---------- Icons (server components, JSX SVG, no innerHTML) ----------

function IconShield({ size = 14, sw = 2.5 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
    </svg>
  );
}
function IconArrowR({ size = 12, sw = 2.5, style }: { size?: number; sw?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconCheck({ size = 16, sw = 2.5, style }: { size?: number; sw?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX({ size = 16, sw = 2, style }: { size?: number; sw?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMinus({ size = 16, sw = 2, style }: { size?: number; sw?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IconGithub({ size = 14, sw = 2 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

// ---------- Brand ----------

function Logo({ dark = false, size = "md" }: { dark?: boolean; size?: "md" | "lg" }) {
  const dim = size === "lg" ? { tile: 32, ic: 18, font: 22, gap: 10 } : { tile: 24, ic: 14, font: 18, gap: 8 };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: dim.gap, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: dim.font, letterSpacing: "-0.01em", color: dark ? "#fff" : "#0b1f3a" }}>
      <span style={{ width: dim.tile, height: dim.tile, borderRadius: 6, background: "#06b6d4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <IconShield size={dim.ic} />
      </span>
      AccessiScan
    </div>
  );
}

// ---------- Buttons ----------

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

// ---------- Eyebrow ----------

function Eyebrow({ children, color = "slate" }: { children: ReactNode; color?: "slate" | "cyan" | "cyan-pill" }) {
  if (color === "cyan-pill") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px", border: "1px solid rgba(6,182,212,.40)", background: "rgba(6,182,212,.10)", borderRadius: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
        <span style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#06b6d4" }}>{children}</span>
      </span>
    );
  }
  return (
    <span style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: color === "cyan" ? "#06b6d4" : "#64748b" }}>
      {children}
    </span>
  );
}

// ---------- Navbar ----------

function Navbar() {
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_INTER }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#475569", fontWeight: 500 }}>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Product</a>
          <a href="#comparison" style={{ color: "inherit", textDecoration: "none" }}>Compare</a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
          <a href="#cta" style={{ color: "inherit", textDecoration: "none" }}>For government</a>
          <a href="#faq" style={{ color: "inherit", textDecoration: "none" }}>FAQ</a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Btn variant="ghost" size="sm" href="/login">Sign in</Btn>
        <Btn variant="primary" size="sm" href="/signup" trailIcon={<IconArrowR />}>Free scan</Btn>
      </div>
    </nav>
  );
}

// ---------- Hero ----------

function WcagSchematic() {
  type ChipProps = { id: string; label: string; style: CSSProperties };
  const Chip = ({ id, label, style }: ChipProps) => (
    <div style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", gap: 8, borderRadius: 4, border: "1px solid rgba(6,182,212,.40)", background: "#0b1f3a", padding: "5px 10px", boxShadow: "0 10px 24px rgba(0,0,0,.3)", ...style }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>{id}</span>
      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.7)" }}>{label}</span>
    </div>
  );
  return (
    <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <Chip id="1.1.1" label="Non-text content" style={{ left: "-8%", top: "4%" }} />
      <Chip id="1.4.3" label="Contrast (min)" style={{ right: "-6%", top: "22%" }} />
      <Chip id="2.4.4" label="Link purpose" style={{ left: "-4%", top: "58%" }} />
      <Chip id="4.1.2" label="Name · role · value" style={{ right: "-4%", bottom: "6%" }} />
      <svg viewBox="0 0 420 520" style={{ width: "100%", color: "rgba(255,255,255,0.7)" }} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="8" y="8" width="404" height="504" rx="6" />
        <circle cx="28" cy="30" r="3" fill="currentColor" stroke="none" />
        <circle cx="42" cy="30" r="3" fill="currentColor" stroke="none" />
        <circle cx="56" cy="30" r="3" fill="currentColor" stroke="none" />
        <line x1="8" y1="52" x2="412" y2="52" />
        <rect x="32" y="78" width="120" height="14" rx="2" />
        <rect x="170" y="78" width="60" height="14" rx="2" />
        <rect x="244" y="78" width="60" height="14" rx="2" />
        <rect x="318" y="78" width="70" height="22" rx="2" fill="rgba(6,182,212,0.25)" />
        <line x1="32" y1="136" x2="260" y2="136" strokeWidth="2.4" />
        <line x1="32" y1="152" x2="220" y2="152" strokeWidth="2.4" />
        <line x1="32" y1="180" x2="320" y2="180" />
        <line x1="32" y1="194" x2="290" y2="194" />
        <rect x="32" y="220" width="88" height="26" rx="3" fill="rgba(6,182,212,0.20)" />
        <rect x="128" y="220" width="88" height="26" rx="3" />
        <rect x="260" y="116" width="128" height="128" rx="4" />
        <line x1="260" y1="244" x2="388" y2="116" strokeWidth="0.8" strokeDasharray="3,3" />
        <line x1="260" y1="116" x2="388" y2="244" strokeWidth="0.8" strokeDasharray="3,3" />
        <rect x="32" y="282" width="112" height="100" rx="4" />
        <rect x="154" y="282" width="112" height="100" rx="4" />
        <rect x="276" y="282" width="112" height="100" rx="4" />
        <line x1="44" y1="310" x2="120" y2="310" strokeWidth="2" />
        <line x1="44" y1="328" x2="132" y2="328" />
        <line x1="44" y1="342" x2="108" y2="342" />
        <line x1="166" y1="310" x2="242" y2="310" strokeWidth="2" />
        <line x1="166" y1="328" x2="254" y2="328" />
        <line x1="166" y1="342" x2="230" y2="342" />
        <line x1="288" y1="310" x2="364" y2="310" strokeWidth="2" />
        <line x1="288" y1="328" x2="376" y2="328" />
        <line x1="288" y1="342" x2="352" y2="342" />
        <circle cx="374" cy="186" r="5" fill="#dc2626" stroke="none" />
      </svg>
      <div style={{ position: "absolute", inset: 0, zIndex: -1, borderRadius: 32, background: "radial-gradient(60% 60% at 50% 50%, rgba(6,182,212,0.18), transparent 70%)" }} />
    </div>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", background: "#0b1f3a", color: "#fff", overflow: "hidden", fontFamily: FONT_INTER }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto", padding: "80px 32px", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <Eyebrow color="cyan-pill">ADA Title II · WCAG 2.1 AA · VPAT 2.5</Eyebrow>
          <h1 style={{ marginTop: 24, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            Real WCAG 2.1 AA compliance — not an overlay band-aid.
          </h1>
          <p style={{ marginTop: 20, maxWidth: 560, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>
            22.6% of ADA lawsuits target overlay users. AccessiScan ships actual fix code, a VPAT 2.5 export, and a CI/CD action — from{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>$19/mo</span>.
          </p>
          <figure style={{ marginTop: 28, maxWidth: 560, borderRadius: 8, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", padding: 22, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 700, lineHeight: 1, color: "#06b6d4" }} aria-hidden>“</span>
            <div>
              <blockquote style={{ margin: 0, fontSize: 19, lineHeight: 1.3, color: "#fff" }}>
                The FTC fined accessiBe <span style={{ color: "#06b6d4" }}>$1M</span> for deceptive “fully compliant” claims.
              </blockquote>
              <figcaption style={{ marginTop: 10, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                U.S. Federal Trade Commission · 2025 consent order
              </figcaption>
            </div>
          </figure>
          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <Btn variant="urgent" size="lg" href="/signup" trailIcon={<IconArrowR size={16} />}>Start free Title II scan</Btn>
            <Btn variant="outline-dark" size="lg" href="#comparison">See how we compare</Btn>
          </div>
          <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {["No credit card required", "Free tier · 2 scans/mo", "Not an overlay"].map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconCheck size={13} style={{ color: "#06b6d4" }} />
                {t}
              </span>
            ))}
          </div>
        </div>
        <WcagSchematic />
      </div>
    </section>
  );
}

// ---------- Stats Strip ----------

function StatsStrip() {
  const stats: [string, string, "navy" | "cy"][] = [
    ["5,100+", "Federal ADA suits 2025", "navy"],
    ["+37%", "YoY increase", "navy"],
    ["$15K/yr", "What Siteimprove costs", "navy"],
    ["$19/mo", "What AccessiScan costs", "cy"],
  ];
  return (
    <section style={{ background: "#fff", padding: "48px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "32px 0" }}>
        {stats.map(([v, l, c], i) => (
          <div key={l} style={{ padding: "0 28px", borderLeft: i === 0 ? 0 : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: c === "cy" ? "#06b6d4" : "#0b1f3a" }}>{v}</span>
            <Eyebrow>{l}</Eyebrow>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Comparison ----------

type CellValue = "yes" | "no" | "partial";
function Cell({ v }: { v: CellValue }) {
  if (v === "yes") return <IconCheck size={16} style={{ color: "#06b6d4" }} />;
  if (v === "partial") return <IconMinus size={16} style={{ color: "#94a3b8" }} />;
  return <IconX size={16} style={{ color: "#cbd5e1" }} />;
}

function Comparison() {
  const rows: Array<{ tool: string; price: string; aiFix: CellValue; vpat: CellValue; ci: CellValue; us?: boolean }> = [
    { tool: "AccessiScan", price: "$19/mo", aiFix: "yes", vpat: "yes", ci: "yes", us: true },
    { tool: "accessiBe", price: "$49/mo", aiFix: "no", vpat: "no", ci: "no" },
    { tool: "UserWay", price: "$49/mo", aiFix: "no", vpat: "no", ci: "no" },
    { tool: "Siteimprove", price: "$15,000/yr", aiFix: "partial", vpat: "yes", ci: "no" },
    { tool: "Deque axe", price: "Free / $45/user", aiFix: "no", vpat: "no", ci: "partial" },
  ];
  return (
    <section id="comparison" style={{ background: "#fff", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">Competitive landscape</Eyebrow>
          <h2 style={{ marginTop: 12, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0b1f3a" }}>How AccessiScan compares.</h2>
          <p style={{ marginTop: 20, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>Compiled April 2026 from public pricing pages.</p>
        </div>
        <div style={{ marginTop: 48, borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Tool", "Starting price", "AI fix code", "VPAT 2.5 export", "CI/CD action"].map((h) => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, letterSpacing: "0.10em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.tool} style={{ borderBottom: "1px solid #e2e8f0", background: r.us ? "rgba(236,254,255,0.4)" : "transparent", boxShadow: r.us ? "inset 3px 0 0 #06b6d4" : "none" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: r.us ? "#0b1f3a" : "#334155" }}>
                    {r.tool}
                    {r.us && (
                      <span style={{ marginLeft: 8, padding: "2px 7px", borderRadius: 3, background: "#0b1f3a", color: "#fff", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Us</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px", color: r.us ? "#0b1f3a" : "#475569", fontWeight: r.us ? 600 : 400 }}>{r.price}</td>
                  <td style={{ padding: "16px 20px" }}><Cell v={r.aiFix} /></td>
                  <td style={{ padding: "16px 20px" }}><Cell v={r.vpat} /></td>
                  <td style={{ padding: "16px 20px" }}><Cell v={r.ci} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ---------- Feature Triplet ----------

function ArtDiff() {
  return (
    <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, lineHeight: 1.7, background: "#0d1117", color: "#c9d1d9", borderRadius: 6, padding: "12px 14px", border: "1px solid #1f2937" }}>
      <div style={{ color: "#8b949e", fontSize: 10.5, marginBottom: 6 }}>app/footer.tsx</div>
      <div style={{ background: "rgba(248,81,73,0.15)", color: "#ffa198", padding: "0 6px", borderRadius: 2 }}>- &lt;img src=&quot;seal.png&quot; /&gt;</div>
      <div style={{ background: "rgba(63,185,80,0.15)", color: "#7ee787", padding: "0 6px", borderRadius: 2 }}>+ &lt;img src=&quot;seal.png&quot; alt=&quot;City of Austin seal&quot; /&gt;</div>
      <div style={{ marginTop: 6, color: "#8b949e", fontSize: 10 }}>WCAG 1.1.1 · Non-text content</div>
    </div>
  );
}
function ArtVpat() {
  const rows: [string, string, string][] = [
    ["1.1.1", "Non-text content", "Supports"],
    ["1.4.3", "Contrast (min)", "Supports"],
    ["2.4.4", "Link purpose", "Supports"],
    ["4.1.2", "Name, role, value", "Partial"],
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontFamily: FONT_INTER, fontSize: 11.5, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0", background: "#0b1f3a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}>VPAT 2.5 Rev 508</span>
        <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>WCAG 2.1 AA</span>
      </div>
      {rows.map(([id, name, status], i) => (
        <div key={id} style={{ display: "grid", gridTemplateColumns: "52px 1fr auto", padding: "7px 12px", borderTop: i ? "1px solid #f1f5f9" : 0, gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: "#0b1f3a", fontSize: 10.5 }}>{id}</span>
          <span style={{ color: "#475569" }}>{name}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: status === "Supports" ? "#06b6d4" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{status}</span>
        </div>
      ))}
    </div>
  );
}
function ArtCi() {
  return (
    <div style={{ background: "#0d1117", color: "#c9d1d9", border: "1px solid #1f2937", borderRadius: 6, fontFamily: FONT_MONO, fontSize: 11, padding: "12px 14px", lineHeight: 1.6 }}>
      <div style={{ color: "#8b949e", fontSize: 10, marginBottom: 6 }}>.github/workflows/a11y.yml</div>
      <div><span style={{ color: "#79c0ff" }}>name:</span> <span style={{ color: "#a5d6ff" }}>Accessibility</span></div>
      <div><span style={{ color: "#79c0ff" }}>on:</span> <span style={{ color: "#a5d6ff" }}>[pull_request]</span></div>
      <div style={{ marginTop: 4 }}><span style={{ color: "#79c0ff" }}>jobs:</span></div>
      <div style={{ paddingLeft: 12 }}><span style={{ color: "#79c0ff" }}>scan:</span></div>
      <div style={{ paddingLeft: 22 }}><span style={{ color: "#79c0ff" }}>uses:</span> <span style={{ color: "#a5d6ff" }}>accessiscan/action@v1</span></div>
      <div style={{ paddingLeft: 22 }}><span style={{ color: "#79c0ff" }}>fail-on:</span> <span style={{ color: "#ffa657" }}>critical</span></div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, color: "#3fb950", fontFamily: FONT_INTER, fontSize: 11 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3fb950" }} />
        Pass · 0 critical · 2 minor
      </div>
    </div>
  );
}

function FeatureTriplet() {
  const features = [
    {
      eyebrow: "Auto-Fix PR",
      title: "AI ships the fix code, not just the bug list.",
      body: "Claude-written diffs land as a real GitHub Pull Request — alt-text, ARIA labels, lang attrs, link/button names, contrast ratios. Atomic commits, CODEOWNERS-aware, scan re-runs in CI before the bot requests review.",
      tags: ["GitHub App", "WCAG 2.1 AA", "axe-core + AI vision"],
      art: <ArtDiff />,
    },
    {
      eyebrow: "VPAT 2.5 export",
      title: "Procurement-ready in one click.",
      body: "Generate a Voluntary Product Accessibility Template mapped to A and AA success criteria. Section 508 + EN 301 549 conformance reports too. Drop it straight into an RFP response.",
      tags: ["Section 508", "EN 301 549", "RFP-ready"],
      art: <ArtVpat />,
    },
    {
      eyebrow: "GitHub Action",
      title: "Block critical violations at the merge gate.",
      body: "One YAML file fails the build on critical/serious issues — before they ship. Comments inline on the PR, fingerprints baseline issues, and posts a delta against main. Continuous monitoring runs in parallel.",
      tags: ["CI/CD", "Continuous", "Build-fail policy"],
      art: <ArtCi />,
    },
  ];
  return (
    <section id="features" style={{ background: "#fff", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color="cyan">What you get</Eyebrow>
          <h2 style={{ marginTop: 12, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0b1f3a" }}>Three things every other scanner skips.</h2>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.55, color: "#475569" }}>Auditors hand you a CSV. Overlays hand you a lawsuit. We hand you fix code, a VPAT, and a green CI light.</p>
        </div>
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {features.map((f) => (
            <article key={f.eyebrow} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: 24, borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{f.art}</div>
              <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#06b6d4" }}>{f.eyebrow}</span>
                <h3 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, lineHeight: 1.2, color: "#0b1f3a", letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#475569" }}>{f.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {f.tags.map((t) => (
                    <span key={t} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", padding: "4px 9px", border: "1px solid #e2e8f0", borderRadius: 4, color: "#475569", background: "#fff", fontFamily: FONT_MONO }}>{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Auto-Fix PR section ----------

function PrMockup() {
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontFamily: FONT_MONO, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 9999, background: "#1f6feb", color: "#fff", fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
          Open
        </span>
        <span style={{ fontFamily: FONT_INTER, color: "#fff", fontSize: 15, fontWeight: 500 }}>Fix WCAG 1.4.3 contrast violations on /pricing</span>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: FONT_INTER }}>
        <span>
          <span style={{ color: "#06b6d4" }}>accessiscan-bot</span> wants to merge{" "}
          <span style={{ color: "#fff" }}>1 commit</span> into <span style={{ color: "#fff" }}>main</span> from{" "}
          <span style={{ color: "#fff" }}>fix/wcag-1-4-3</span>
        </span>
        <span style={{ color: "#3fb950" }}>+12 −7</span>
      </div>
      <div style={{ padding: "16px", fontSize: 12.5, lineHeight: 1.65 }}>
        <div style={{ color: "rgba(255,255,255,0.55)" }}>app/components/pricing-card.tsx</div>
        <pre style={{ margin: "10px 0 0", color: "#c9d1d9", whiteSpace: "pre-wrap" }}>
          {`@@ -42,7 +42,7 @@ export function PricingCard() {
   <p
`}
          <span style={{ background: "rgba(248,81,73,0.15)", color: "#ffa198" }}>
            {`-    className="text-slate-400 text-sm"  // 2.8:1 contrast`}
          </span>
          {`
`}
          <span style={{ background: "rgba(63,185,80,0.15)", color: "#7ee787" }}>
            {`+    className="text-slate-600 text-sm"  // 7.1:1 ✓ AA`}
          </span>
          {`
   >`}
        </pre>
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8, fontFamily: FONT_INTER, fontSize: 12.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.65)" }}>
          <IconCheck size={14} style={{ color: "#3fb950" }} />
          All 3 checks have passed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", paddingLeft: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3fb950" }} />
          accessiscan / a11y-scan — Pass · WCAG 2.1 AA verified
        </div>
      </div>
    </div>
  );
}

function AutoFixPr() {
  return (
    <section style={{ background: "#0b1f3a", color: "#fff", padding: "96px 32px", fontFamily: FONT_INTER, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
      <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 64, alignItems: "center" }}>
        <div>
          <Eyebrow color="cyan-pill">The differentiator</Eyebrow>
          <h2 style={{ marginTop: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            We don&apos;t just audit. <br />
            <span style={{ color: "#06b6d4" }}>We open the PR.</span>
          </h2>
          <p style={{ marginTop: 20, maxWidth: 520, fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.72)" }}>
            Every other scanner hands engineers a 200-row CSV and walks away. AccessiScan ships diff-ready fix code as a GitHub Pull Request — your team reviews, merges, ships.
          </p>
          <ul style={{ marginTop: 28, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Patches mapped to WCAG success criteria with citations",
              "Isolated atomic commits — one violation, one fix",
              "CODEOWNERS, branch protection & required reviews respected",
              "Re-runs the scan in CI before requesting review",
            ].map((t) => (
              <li key={t} style={{ display: "flex", gap: 10, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
                <IconCheck size={18} style={{ color: "#06b6d4", flexShrink: 0, marginTop: 2 }} />
                {t}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <Btn variant="white" href="/dashboard/github" leadIcon={<IconGithub />}>Install GitHub App</Btn>
            <Btn variant="outline-dark" href="#features">View example PR</Btn>
          </div>
        </div>
        <PrMockup />
      </div>
    </section>
  );
}

// ---------- Pricing ----------

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      per: "/mo",
      desc: "Try AccessiScan on a single domain.",
      features: ["1 site · 2 scans/mo", "WCAG 2.1 AA scan", "PDF report export", "No credit card required"],
      cta: "Start free scan",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      per: "/mo",
      desc: "For developers and contractors filing VPATs.",
      features: ["3 sites · unlimited pages", "VPAT 2.5 export", "Auto-Fix PR (GitHub)", "CI/CD action", "Continuous monitoring"],
      cta: "Start free — upgrade anytime",
      popular: true,
    },
    {
      name: "Agency",
      price: "$49",
      per: "/mo",
      desc: "For agencies and multi-site operators.",
      features: ["25 sites · multi-tenant", "Client-branded VPAT exports", "Section 508 + EN 301 549 reports", "Priority support · SSO", "Volume discounts on overage"],
      cta: "Start free — upgrade anytime",
      popular: false,
    },
  ];
  return (
    <section id="pricing" style={{ background: "#f8fafc", padding: "96px 32px", fontFamily: FONT_INTER }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow color="cyan">Pricing</Eyebrow>
          <h2 style={{ marginTop: 12, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0b1f3a" }}>Less than your office coffee budget.</h2>
        </div>
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {tiers.map((t) => (
            <div key={t.name} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28, borderTop: t.popular ? "3px solid #06b6d4" : "1px solid #e2e8f0", position: "relative", display: "flex", flexDirection: "column" }}>
              {t.popular && (
                <span style={{ position: "absolute", top: -1, right: 24, transform: "translateY(-50%)", padding: "4px 10px", background: "#0b1f3a", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 4 }}>Most popular</span>
              )}
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: "#0b1f3a" }}>{t.name}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>{t.desc}</div>
              <div style={{ marginTop: 18 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: "#0b1f3a", letterSpacing: "-0.02em" }}>{t.price}</span>
                <span style={{ fontSize: 14, color: "#64748b", marginLeft: 4 }}>{t.per}</span>
              </div>
              <ul style={{ marginTop: 20, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "#475569" }}>
                    <IconCheck size={15} style={{ color: "#06b6d4", flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Btn variant={t.popular ? "primary" : "outline"} size="md" href="/signup" style={{ marginTop: 24, justifyContent: "center" }}>{t.cta}</Btn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Final CTA ----------

function FinalCta() {
  return (
    <section id="cta" style={{ background: "#0b1f3a", color: "#fff", padding: "80px 32px", textAlign: "center", fontFamily: FONT_INTER, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          You have <span style={{ color: "#dc2626" }}>365 days</span> until Title II.
        </h2>
        <p style={{ marginTop: 18, fontSize: 17, color: "rgba(255,255,255,0.72)" }}>Scan your domain in 90 seconds. No card required.</p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="urgent" size="lg" href="/signup" trailIcon={<IconArrowR size={16} />}>Start free Title II scan</Btn>
          <Btn variant="outline-dark" size="lg" href="mailto:government@accessiscan.piposlab.com">Book government demo</Btn>
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------

function Footer() {
  const cols = [
    { title: "Product", links: ["Free scan", "WCAG audit", "Auto-Fix PR", "VPAT 2.5 export", "CI/CD action", "Pricing"] },
    { title: "Compliance", links: ["WCAG 2.1 AA", "ADA Title II", "Section 508", "EN 301 549", "DOJ deadline guide"] },
    { title: "Company", links: ["About", "Customers", "Security", "Contact", "Careers"] },
    { title: "Resources", links: ["Docs", "API reference", "Status", "Changelog", "Blog"] },
  ];
  return (
    <footer style={{ background: "#071428", color: "rgba(255,255,255,0.7)", padding: "64px 32px 32px", fontFamily: FONT_INTER, fontSize: 13.5 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr repeat(4,1fr)", gap: 40 }}>
        <div>
          <Logo dark />
          <p style={{ marginTop: 16, maxWidth: 280, lineHeight: 1.55, color: "rgba(255,255,255,0.55)" }}>
            Real WCAG 2.1 AA compliance — VPATs, Section 508 reports, and PR-based auto-fixes for engineering teams.
          </p>
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["WCAG 2.1 AA", "Section 508", "EN 301 549"].map((b) => (
              <span key={b} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 4, color: "rgba(255,255,255,0.78)" }}>{b}</span>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{c.title}</div>
            <ul style={{ marginTop: 14, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1320, margin: "48px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
        <span>© 2026 AccessiScan, Inc. · SOC 2 Type II in progress.</span>
        <span>Privacy · Terms · Accessibility statement (we eat our own cooking)</span>
      </div>
    </footer>
  );
}

// ---------- Page composition ----------

export default function V2LandingPage() {
  return (
    <div data-screen-label="AccessiScan Landing v2" style={{ background: "#fff", color: "#0b1f3a" }}>
      <DojBannerLive />
      <Navbar />
      <Hero />
      <StatsStrip />
      <Comparison />
      <FeatureTriplet />
      <AutoFixPr />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

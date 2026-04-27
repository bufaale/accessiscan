"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Icons
// ============================================================
type IcProps = { size?: number; sw?: number; style?: CSSProperties };
const wrap = (children: ReactNode, p: IcProps) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.sw ?? 1.7} strokeLinecap="round" strokeLinejoin="round" style={p.style}>{children}</svg>
);
const IcShield = (p: IcProps) => wrap(<path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />, p);
const IcDash = (p: IcProps) => wrap(<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>, p);
const IcScan = (p: IcProps) => wrap(<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>, p);
const IcHistory = (p: IcProps) => wrap(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 16 14" /></>, p);
const IcActivity = (p: IcProps) => wrap(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, p);
const IcFile = (p: IcProps) => wrap(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>, p);
const IcUser = (p: IcProps) => wrap(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, p);
const IcCard = (p: IcProps) => wrap(<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>, p);
const IcAlert = (p: IcProps) => wrap(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, p);
const IcPr = (p: IcProps) => wrap(<><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></>, p);
const IcBell = (p: IcProps) => wrap(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>, p);
const IcGithub = (p: IcProps) => wrap(<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />, p);
const IcArrow = (p: IcProps) => wrap(<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>, p);
const IcCheck = (p: IcProps) => wrap(<polyline points="20 6 9 17 4 12" />, p);
const IcX = (p: IcProps) => wrap(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, p);
const IcExt = (p: IcProps) => wrap(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, p);
const IcDownload = (p: IcProps) => wrap(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>, p);
const IcSparkle = (p: IcProps) => wrap(<path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />, p);
const IcBranch = (p: IcProps) => wrap(<><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>, p);
const IcCopy = (p: IcProps) => wrap(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, p);
const IcChevD = (p: IcProps) => wrap(<polyline points="6 9 12 15 18 9" />, p);
const IcChevR = (p: IcProps) => wrap(<polyline points="9 6 15 12 9 18" />, p);
const IcEye = (p: IcProps) => wrap(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>, p);
const IcClock = (p: IcProps) => wrap(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, p);
const IcBolt = (p: IcProps) => wrap(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, p);

// ============================================================
// Severity tokens
// ============================================================
type Sev = "critical" | "serious" | "moderate" | "minor";
const SEV: Record<Sev, { color: string; bg: string; soft: string; label: string }> = {
  critical: { color: "#dc2626", bg: "#fef2f2", soft: "rgba(220,38,38,0.10)", label: "Critical" },
  serious: { color: "#ea580c", bg: "#fff7ed", soft: "rgba(234,88,12,0.10)", label: "Serious" },
  moderate: { color: "#0e7490", bg: "#ecfeff", soft: "rgba(6,182,212,0.10)", label: "Moderate" },
  minor: { color: "#64748b", bg: "#f1f5f9", soft: "rgba(100,116,139,0.10)", label: "Minor" },
};

// ============================================================
// Mock data
// ============================================================
type Violation = {
  id: string; wcag: string; criterion: string; level: "A" | "AA" | "AAA"; principle: string;
  sev: Sev; fixable: boolean; count: number; page: string; file: string; line: number;
  selector: string; snippet: string; measured?: string; required?: string;
  fixDesc: string; fixCode?: string; diffOld?: string; diffNew?: string;
};

const VIOLATIONS: Violation[] = [
  { id: "v1", wcag: "1.4.3", criterion: "Contrast (minimum)", level: "AA", principle: "Perceivable", sev: "critical", fixable: true, count: 23, page: "/about", file: "src/components/Footer.tsx", line: 47, selector: "footer p.text-slate-500", snippet: '<p className="text-slate-500 text-sm">© 2026 Agency.gov. All rights reserved.</p>', measured: "2.84 : 1", required: "4.5 : 1", fixDesc: "Change text color from slate-400 to slate-600 to meet 4.5:1 ratio", fixCode: "text-slate-600", diffOld: '<p className="text-slate-500 text-sm">', diffNew: '<p className="text-slate-600 text-sm">' },
  { id: "v2", wcag: "1.1.1", criterion: "Non-text content", level: "A", principle: "Perceivable", sev: "critical", fixable: true, count: 14, page: "/services", file: "src/components/Hero.tsx", line: 22, selector: "main > section:nth-child(2) img.hero-bg", snippet: '<img src="/images/hero-bg.jpg" className="hero-bg" />', fixDesc: "Add descriptive alt text from page metadata + Claude vision analysis", fixCode: 'alt="Aerial view of city hall building at sunset"', diffOld: '<img src="/images/hero-bg.jpg" className="hero-bg" />', diffNew: '<img src="/images/hero-bg.jpg" alt="Aerial view of city hall building at sunset" className="hero-bg" />' },
  { id: "v3", wcag: "2.4.7", criterion: "Focus visible", level: "AA", principle: "Operable", sev: "critical", fixable: true, count: 9, page: "/forms/I-90", file: "src/app/globals.css", line: 134, selector: "button.cta-primary, a.cta-primary", snippet: "button.cta-primary:focus { outline: none; }", fixDesc: "Replace 'outline: none' with visible 2px focus ring at 3:1 contrast", fixCode: "outline: 2px solid #06b6d4; outline-offset: 2px;", diffOld: "  outline: none;", diffNew: "  outline: 2px solid #06b6d4;\n  outline-offset: 2px;" },
  { id: "v4", wcag: "4.1.2", criterion: "Name, role, value", level: "A", principle: "Robust", sev: "serious", fixable: true, count: 11, page: "/", file: "src/components/Header.tsx", line: 88, selector: "header button.menu-toggle", snippet: "<button onClick={toggleMenu}><MenuIcon /></button>", fixDesc: "Add aria-label to icon-only menu button", fixCode: 'aria-label="Open navigation menu"', diffOld: "<button onClick={toggleMenu}><MenuIcon /></button>", diffNew: '<button onClick={toggleMenu} aria-label="Open navigation menu"><MenuIcon /></button>' },
  { id: "v5", wcag: "3.1.1", criterion: "Language of page", level: "A", principle: "Understandable", sev: "serious", fixable: true, count: 1, page: "(all)", file: "src/app/layout.tsx", line: 14, selector: "html", snippet: "<html>", fixDesc: "Add lang='en' to root <html> element", fixCode: 'lang="en"', diffOld: "<html>", diffNew: '<html lang="en">' },
  { id: "v6", wcag: "1.3.1", criterion: "Info and relationships", level: "A", principle: "Perceivable", sev: "serious", fixable: true, count: 7, page: "/services", file: "src/components/ServiceList.tsx", line: 31, selector: "main div.service-card > div.title", snippet: '<div className="title">Permits & Licensing</div>', fixDesc: "Promote visual headings to semantic <h3> elements", fixCode: '<h3 className="title">', diffOld: '<div className="title">', diffNew: '<h3 className="title">' },
  { id: "v7", wcag: "2.4.4", criterion: "Link purpose (in context)", level: "A", principle: "Operable", sev: "moderate", fixable: false, count: 12, page: "/news", file: "src/components/NewsCard.tsx", line: 19, selector: "a.news-link", snippet: '<a href="/news/123">click here</a>', fixDesc: "Manual review · ambiguous link text used in 12 places" },
  { id: "v8", wcag: "3.3.2", criterion: "Labels or instructions", level: "A", principle: "Understandable", sev: "moderate", fixable: true, count: 4, page: "/contact", file: "src/components/ContactForm.tsx", line: 56, selector: 'input[name="email"]', snippet: '<input type="email" placeholder="you@example.com" />', fixDesc: "Pair input with explicit <label> element (placeholder is not a label)", fixCode: '<label htmlFor="email">Email address</label><input id="email" .../>', diffOld: '<input type="email" placeholder="you@example.com" />', diffNew: '<label htmlFor="email">Email address</label>\n<input id="email" type="email" placeholder="you@example.com" />' },
  { id: "v9", wcag: "1.4.11", criterion: "Non-text contrast", level: "AA", principle: "Perceivable", sev: "moderate", fixable: true, count: 8, page: "/", file: "src/components/ui/input.tsx", line: 8, selector: "input, textarea, select", snippet: "border: 1px solid #e2e8f0;", fixDesc: "Form border contrast 1.6:1 — increase to ≥3:1 against background", fixCode: "border-color: #94a3b8;", diffOld: "  border: 1px solid #e2e8f0;", diffNew: "  border: 1px solid #94a3b8;" },
  { id: "v10", wcag: "2.5.5", criterion: "Target size", level: "AAA", principle: "Operable", sev: "minor", fixable: false, count: 6, page: "/", file: "src/components/Footer.tsx", line: 91, selector: "footer ul.social a", snippet: '<a className="w-6 h-6 ...">', fixDesc: "Touch targets are 24×24px — recommend 44×44px" },
  { id: "v11", wcag: "1.4.5", criterion: "Images of text", level: "AA", principle: "Perceivable", sev: "minor", fixable: false, count: 3, page: "/about", file: "—", line: 0, selector: "img.banner-cta", snippet: '<img src="join-us.png">', fixDesc: "Banner uses image of text — replace with live HTML/CSS" },
];

// ============================================================
// Buttons
// ============================================================
type BtnVariant = "primary" | "urgent" | "outline" | "cyan" | "ghost" | "soft";
type BtnSize = "xs" | "sm" | "md" | "lg";
function Btn({ children, variant = "primary", size = "md", leadIcon, trailIcon, onClick, style, title }: { children: ReactNode; variant?: BtnVariant; size?: BtnSize; leadIcon?: ReactNode; trailIcon?: ReactNode; onClick?: () => void; style?: CSSProperties; title?: string }) {
  const sizes: Record<BtnSize, { h: number; px: number; fs: number }> = { lg: { h: 44, px: 18, fs: 14 }, md: { h: 36, px: 14, fs: 13 }, sm: { h: 30, px: 11, fs: 12 }, xs: { h: 24, px: 8, fs: 11.5 } };
  const s = sizes[size];
  const variants: Record<BtnVariant, { bg: string; color: string; border: string }> = {
    primary: { bg: "#0b1f3a", color: "#fff", border: "1px solid #0b1f3a" },
    urgent: { bg: "#dc2626", color: "#fff", border: "1px solid #dc2626" },
    outline: { bg: "#fff", color: "#0b1f3a", border: "1px solid #cbd5e1" },
    cyan: { bg: "#06b6d4", color: "#fff", border: "1px solid #06b6d4" },
    ghost: { bg: "transparent", color: "#475569", border: "1px solid transparent" },
    soft: { bg: "#f1f5f9", color: "#0b1f3a", border: "1px solid #e2e8f0" },
  };
  const v = variants[variant];
  return (
    <button type="button" onClick={onClick} title={title} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: v.bg, color: v.color, border: v.border, transition: "background-color .15s,border-color .15s", whiteSpace: "nowrap", ...style }}>
      {leadIcon}{children}{trailIcon}
    </button>
  );
}

// ============================================================
// Sidebar (with GitHub widget)
// ============================================================
function Sidebar({ active = "Scan history" }: { active?: string }) {
  const main: [string, ReactNode][] = [
    ["Dashboard", <IcDash key="d" size={15} />],
    ["New scan", <IcScan key="s" size={15} />],
    ["Scan history", <IcHistory key="h" size={15} />],
    ["Monitored sites", <IcActivity key="a" size={15} />],
    ["PDF accessibility", <IcFile key="f" size={15} />],
  ];
  const settings: [string, ReactNode][] = [["Profile", <IcUser key="u" size={15} />], ["Billing", <IcCard key="c" size={15} />]];
  const renderGroup = (label: string, items: [string, ReactNode][]) => (
    <div>
      <div style={{ padding: "0 10px 8px", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(([title, ico]) => {
          const isActive = active === title;
          return (
            <button key={title} type="button" style={{ display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 10px", borderRadius: 6, border: 0, background: isActive ? "#0b1f3a" : "transparent", color: isActive ? "#fff" : "#475569", fontWeight: isActive ? 600 : 500, fontSize: 13.5, cursor: "pointer", textAlign: "left", fontFamily: FONT_INTER }}>
              {ico}
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <aside style={{ width: 232, borderRight: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#0b1f3a", letterSpacing: "-0.01em" }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "#06b6d4", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <IcShield size={13} sw={2.5} />
        </span>
        AccessiScan
      </div>
      <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 18, fontFamily: FONT_INTER }}>
        {renderGroup("Main", main)}
        {renderGroup("Settings", settings)}
      </nav>
      <div style={{ padding: "14px 16px", borderTop: "1px solid #e2e8f0", margin: 10, marginTop: 0, borderRadius: 8, background: "#f8fafc" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 6 }}>GitHub</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
          <span style={{ fontSize: 12.5, color: "#0b1f3a", fontWeight: 500, fontFamily: FONT_MONO }}>agency-org/website</span>
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Connected · 4 PRs opened</div>
      </div>
    </aside>
  );
}

// ============================================================
// Topbar
// ============================================================
function Topbar({ title, breadcrumb, action }: { title: string; breadcrumb?: string; action?: ReactNode }) {
  return (
    <header style={{ minHeight: 64, padding: "12px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, background: "#fff", flexShrink: 0 }}>
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        {breadcrumb && <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{breadcrumb}</div>}
        <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, lineHeight: 1.2, color: "#0b1f3a", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}><IcScan size={13} sw={2} /></span>
          <input placeholder="Search scans, sites, criteria…" style={{ height: 32, width: 240, padding: "0 12px 0 30px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12.5, fontFamily: FONT_INTER, color: "#475569", outline: "none" }} />
        </div>
        <button type="button" style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IcBell size={14} /></button>
        {action}
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0b1f3a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_INTER, fontWeight: 600, fontSize: 11.5 }}>EM</div>
      </div>
    </header>
  );
}

// ============================================================
// Scan Header
// ============================================================
function ScanHeader({ onOpenPR }: { onOpenPR: () => void }) {
  const counts = VIOLATIONS.reduce<Record<string, number>>((acc, v) => { acc[v.sev] = (acc[v.sev] || 0) + v.count; return acc; }, {});
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const fixableCount = VIOLATIONS.filter((v) => v.fixable).reduce((a, v) => a + v.count, 0);
  const score = 73;
  const prevScore = 67;
  const r = 48, c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const sevs: Sev[] = ["critical", "serious", "moderate", "minor"];
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>
            <span>Scan #1847</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ color: "#0e7490" }}>WCAG 2.1 AA</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ color: "#dc2626" }}>3 critical fixable</span>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: "#0b1f3a", letterSpacing: "-0.02em" }}>agency.gov</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT_MONO, fontSize: 11.5, color: "#475569", background: "#f1f5f9", padding: "3px 8px", borderRadius: 4 }}>
              <IcExt size={11} sw={2} />https://agency.gov
            </span>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#64748b", fontFamily: FONT_INTER }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IcClock size={13} sw={1.8} />Mar 26, 2026 · 14:22 UTC</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IcFile size={13} sw={1.8} />124 pages crawled</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IcBolt size={13} sw={1.8} />1m 47s</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" size="md" leadIcon={<IcDownload size={13} sw={2} />}>VPAT 2.5</Btn>
            <Btn variant="outline" size="md" leadIcon={<IcDownload size={13} sw={2} />}>Report</Btn>
          </div>
          <Btn variant="cyan" size="lg" onClick={onOpenPR} leadIcon={<IcSparkle size={15} sw={2.2} />} trailIcon={<IcArrow size={13} sw={2.5} />} style={{ boxShadow: "0 8px 20px -10px rgba(6,182,212,0.6), 0 0 0 1px rgba(6,182,212,0.4) inset" }}>
            Open Auto-Fix PR · {fixableCount} fixes
          </Btn>
        </div>
      </div>
      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "240px 1fr", gap: 28, paddingTop: 22, borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
            <svg viewBox="0 0 116 116" width="116" height="116">
              <circle cx="58" cy="58" r={r} stroke="#f1f5f9" strokeWidth="10" fill="none" />
              <circle cx="58" cy="58" r={r} stroke="#06b6d4" strokeWidth="10" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 58 58)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: "#0b1f3a", letterSpacing: "-0.02em", lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginTop: 3 }}>/ 100</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Compliance score</div>
            <div style={{ marginTop: 4, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: "#0b1f3a" }}>Grade {grade} · partial</div>
            <div style={{ marginTop: 6, fontSize: 11.5, color: "#16a34a", fontWeight: 600, fontFamily: FONT_INTER, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span>↑ {score - prevScore}</span>
              <span style={{ color: "#64748b", fontWeight: 400 }}>vs last scan ({prevScore})</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>{total} violations across 11 success criteria</div>
            <div style={{ fontSize: 11.5, color: "#64748b", fontFamily: FONT_INTER }}><b style={{ color: "#0e7490", fontFamily: FONT_MONO, fontSize: 12 }}>69</b> auto-fixable · <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#475569" }}>9</span> manual</div>
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 4, overflow: "hidden", background: "#f1f5f9" }}>
            {sevs.map((s) => <div key={s} style={{ width: `${((counts[s] || 0) / total) * 100}%`, background: SEV[s].color }} />)}
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {sevs.map((s) => (
              <div key={s} style={{ padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: SEV[s].color }} />
                  <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>{SEV[s].label}</span>
                </div>
                <div style={{ marginTop: 6, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: SEV[s].color, letterSpacing: "-0.02em", lineHeight: 1 }}>{counts[s] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Filter Bar
// ============================================================
type Filters = Record<Sev, boolean>;
function FilterBar({ filters, setFilters, query, setQuery, totalShown }: { filters: Filters; setFilters: (f: Filters) => void; query: string; setQuery: (s: string) => void; totalShown: number }) {
  const sevs: Sev[] = ["critical", "serious", "moderate", "minor"];
  const principles = ["All principles", "Perceivable", "Operable", "Understandable", "Robust"];
  const toggle = (s: Sev) => setFilters({ ...filters, [s]: !filters[s] });
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginRight: 4 }}>Severity</span>
        {sevs.map((s) => (
          <button key={s} type="button" onClick={() => toggle(s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 11px", borderRadius: 6, border: `1px solid ${filters[s] ? SEV[s].color : "#e2e8f0"}`, background: filters[s] ? SEV[s].soft : "#fff", color: filters[s] ? SEV[s].color : "#475569", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: filters[s] ? SEV[s].color : "#cbd5e1" }} />
            {SEV[s].label}
          </button>
        ))}
      </div>
      <div style={{ width: 1, height: 22, background: "#e2e8f0" }} />
      <select style={{ height: 28, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontFamily: FONT_INTER, color: "#475569", background: "#fff", cursor: "pointer" }}>
        {principles.map((p) => <option key={p}>{p}</option>)}
      </select>
      <select style={{ height: 28, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontFamily: FONT_INTER, color: "#475569", background: "#fff", cursor: "pointer" }}>
        <option>All pages (124)</option>
        <option>/ (home)</option>
        <option>/services</option>
        <option>/forms/I-90</option>
      </select>
      <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 11px", borderRadius: 6, border: "1px solid #06b6d4", background: "#ecfeff", color: "#0e7490", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer" }}>
        <IcSparkle size={12} sw={2.2} />Auto-fixable only
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}><IcScan size={13} sw={2} /></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search WCAG ID, criterion, selector…" style={{ height: 28, width: 240, padding: "0 10px 0 28px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontFamily: FONT_INTER, color: "#475569", outline: "none" }} />
      </div>
      <span style={{ fontSize: 11.5, color: "#64748b", fontFamily: FONT_INTER }}>{totalShown} shown</span>
    </div>
  );
}

// ============================================================
// Violations Group + Row
// ============================================================
function ViolationRow({ v, last, onPreview, selected }: { v: Violation; last: boolean; onPreview: (v: Violation) => void; selected: boolean }) {
  const sev = SEV[v.sev];
  return (
    <div style={{ padding: "16px 18px", borderBottom: last ? "none" : "1px solid #f1f5f9", background: selected ? "rgba(6,182,212,0.06)" : "#fff", borderLeft: selected ? "3px solid #06b6d4" : "3px solid transparent", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "flex-start", transition: "background-color .15s" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 2 }}>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, color: sev.color, background: sev.soft, padding: "5px 9px", borderRadius: 4, minWidth: 56, textAlign: "center" }}>{v.wcag}</span>
        <span style={{ fontSize: 9.5, letterSpacing: "0.10em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Level {v.level}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT_INTER, fontSize: 14.5, color: "#0b1f3a", fontWeight: 600 }}>{v.criterion}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: 3, fontWeight: 500 }}>×{v.count}</span>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: FONT_INTER }}>{v.principle} · {v.page}</span>
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 11.5, color: "#0b1f3a", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, padding: "7px 10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {v.snippet}
        </div>
        {v.measured && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "#64748b", fontFamily: FONT_INTER, display: "flex", gap: 14 }}>
            <span>Measured: <b style={{ color: "#dc2626", fontFamily: FONT_MONO }}>{v.measured}</b></span>
            <span>Required: <b style={{ color: "#16a34a", fontFamily: FONT_MONO }}>{v.required}</b></span>
          </div>
        )}
        <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#475569", fontFamily: FONT_INTER, lineHeight: 1.5 }}>
          {v.fixable
            ? <span style={{ flexShrink: 0, marginTop: 1, color: "#0e7490" }}><IcSparkle size={13} sw={2.2} /></span>
            : <span style={{ flexShrink: 0, marginTop: 1, color: "#64748b" }}><IcEye size={13} sw={2} /></span>}
          <span><b style={{ color: "#0b1f3a" }}>{v.fixable ? "Suggested fix" : "Manual review"}:</b> {v.fixDesc}</span>
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 11, color: "#64748b" }}>
          <span style={{ color: "#0e7490" }}>{v.file}</span>{v.line > 0 && <>:<span style={{ color: "#0b1f3a", fontWeight: 600 }}>{v.line}</span></>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        {v.fixable
          ? <Btn variant={selected ? "cyan" : "outline"} size="sm" onClick={() => onPreview(v)} leadIcon={<IcPr size={12} sw={2} />} style={selected ? {} : { borderColor: "#06b6d4", color: "#0e7490" }}>{selected ? "Previewing" : "Open Auto-Fix PR"}</Btn>
          : <Btn variant="ghost" size="sm" leadIcon={<IcEye size={12} sw={2} />}>Review</Btn>}
        <button type="button" style={{ fontSize: 11, color: "#64748b", fontFamily: FONT_INTER, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>Ignore</button>
      </div>
    </div>
  );
}

function ViolationsGroup({ sev, items, expanded, setExpanded, onPreview, selectedId }: { sev: Sev; items: Violation[]; expanded: Record<Sev, boolean>; setExpanded: (e: Record<Sev, boolean>) => void; onPreview: (v: Violation) => void; selectedId: string }) {
  const totalCount = items.reduce((a, v) => a + v.count, 0);
  const fixable = items.filter((v) => v.fixable).reduce((a, v) => a + v.count, 0);
  const isOpen = expanded[sev] !== false;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <button type="button" onClick={() => setExpanded({ ...expanded, [sev]: !isOpen })} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: isOpen ? "1px solid #f1f5f9" : "none", background: "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
        {isOpen ? <IcChevD size={14} sw={2} style={{ color: "#64748b" }} /> : <IcChevR size={14} sw={2} style={{ color: "#64748b" }} />}
        <span style={{ width: 8, height: 8, borderRadius: 2, background: SEV[sev].color }} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#0b1f3a" }}>{SEV[sev].label}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: SEV[sev].color, background: SEV[sev].soft, padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>{totalCount} instances · {items.length} criteria</span>
        <div style={{ flex: 1 }} />
        {fixable > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#0e7490", fontFamily: FONT_INTER, fontWeight: 600 }}>
            <IcSparkle size={12} sw={2.2} />{fixable} auto-fixable
          </span>
        )}
      </button>
      {isOpen && items.map((v, i) => <ViolationRow key={v.id} v={v} last={i === items.length - 1} onPreview={onPreview} selected={selectedId === v.id} />)}
    </div>
  );
}

// ============================================================
// PR Panel + DiffView + QueueView + CommitView
// ============================================================
function DiffView({ v }: { v: Violation | undefined }) {
  if (!v || !v.diffOld || !v.diffNew) {
    return <div style={{ padding: 22, fontFamily: FONT_INTER, fontSize: 12.5, color: "#64748b" }}>Select a violation to preview its fix.</div>;
  }
  const oldLines = v.diffOld.split("\n");
  const newLines = v.diffNew.split("\n");
  return (
    <div style={{ padding: 14, fontFamily: FONT_MONO, fontSize: 11.5 }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ padding: "8px 12px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IcFile size={12} sw={2} style={{ color: "#64748b" }} />
            <span style={{ color: "#0b1f3a", fontWeight: 600 }}>{v.file}</span>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <span style={{ color: "#dc2626", fontWeight: 600 }}>−{oldLines.length}</span>
            <span style={{ color: "#16a34a", fontWeight: 600 }}>+{newLines.length}</span>
          </div>
        </div>
        <div style={{ padding: "6px 12px", background: "#fafbfc", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontSize: 10.5 }}>@@ -{v.line},{oldLines.length} +{v.line},{newLines.length} @@ {v.selector}</div>
        {oldLines.map((line, i) => (
          <div key={`o${i}`} style={{ display: "grid", gridTemplateColumns: "32px 16px 1fr", background: "#fef2f2", color: "#7f1d1d", borderLeft: "2px solid #dc2626" }}>
            <span style={{ padding: "3px 8px", color: "#fca5a5", textAlign: "right", borderRight: "1px solid rgba(220,38,38,0.15)", fontSize: 10 }}>{v.line + i}</span>
            <span style={{ padding: "3px 0 3px 6px", color: "#dc2626" }}>−</span>
            <span style={{ padding: "3px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
          </div>
        ))}
        {newLines.map((line, i) => (
          <div key={`n${i}`} style={{ display: "grid", gridTemplateColumns: "32px 16px 1fr", background: "#f0fdf4", color: "#14532d", borderLeft: "2px solid #16a34a" }}>
            <span style={{ padding: "3px 8px", color: "#86efac", textAlign: "right", borderRight: "1px solid rgba(22,163,74,0.15)", fontSize: 10 }}>{v.line + i}</span>
            <span style={{ padding: "3px 0 3px 6px", color: "#16a34a" }}>+</span>
            <span style={{ padding: "3px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, background: "#ecfeff", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 6, fontFamily: FONT_INTER, fontSize: 12, color: "#0b1f3a", lineHeight: 1.5 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <IcSparkle size={11} sw={2.2} />Why this fix
        </div>
        <div>{v.fixDesc}. WCAG <b style={{ fontFamily: FONT_MONO }}>{v.wcag}</b> requires {v.measured ? `a ${v.required} contrast ratio` : "this attribute"} — applies to <b style={{ fontFamily: FONT_MONO }}>×{v.count}</b> instance{v.count > 1 ? "s" : ""} of the selector.</div>
      </div>
    </div>
  );
}

function QueueView({ allFixable, queueIds, toggleQueue }: { allFixable: Violation[]; queueIds: string[]; toggleQueue: (id: string) => void }) {
  return (
    <div style={{ padding: 14, fontFamily: FONT_INTER }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>Toggle which fixes go into this PR. We recommend grouping by severity.</div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
        {allFixable.map((v, i) => {
          const checked = queueIds.includes(v.id);
          return (
            <label key={v.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderBottom: i === allFixable.length - 1 ? "none" : "1px solid #f1f5f9", cursor: "pointer", fontSize: 12.5, color: "#0b1f3a", background: checked ? "#f8fafc" : "#fff" }}>
              <input type="checkbox" checked={checked} onChange={() => toggleQueue(v.id)} style={{ accentColor: "#06b6d4", marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, fontWeight: 700, color: SEV[v.sev].color, background: SEV[v.sev].soft, padding: "2px 6px", borderRadius: 3 }}>{v.wcag}</span>
                  <span style={{ fontWeight: 600 }}>{v.criterion}</span>
                </div>
                <div style={{ marginTop: 3, fontSize: 11, color: "#64748b", fontFamily: FONT_MONO, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.file}</div>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: "#64748b", fontWeight: 600 }}>×{v.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function CommitView({ queueIds, branchName }: { queueIds: string[]; branchName: string }) {
  const fixes = VIOLATIONS.filter((v) => queueIds.includes(v.id));
  const wcagIds = fixes.map((v) => v.wcag).join(", ");
  const total = fixes.reduce((a, v) => a + v.count, 0);
  const description = `Auto-generated by AccessiScan from scan #1847.

Fixes ${total} accessibility violations across ${fixes.length} success criteria:
${fixes.slice(0, 4).map((v) => `  • ${v.wcag} ${v.criterion} (×${v.count})`).join("\n")}${fixes.length > 4 ? `\n  • ...and ${fixes.length - 4} more` : ""}

WCAG: ${wcagIds}
Engine: axe-core 4.10 + AccessiScan AI
Verified: zero new violations introduced

Co-Authored-By: AccessiScan <bot@accessiscan.piposlab.com>`;
  return (
    <div style={{ padding: 14, fontFamily: FONT_INTER, fontSize: 12.5 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 6 }}>PR title</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: "#0b1f3a", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px", fontWeight: 600 }}>
        a11y: fix {fixes.length} WCAG 2.1 AA violations on agency.gov
      </div>
      <div style={{ marginTop: 14, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Description</div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, fontFamily: FONT_MONO, fontSize: 11.5, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{description}</div>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Target branch" v="main" />
        <Field label="Source branch" v={branchName} mono />
        <Field label="Reviewers" v="@a11y-team" />
        <Field label="Labels" v="accessibility, automated" />
      </div>
    </div>
  );
}

function Field({ label, v, mono }: { label: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "#0b1f3a", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "6px 8px", fontFamily: mono ? FONT_MONO : FONT_INTER, fontWeight: 500 }}>{v}</div>
    </div>
  );
}

function PRPanel({ violation, onClose, allFixable, queueIds, toggleQueue }: { violation: Violation | undefined; onClose: () => void; allFixable: Violation[]; queueIds: string[]; toggleQueue: (id: string) => void }) {
  const [tab, setTab] = useState<"diff" | "queue" | "commit">("diff");
  const branchName = "accessiscan/auto-fix-1847";
  const queued = queueIds.length;
  const totalQueuedFixes = VIOLATIONS.filter((x) => queueIds.includes(x.id)).reduce((a, x) => a + x.count, 0);
  return (
    <aside style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden", position: "sticky", top: 16, height: "calc(100vh - 96px)" }}>
      <div style={{ background: "#0b1f3a", padding: "14px 18px", color: "#fff", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: "#06b6d4", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <IcSparkle size={13} sw={2.2} />
            </span>
            <div>
              <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Auto-Fix PR preview</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: "#fff", marginTop: 2 }}>{queued} {queued === 1 ? "fix" : "fixes"} queued</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IcX size={13} sw={2} />
          </button>
        </div>
      </div>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontFamily: FONT_INTER, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0b1f3a" }}>
          <IcGithub size={13} sw={2} />
          <span style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>agency-org/website</span>
        </div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO, fontSize: 11, color: "#64748b" }}>
          <IcBranch size={12} sw={2} />
          <span style={{ color: "#475569" }}>main</span>
          <IcArrow size={11} sw={2.5} style={{ color: "#cbd5e1" }} />
          <span style={{ color: "#0e7490", fontWeight: 600 }}>{branchName}</span>
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 12px", flexShrink: 0 }}>
        {([["diff", "Diff"], ["queue", `Queue (${queued})`], ["commit", "Commit"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} style={{ padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, color: tab === k ? "#0b1f3a" : "#64748b", borderBottom: tab === k ? "2px solid #06b6d4" : "2px solid transparent" }}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "#f8fafc" }}>
        {tab === "diff" && <DiffView v={violation} />}
        {tab === "queue" && <QueueView allFixable={allFixable} queueIds={queueIds} toggleQueue={toggleQueue} />}
        {tab === "commit" && <CommitView queueIds={queueIds} branchName={branchName} />}
      </div>
      <div style={{ padding: "14px 18px", borderTop: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, fontFamily: FONT_INTER, color: "#64748b" }}>
          <span>Affects <b style={{ color: "#0b1f3a", fontFamily: FONT_MONO }}>{queued}</b> files · <b style={{ color: "#0b1f3a", fontFamily: FONT_MONO }}>{totalQueuedFixes}</b> instances</span>
          <span style={{ color: "#16a34a", fontWeight: 600, fontFamily: FONT_INTER, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IcCheck size={11} sw={2.5} />CI: axe-core passing
          </span>
        </div>
        <Btn variant="cyan" size="lg" leadIcon={<IcGithub size={14} sw={2} />} trailIcon={<IcExt size={12} sw={2} />} style={{ justifyContent: "center", boxShadow: "0 6px 16px -8px rgba(6,182,212,0.55)" }}>
          Open PR on GitHub
        </Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" size="sm" style={{ flex: 1, justifyContent: "center" }} leadIcon={<IcCopy size={12} sw={2} />}>Copy patch</Btn>
          <Btn variant="outline" size="sm" style={{ flex: 1, justifyContent: "center" }} leadIcon={<IcDownload size={12} sw={2} />}>Download .patch</Btn>
        </div>
        <div style={{ fontSize: 10.5, color: "#64748b", fontFamily: FONT_INTER, lineHeight: 1.5, textAlign: "center" }}>
          Patches written by Claude · review before merge · AccessiScan does not warrant legal compliance.
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// Page composition
// ============================================================
export default function ScanResultV2PreviewPage() {
  const [filters, setFilters] = useState<Filters>({ critical: true, serious: true, moderate: true, minor: true });
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<Sev, boolean>>({ critical: true, serious: true, moderate: true, minor: false });
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedId, setSelectedId] = useState("v1");
  const allFixable = VIOLATIONS.filter((v) => v.fixable);
  const [queueIds, setQueueIds] = useState<string[]>(allFixable.map((v) => v.id));

  const filtered = useMemo(() => {
    return VIOLATIONS.filter((v) => {
      if (!filters[v.sev]) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!v.wcag.toLowerCase().includes(q) && !v.criterion.toLowerCase().includes(q) && !v.selector.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filters, query]);

  const grouped = useMemo<Record<Sev, Violation[]>>(() => {
    const g: Record<Sev, Violation[]> = { critical: [], serious: [], moderate: [], minor: [] };
    filtered.forEach((v) => g[v.sev].push(v));
    return g;
  }, [filtered]);

  const selected = VIOLATIONS.find((v) => v.id === selectedId);
  const onPreview = (v: Violation) => {
    setSelectedId(v.id);
    setPanelOpen(true);
    if (!queueIds.includes(v.id)) setQueueIds([...queueIds, v.id]);
  };
  const toggleQueue = (id: string) => {
    setQueueIds(queueIds.includes(id) ? queueIds.filter((x) => x !== id) : [...queueIds, id]);
  };

  const headerAction = !panelOpen ? (
    <Btn variant="cyan" size="md" onClick={() => setPanelOpen(true)} leadIcon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>} style={{ boxShadow: "0 4px 12px -4px rgba(6,182,212,0.5)" }}>
      Auto-Fix PR · {queueIds.length}
    </Btn>
  ) : null;

  const sevs: Sev[] = ["critical", "serious", "moderate", "minor"];

  return (
    <>
      <style>{`body { background: #f8fafc; }`}</style>
      <div style={{ display: "flex", height: "100vh", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Scan history" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar title="agency.gov · scan #1847" breadcrumb="Scans · Results" action={headerAction} />
          <main style={{ flex: 1, overflow: "auto", background: "#f8fafc" }}>
            <div style={{ display: "grid", gridTemplateColumns: panelOpen ? "1fr 420px" : "1fr", gap: 16, padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                <ScanHeader onOpenPR={() => setPanelOpen(true)} />
                <FilterBar filters={filters} setFilters={setFilters} query={query} setQuery={setQuery} totalShown={filtered.length} />
                {sevs.map((sev) => (grouped[sev].length > 0 && (
                  <ViolationsGroup key={sev} sev={sev} items={grouped[sev]} expanded={expanded} setExpanded={setExpanded} onPreview={onPreview} selectedId={selectedId} />
                )))}
                {filtered.length === 0 && (
                  <div style={{ background: "#fff", border: "1px dashed #e2e8f0", borderRadius: 8, padding: 40, textAlign: "center", fontFamily: FONT_INTER, color: "#64748b", fontSize: 13 }}>
                    No violations match the current filters.
                  </div>
                )}
              </div>
              {panelOpen && <PRPanel violation={selected} onClose={() => setPanelOpen(false)} allFixable={allFixable} queueIds={queueIds} toggleQueue={toggleQueue} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

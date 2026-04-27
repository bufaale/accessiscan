"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// ============================================================
// Icons (JSX paths, no innerHTML)
// ============================================================

type IcProps = { size?: number; sw?: number; style?: CSSProperties };

function IcShield({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" /></svg>;
}
function IcDash({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>;
}
function IcScan({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function IcHistory({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 16 14" /></svg>;
}
function IcActivity({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}
function IcFile({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function IcUser({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function IcCard({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
}
function IcGlobe({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
function IcAlert({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function IcPr({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></svg>;
}
function IcBell({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}
function IcGithub({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
}
function IcArrow({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Buttons
// ============================================================

type BtnVariant = "primary" | "urgent" | "outline" | "cyan" | "ghost";
type BtnSize = "sm" | "md" | "lg";

function Btn({ children, variant = "primary", size = "md", leadIcon, trailIcon, style }: { children: ReactNode; variant?: BtnVariant; size?: BtnSize; leadIcon?: ReactNode; trailIcon?: ReactNode; style?: CSSProperties }) {
  const sizes: Record<BtnSize, { h: number; px: number; fs: number }> = { lg: { h: 44, px: 18, fs: 14 }, md: { h: 36, px: 14, fs: 13.5 }, sm: { h: 30, px: 10, fs: 12.5 } };
  const s = sizes[size];
  const variants: Record<BtnVariant, { bg: string; color: string; border: string }> = {
    primary: { bg: "#0b1f3a", color: "#fff", border: "none" },
    urgent: { bg: "#dc2626", color: "#fff", border: "none" },
    outline: { bg: "#fff", color: "#0b1f3a", border: "1px solid #cbd5e1" },
    cyan: { bg: "#06b6d4", color: "#fff", border: "none" },
    ghost: { bg: "transparent", color: "#475569", border: "none" },
  };
  const v = variants[variant];
  return (
    <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: v.bg, color: v.color, border: v.border, transition: "background-color .15s,border-color .15s", ...style }}>
      {leadIcon}{children}{trailIcon}
    </button>
  );
}

// ============================================================
// Sidebar
// ============================================================

type SidebarItem = { label: string; icon: ReactNode };

function Sidebar({ active = "Dashboard" }: { active?: string }) {
  const main: SidebarItem[] = [
    { label: "Dashboard", icon: <IcDash size={15} /> },
    { label: "New scan", icon: <IcScan size={15} /> },
    { label: "Scan history", icon: <IcHistory size={15} /> },
    { label: "Monitored sites", icon: <IcActivity size={15} /> },
    { label: "PDF accessibility", icon: <IcFile size={15} /> },
  ];
  const settings: SidebarItem[] = [
    { label: "Profile", icon: <IcUser size={15} /> },
    { label: "Billing", icon: <IcCard size={15} /> },
  ];
  const renderGroup = (label: string, items: SidebarItem[]) => (
    <div>
      <div style={{ padding: "0 10px 8px", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it) => {
          const isActive = active === it.label;
          return (
            <button key={it.label} type="button" style={{ display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 10px", borderRadius: 6, border: 0, background: isActive ? "#0b1f3a" : "transparent", color: isActive ? "#fff" : "#475569", fontWeight: isActive ? 600 : 500, fontSize: 13.5, cursor: "pointer", textAlign: "left", fontFamily: FONT_INTER }}>
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <aside style={{ width: 248, borderRight: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
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
      <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#64748b", fontFamily: FONT_INTER }}>AccessiScan v1.0</div>
    </aside>
  );
}

// ============================================================
// Topbar
// ============================================================

function Topbar({ title, breadcrumb, action }: { title: string; breadcrumb?: string; action?: ReactNode }) {
  return (
    <header style={{ minHeight: 88, padding: "16px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, background: "#fff", flexShrink: 0 }}>
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        {breadcrumb && <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{breadcrumb}</div>}
        <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, lineHeight: 1.2, color: "#0b1f3a", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}><IcScan size={14} sw={2} /></span>
          <input placeholder="Search scans, sites, criteria…" style={{ height: 36, width: 280, padding: "0 12px 0 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: FONT_INTER, color: "#475569", outline: "none" }} />
        </div>
        <button type="button" style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><IcBell size={15} /></button>
        {action}
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0b1f3a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_INTER, fontWeight: 600, fontSize: 12 }}>EM</div>
      </div>
    </header>
  );
}

// ============================================================
// DOJ Urgent Strip (in-dashboard banner)
// ============================================================

function DojUrgentStrip() {
  const target = new Date("2027-04-26T00:00:00Z").getTime();
  const now = Date.now();
  const days = Math.max(0, Math.round((target - now) / 86400000));
  return (
    <div style={{ background: "#0b1f3a", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontFamily: FONT_INTER, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <span style={{ width: 36, height: 36, borderRadius: 6, background: "#dc2626", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IcAlert size={17} sw={2.2} />
        </span>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", fontWeight: 700, marginBottom: 3 }}>DOJ Title II · WCAG 2.1 AA · 50,000+ residents</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            <span style={{ fontFamily: FONT_MONO, color: "#dc2626", fontWeight: 700 }}>{days}</span>{" "}days until enforcement deadline · April 26, 2027
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", fontFamily: FONT_INTER, marginRight: 4 }}>
          Your readiness: <span style={{ color: "#0e7490", fontWeight: 600 }}>87%</span>
        </span>
        <Btn size="sm" variant="urgent" trailIcon={<IcArrow size={11} sw={2.5} />}>Open Title II checklist</Btn>
      </div>
    </div>
  );
}

// ============================================================
// KPI Cards
// ============================================================

function KpiCards() {
  type Card = { title: string; value: string; suffix?: string; icon: ReactNode; sub: string; danger?: boolean; delta?: { up: boolean; text: string; neutral?: boolean; good?: boolean } };
  const cards: Card[] = [
    { title: "Sites tracked", value: "12", icon: <IcGlobe size={14} sw={1.9} />, sub: "Across 3 workspaces", delta: { up: true, text: "+2 this month", neutral: true } },
    { title: "Total scans", value: "1,847", icon: <IcScan size={14} sw={1.9} />, sub: "Lifetime, all sites", delta: { up: true, text: "+108 this week" } },
    { title: "Avg compliance score", value: "87", suffix: "/100", icon: <IcShield size={14} sw={1.9} />, sub: "WCAG 2.1 AA", delta: { up: true, text: "+4 vs last month" } },
    { title: "Critical issues", value: "13", icon: <IcAlert size={14} sw={1.9} />, danger: true, sub: "Across 4 sites", delta: { up: false, good: true, text: "−2 vs last week" } },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {cards.map((s) => (
        <div key={s.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: FONT_INTER, letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.title}</span>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: s.danger ? "rgba(220,38,38,0.08)" : "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center", color: s.danger ? "#dc2626" : "#64748b" }}>{s.icon}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: 1, color: s.danger ? "#dc2626" : "#0b1f3a", letterSpacing: "-0.02em" }}>{s.value}</span>
            {s.suffix && <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 16, color: "#64748b" }}>{s.suffix}</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 4 }}>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>{s.sub}</span>
            {s.delta && <span style={{ fontSize: 11.5, fontWeight: 600, color: s.delta.neutral ? "#64748b" : s.delta.good === false ? "#dc2626" : "#16a34a", fontFamily: FONT_INTER, display: "inline-flex", alignItems: "center", gap: 3 }}>{s.delta.up ? "▲" : "▼"} {s.delta.text}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// WCAG Breakdown — donut + horizontal bars per POUR principle
// ============================================================

function WcagBreakdown() {
  const score = 87;
  const r = 64;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  type P = { key: string; name: string; desc: string; v: number; pass: number; fail: number; danger?: boolean };
  const principles: P[] = [
    { key: "P", name: "Perceivable", desc: "Alt text, contrast, captions", v: 91, pass: 142, fail: 14 },
    { key: "O", name: "Operable", desc: "Keyboard, focus, navigation", v: 88, pass: 96, fail: 13 },
    { key: "U", name: "Understandable", desc: "Labels, language, errors", v: 84, pass: 71, fail: 14 },
    { key: "R", name: "Robust", desc: "Parsing, ARIA, name/role/value", v: 72, pass: 36, fail: 14, danger: true },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 24, display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingRight: 24, borderRight: "1px solid #f1f5f9" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 6 }}>WCAG 2.1 AA · overall</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>POUR principle breakdown.</div>
        </div>
        <div style={{ position: "relative", width: 180, height: 180, margin: "8px auto 0" }}>
          <svg viewBox="0 0 180 180" width="180" height="180">
            <circle cx="90" cy="90" r={r} stroke="#f1f5f9" strokeWidth="14" fill="none" />
            <circle cx="90" cy="90" r={r} stroke="#06b6d4" strokeWidth="14" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 90 90)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: "#0b1f3a", letterSpacing: "-0.03em", lineHeight: 1 }}>{score}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 4 }}>/ 100</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #f1f5f9", fontSize: 11.5, fontFamily: FONT_INTER }}>
          {[["Passing", "345", "#16a34a"], ["Failing", "55", "#dc2626"], ["N/A", "23", "#64748b"]].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ color: "#64748b", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, color, fontWeight: 700, marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Principles</div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Score per WCAG principle, weighted by criterion impact.</div>
          </div>
          <span style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, fontFamily: FONT_INTER }}>Pass / Fail</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {principles.map((p) => {
            const color = p.danger ? "#dc2626" : p.v >= 90 ? "#06b6d4" : "#0b1f3a";
            return (
              <div key={p.name} style={{ display: "grid", gridTemplateColumns: "32px 200px 1fr 60px 90px", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: p.danger ? "rgba(220,38,38,0.08)" : "rgba(6,182,212,0.08)", color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13 }}>{p.key}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{p.desc}</div>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${p.v}%`, height: "100%", background: color, transition: "width .4s ease" }} />
                </div>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color, textAlign: "right", letterSpacing: "-0.02em" }}>{p.v}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#64748b", textAlign: "right", fontWeight: 500 }}>
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>{p.pass}</span>
                  <span style={{ color: "#cbd5e1", margin: "0 4px" }}>/</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{p.fail}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Compliance Trend (area chart)
// ============================================================

function ComplianceTrend() {
  const [range, setRange] = useState("Last 30 days");
  const data = [78, 79, 81, 80, 82, 81, 83, 82, 80, 78, 79, 81, 83, 82, 84, 85, 84, 86, 85, 86, 84, 85, 86, 87, 86, 87, 88, 86, 87, 87];
  const targetLine = 90;
  const w = 920, h = 220, padL = 36, padR = 16, padT = 16, padB = 32;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * chartW);
  const ys = data.map((v) => padT + chartH - (v / 100) * chartH);
  const linePts = data.map((_, i) => `${xs[i]},${ys[i]}`).join(" ");
  const areaPts = `${padL},${padT + chartH} ${linePts} ${padL + chartW},${padT + chartH}`;
  const last = data.length - 1;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Compliance trend.</div>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Average WCAG 2.1 AA score across all 12 monitored sites.</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11.5, fontFamily: FONT_INTER, color: "#64748b" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 18, height: 2, background: "#0b1f3a", borderRadius: 1 }} /> Score
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 18, height: 0, borderTop: "1.5px dashed #dc2626" }} /> Target
          </span>
          <select value={range} onChange={(e) => setRange(e.target.value)} style={{ height: 32, padding: "0 28px 0 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12.5, fontFamily: FONT_INTER, fontWeight: 500, color: "#0b1f3a", background: "#fff", cursor: "pointer", marginLeft: 4 }}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </select>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block", marginTop: 14 }}>
        <defs>
          <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[60, 70, 80, 90, 100].map((g) => {
          const y = padT + chartH - (g / 100) * chartH;
          return (
            <g key={g}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 8} y={y + 3} fontSize="10" fontFamily={FONT_MONO} fill="#94a3b8" textAnchor="end">{g}</text>
            </g>
          );
        })}
        {[0, 7, 14, 21, 29].map((i) => {
          const labels = ["Mar 28", "Apr 4", "Apr 11", "Apr 18", "Apr 26"];
          const idx = [0, 7, 14, 21, 29].indexOf(i);
          return (
            <text key={i} x={xs[i]} y={h - 10} fontSize="10" fontFamily={FONT_INTER} fill="#94a3b8" textAnchor="middle">{labels[idx]}</text>
          );
        })}
        <line x1={padL} x2={w - padR} y1={padT + chartH - (targetLine / 100) * chartH} y2={padT + chartH - (targetLine / 100) * chartH} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <text x={w - padR - 4} y={padT + chartH - (targetLine / 100) * chartH - 4} fontSize="9.5" fontFamily={FONT_INTER} fill="#dc2626" textAnchor="end" fontWeight="600" letterSpacing="0.08em">VPAT TARGET · 90</text>
        <polyline points={areaPts} fill="url(#cyanFill)" stroke="none" />
        <polyline points={linePts} fill="none" stroke="#0b1f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[last]} cy={ys[last]} r="5" fill="#06b6d4" stroke="#fff" strokeWidth="2.5" />
        <g transform={`translate(${xs[last] - 50}, ${ys[last] - 38})`}>
          <rect width="100" height="28" rx="4" fill="#0b1f3a" />
          <text x="50" y="18" fontSize="11.5" fontFamily={FONT_INTER} fill="#fff" textAnchor="middle" fontWeight="600">Today · 87</text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Top Violations Table
// ============================================================

function TopViolationsTable() {
  type V = { id: string; label: string; desc: string; sev: "critical" | "serious" | "moderate" | "minor"; count: number; sites: number; trend: number; fixable: boolean };
  const list: V[] = [
    { id: "1.4.3", label: "Contrast (minimum)", desc: "Text and background do not meet 4.5:1 ratio", sev: "critical", count: 47, sites: 6, trend: -8, fixable: true },
    { id: "1.1.1", label: "Non-text content", desc: "Images, controls, or media missing alt text", sev: "critical", count: 28, sites: 5, trend: -3, fixable: true },
    { id: "4.1.2", label: "Name, role, value", desc: "Custom controls missing accessible names", sev: "serious", count: 19, sites: 4, trend: 2, fixable: true },
    { id: "2.4.4", label: "Link purpose (in context)", desc: "Ambiguous link text — \"click here\", \"read more\"", sev: "moderate", count: 12, sites: 3, trend: -1, fixable: false },
    { id: "3.3.2", label: "Labels or instructions", desc: "Form inputs missing visible labels", sev: "moderate", count: 8, sites: 2, trend: 0, fixable: true },
    { id: "2.1.1", label: "Keyboard", desc: "Functionality not available via keyboard", sev: "minor", count: 4, sites: 1, trend: -2, fixable: false },
  ];
  const sevMap: Record<V["sev"], { color: string; bg: string; label: string }> = {
    critical: { color: "#dc2626", bg: "rgba(220,38,38,0.08)", label: "Critical" },
    serious: { color: "#b45309", bg: "rgba(245,158,11,0.12)", label: "Serious" },
    moderate: { color: "#0b6b7c", bg: "rgba(6,182,212,0.12)", label: "Moderate" },
    minor: { color: "#475569", bg: "#f1f5f9", label: "Minor" },
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Top violations.</div>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Most frequent WCAG criteria failing across all monitored sites.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" size="sm" leadIcon={<IcGithub size={12} sw={2} />}>Auto-Fix all (94)</Btn>
          <Btn variant="ghost" size="sm" trailIcon={<IcArrow size={11} sw={2.5} />}>View all</Btn>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {([["Criterion", "left"], ["Severity", "left"], ["Failing instances", "right"], ["Sites affected", "right"], ["7-day trend", "right"], ["", "right"]] as const).map(([h, a]) => (
              <th key={h} style={{ padding: "10px 20px", textAlign: a, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((v, i) => {
            const sv = sevMap[v.sev];
            return (
              <tr key={v.id} style={{ borderBottom: i === list.length - 1 ? 0 : "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 11.5, color: "#0b1f3a", background: "#f1f5f9", padding: "4px 8px", borderRadius: 4, letterSpacing: "0.04em" }}>{v.id}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0b1f3a", fontSize: 13.5 }}>{v.label}</div>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, maxWidth: 380 }}>{v.desc}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 4, background: sv.bg, color: sv.color, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: FONT_INTER }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sv.color }} />{sv.label}
                  </span>
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: "#0b1f3a" }}>{v.count}</td>
                <td style={{ padding: "16px 20px", textAlign: "right", fontFamily: FONT_MONO, fontWeight: 600, color: "#475569" }}>{v.sites}</td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, color: v.trend < 0 ? "#16a34a" : v.trend > 0 ? "#dc2626" : "#94a3b8" }}>
                    {v.trend < 0 ? "▼" : v.trend > 0 ? "▲" : "—"} {v.trend !== 0 ? Math.abs(v.trend) : ""}
                  </span>
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  {v.fixable ? <Btn variant="cyan" size="sm" leadIcon={<IcPr size={11} sw={2} />}>Fix in PR</Btn> : <span style={{ fontSize: 11, color: "#64748b", fontFamily: FONT_INTER, fontWeight: 500 }}>Manual review</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Recent Scans Table
// ============================================================

function RecentScansTable() {
  type Row = { url: string; date: string; score: number | null; status: "completed" | "analyzing" | "failed"; critical: number | null; pages: number };
  const rows: Row[] = [
    { url: "agency.gov", date: "Today · 14:22", score: 87, status: "completed", critical: 3, pages: 124 },
    { url: "agency.gov/forms/I-90", date: "Today · 11:08", score: 71, status: "completed", critical: 8, pages: 12 },
    { url: "permits.agency.gov", date: "Today · 09:42", score: 94, status: "completed", critical: 0, pages: 38 },
    { url: "internal.agency.gov", date: "Yesterday · 22:14", score: null, status: "analyzing", critical: null, pages: 47 },
    { url: "agency.gov/news", date: "Yesterday · 16:30", score: 82, status: "completed", critical: 1, pages: 89 },
    { url: "staging.agency.gov", date: "Apr 24 · 08:11", score: null, status: "failed", critical: null, pages: 0 },
  ];
  const Status = ({ s }: { s: Row["status"] }) => {
    const m: Record<Row["status"], { color: string; bg: string; label: string }> = {
      completed: { color: "#16a34a", bg: "rgba(22,163,74,0.10)", label: "Completed" },
      analyzing: { color: "#7c3aed", bg: "rgba(124,58,237,0.10)", label: "Analyzing" },
      failed: { color: "#dc2626", bg: "rgba(220,38,38,0.10)", label: "Failed" },
    };
    const it = m[s];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 9999, background: it.bg, color: it.color, fontSize: 11, fontWeight: 600 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.color, ...(s === "analyzing" ? { animation: "ascanPulse 1.4s ease-in-out infinite" } : {}) }} />
        {it.label}
      </span>
    );
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Recent scans.</div>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Latest 6 scans across all monitored sites.</div>
        </div>
        <Btn variant="ghost" size="sm" trailIcon={<IcArrow size={11} sw={2.5} />}>View all</Btn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {([["Site", "left"], ["Scanned", "left"], ["Pages", "right"], ["Score", "right"], ["Critical", "right"], ["Status", "left"], ["", "right"]] as const).map(([h, a]) => (
              <th key={h} style={{ padding: "10px 20px", textAlign: a, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.url}-${i}`} style={{ borderBottom: i === rows.length - 1 ? 0 : "1px solid #f1f5f9" }}>
              <td style={{ padding: "14px 20px" }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: "#0b1f3a", fontWeight: 600 }}>{r.url}</div>
              </td>
              <td style={{ padding: "14px 20px", color: "#64748b", fontSize: 12.5 }}>{r.date}</td>
              <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: FONT_MONO, color: "#475569", fontWeight: 500 }}>{r.pages || "—"}</td>
              <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: r.score === null ? "#cbd5e1" : r.score >= 90 ? "#16a34a" : r.score >= 80 ? "#0b1f3a" : "#dc2626" }}>{r.score ?? "—"}</td>
              <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: FONT_MONO, fontWeight: 700, color: r.critical === null ? "#cbd5e1" : r.critical === 0 ? "#16a34a" : "#dc2626" }}>{r.critical ?? "—"}</td>
              <td style={{ padding: "14px 20px" }}><Status s={r.status} /></td>
              <td style={{ padding: "14px 20px", textAlign: "right" }}>
                <button type="button" style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 14, fontWeight: 700, letterSpacing: "1px" }}>⋯</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Page composition
// ============================================================

export default function DashboardV2PreviewPage() {
  return (
    <>
      <style>{`
        @keyframes ascanPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }
        body { background: #f8fafc; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Dashboard" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar
            title="Compliance overview"
            breadcrumb="Workspace · Acme Agency · Compliance"
            action={<Btn variant="primary" size="md">+ New scan</Btn>}
          />
          <main style={{ flex: 1, padding: "24px 28px 64px", background: "#f8fafc", overflow: "auto" }}>
            <DojUrgentStrip />
            <div style={{ marginTop: 18 }}><KpiCards /></div>
            <div style={{ marginTop: 14 }}><WcagBreakdown /></div>
            <div style={{ marginTop: 14 }}><ComplianceTrend /></div>
            <div style={{ marginTop: 14 }}><TopViolationsTable /></div>
            <div style={{ marginTop: 14 }}><RecentScansTable /></div>
          </main>
        </div>
      </div>
    </>
  );
}

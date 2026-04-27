"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

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
function IcBell({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}
function IcArrow({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function IcAlert({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function IcPlus({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IcMore({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
}
function IcExt({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function IcSettings({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}
function IcPause({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
}
function IcPlay({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polygon points="5 3 19 12 5 21 5 3" /></svg>;
}
function IcClock({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function IcTrash({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>;
}
function IcEdit({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function IcZap({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
}
function IcTrendUp({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
function IcTrendDown({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>;
}
function IcGlobe({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
function IcCheck({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="20 6 9 17 4 12" /></svg>;
}
function IcX({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Sidebar
// ============================================================

type SidebarItem = { label: string; icon: ReactNode };

function Sidebar({ active = "Monitored sites" }: { active?: string }) {
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
      <div style={{ padding: "0 10px 8px", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>{label}</div>
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
      <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", fontFamily: FONT_INTER }}>AccessiScan v1.0</div>
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
        {breadcrumb && <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{breadcrumb}</div>}
        <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, lineHeight: 1.2, color: "#0b1f3a", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><IcScan size={14} sw={2} /></span>
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
// Score helpers
// ============================================================

function scoreColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 80) return "#0b1f3a";
  if (score >= 70) return "#f59e0b";
  return "#dc2626";
}
function scoreGrade(score: number): string {
  if (score >= 95) return "VPAT-ready";
  if (score >= 90) return "AA conformant";
  if (score >= 80) return "Near AA";
  if (score >= 70) return "Below AA";
  return "Non-conformant";
}

// ============================================================
// Pro Upsell Banner (Free tier only)
// ============================================================

function ProUpsellBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ background: "#0b1f3a", borderRadius: 8, padding: "18px 22px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, position: "relative", overflow: "hidden", marginBottom: 18 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", minWidth: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0e7490" }}>
          <IcZap size={20} sw={2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", border: "1px solid rgba(6,182,212,0.4)", background: "rgba(6,182,212,0.1)", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", marginBottom: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#06b6d4" }} />Pro tier
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            Upgrade to monitor sites continuously.
          </div>
          <div style={{ marginTop: 4, fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            Daily scans · regression alerts · VPAT-ready trend reports — across up to 25 sites.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, position: "relative" }}>
        <button type="button" style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)" }}>Compare plans</button>
        <button type="button" style={{ height: 36, padding: "0 16px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#06b6d4", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
          Upgrade — $19/mo<IcArrow size={12} sw={2.5} />
        </button>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
          <IcX size={14} sw={2} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Page header
// ============================================================

const FILTERS = ["All sites", "Monitoring", "Regressing", "Paused"] as const;
type FilterKey = (typeof FILTERS)[number];

function PageHeader({ count, capacity, filter, setFilter, onAdd }: { count: number; capacity: number; filter: FilterKey; setFilter: (f: FilterKey) => void; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, background: "#ecfeff", border: "1px solid rgba(6,182,212,0.3)", fontSize: 10.5, fontFamily: FONT_INTER, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490" }}>
            <IcZap size={10} sw={2.4} />Pro tier
          </span>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: FONT_MONO }}>{count} / {capacity} sites</span>
        </div>
        <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: "#0b1f3a", letterSpacing: "-0.015em" }}>
          Monitored sites.
        </h2>
        <div style={{ marginTop: 4, fontSize: 13.5, color: "#64748b", maxWidth: 580, lineHeight: 1.5 }}>
          Daily WCAG 2.1 AA scans across your portfolio. We surface regressions, queue Auto-Fix PRs, and keep your VPAT current.
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "inline-flex", padding: 3, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontFamily: FONT_INTER }}>
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: 0, cursor: "pointer", background: filter === f ? "#0b1f3a" : "transparent", color: filter === f ? "#fff" : "#475569" }}>{f}</button>
          ))}
        </div>
        <button type="button" onClick={onAdd} style={{ height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#0b1f3a", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <IcPlus size={13} sw={2.4} />Add site
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Portfolio summary strip
// ============================================================

type Site = {
  id: number;
  url: string;
  faviconColor: string;
  status: "monitoring" | "paused" | "scanning" | "failing";
  score: number;
  critical: number;
  lastScan: string;
  trend: number[];
};

function PortfolioSummary({ sites }: { sites: Site[] }) {
  const monitoring = sites.filter((s) => s.status === "monitoring").length;
  const regressing = sites.filter((s) => s.status === "failing").length;
  const totalCritical = sites.reduce((a, s) => a + s.critical, 0);
  const avgScore = Math.round(sites.reduce((a, s) => a + s.score, 0) / Math.max(sites.length, 1));

  type Item = { label: string; value: number; suffix: string; color: string };
  const items: Item[] = [
    { label: "Active", value: monitoring, suffix: `of ${sites.length}`, color: "#0b1f3a" },
    { label: "Avg compliance", value: avgScore, suffix: "/ 100", color: scoreColor(avgScore) },
    { label: "Open critical", value: totalCritical, suffix: "violations", color: totalCritical > 0 ? "#dc2626" : "#16a34a" },
    { label: "Regressing", value: regressing, suffix: "needs review", color: regressing > 0 ? "#dc2626" : "#475569" },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18, overflow: "hidden" }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ padding: "16px 20px", borderRight: i < items.length - 1 ? "1px solid #f1f5f9" : 0 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600 }}>{it.label}</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: it.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{it.value}</span>
            <span style={{ fontSize: 11.5, color: "#94a3b8", fontFamily: FONT_INTER }}>{it.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Site favicon + sparkline + status pill
// ============================================================

function SiteFavicon({ url, color = "#0b1f3a" }: { url: string; color?: string }) {
  const letter = url.replace(/^www\./, "").charAt(0).toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, background: color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", flexShrink: 0 }}>{letter}</div>
  );
}

function Sparkline({ data, color = "#06b6d4", height = 44 }: { data: number[]; color?: string; height?: number }) {
  const w = 200;
  const h = height;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 8);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  const polyline = pts.map((p) => p.join(",")).join(" ");
  const area = `${pts[0][0]},${h} ${polyline} ${pts[pts.length - 1][0]},${h}`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }} preserveAspectRatio="none">
      <polygon points={area} fill={color} fillOpacity="0.12" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

function StatusPill({ status }: { status: Site["status"] }) {
  const map: Record<Site["status"], { dot: string; label: string; bg: string; color: string }> = {
    monitoring: { dot: "#16a34a", label: "Monitoring", bg: "rgba(22,163,74,0.1)", color: "#15803d" },
    paused: { dot: "#94a3b8", label: "Paused", bg: "#f1f5f9", color: "#475569" },
    scanning: { dot: "#a855f7", label: "Scanning", bg: "rgba(168,85,247,0.12)", color: "#7e22ce" },
    failing: { dot: "#dc2626", label: "Regressing", bg: "rgba(220,38,38,0.1)", color: "#b91c1c" },
  };
  const m = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 4, background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: FONT_INTER }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, ...(status === "scanning" ? { animation: "msPulse 1.4s ease-in-out infinite" } : {}) }} />
      {m.label}
    </span>
  );
}

// ============================================================
// Site Card + Menu
// ============================================================

function MenuItem({ icon, label, danger, onClick }: { icon: ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: "100%", padding: "8px 10px", display: "flex", alignItems: "center", gap: 9, border: 0, background: "transparent", cursor: "pointer", borderRadius: 4, color: danger ? "#dc2626" : "#334155", fontFamily: FONT_INTER, fontSize: 13, fontWeight: 500, textAlign: "left" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "rgba(220,38,38,0.06)" : "#f8fafc"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {icon}{label}
    </button>
  );
}

function SiteCard({ site, isMenuOpen, onMenu, onAction }: { site: Site; isMenuOpen: boolean; onMenu: (id: number) => void; onAction: (action: string, s: Site) => void }) {
  const trend = site.trend;
  const lastVal = trend[trend.length - 1];
  const firstVal = trend[0];
  const delta = lastVal - firstVal;
  const trendUp = delta >= 0;
  const isPaused = site.status === "paused";

  return (
    <article
      style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", transition: "border-color .15s, box-shadow .15s", opacity: isPaused ? 0.78 : 1 }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Header: favicon + url + menu */}
      <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <SiteFavicon url={site.url} color={site.faviconColor} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: 14, color: "#0b1f3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {site.url}
              </span>
              <IcExt size={11} sw={2} style={{ color: "#94a3b8", flexShrink: 0 }} />
            </div>
            <div style={{ marginTop: 4 }}>
              <StatusPill status={site.status} />
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMenu(site.id); }}
            aria-label="Site actions"
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid transparent", background: isMenuOpen ? "#f1f5f9" : "transparent", color: "#475569", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            <IcMore size={15} sw={2} />
          </button>
          {isMenuOpen && (
            <div
              style={{ position: "absolute", top: 36, right: 0, zIndex: 20, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, boxShadow: "0 4px 12px rgba(15,23,42,0.08)", minWidth: 180, padding: 4, fontFamily: FONT_INTER }}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem icon={isPaused ? <IcPlay size={14} sw={1.8} /> : <IcPause size={14} sw={1.8} />} label={isPaused ? "Resume monitoring" : "Pause monitoring"} onClick={() => onAction("toggle", site)} />
              <MenuItem icon={<IcClock size={14} sw={1.8} />} label="Edit schedule" onClick={() => onAction("schedule", site)} />
              <MenuItem icon={<IcBell size={14} sw={1.8} />} label="Alert preferences" onClick={() => onAction("alerts", site)} />
              <MenuItem icon={<IcEdit size={14} sw={1.8} />} label="Edit site" onClick={() => onAction("edit", site)} />
              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
              <MenuItem icon={<IcTrash size={14} sw={1.8} />} label="Remove site" danger onClick={() => onAction("remove", site)} />
            </div>
          )}
        </div>
      </div>

      {/* Score row */}
      <div style={{ padding: "0 18px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: 1, letterSpacing: "-0.025em", color: scoreColor(site.score), display: "inline-flex", alignItems: "baseline", gap: 4 }}>
            {site.score}
            <span style={{ fontFamily: FONT_INTER, fontSize: 13, fontWeight: 500, color: "#94a3b8", letterSpacing: 0 }}>/100</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>
            {scoreGrade(site.score)}
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 4, background: trendUp ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)", color: trendUp ? "#15803d" : "#b91c1c", fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600 }}>
          {trendUp ? <IcTrendUp size={10} sw={2.4} /> : <IcTrendDown size={10} sw={2.4} />}
          {trendUp ? "+" : ""}{delta} pts
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ padding: "0 14px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: FONT_MONO, color: "#94a3b8", padding: "0 4px 4px" }}>
          <span>30d</span><span>now</span>
        </div>
        <div style={{ position: "relative", height: 44 }}>
          <Sparkline data={trend} color={scoreColor(site.score)} />
        </div>
      </div>

      {/* Issues + last scan strip */}
      <div style={{ margin: "0 18px", padding: "12px 0", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Critical</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {site.critical > 0 ? (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", background: "rgba(220,38,38,0.1)", color: "#dc2626", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, borderRadius: 4 }}>
                  <IcAlert size={10} sw={2.4} />{site.critical}
                </span>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>open</span>
              </>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", background: "rgba(22,163,74,0.1)", color: "#15803d", fontFamily: FONT_INTER, fontWeight: 600, fontSize: 11.5, borderRadius: 4 }}>
                <IcCheck size={10} sw={3} />None
              </span>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Last scan</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569", fontFamily: FONT_INTER }}>
            <IcClock size={11} sw={2} />{site.lastScan}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ marginTop: "auto", padding: "12px 14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 6, alignItems: "center", background: "#fafbfc" }}>
        <button type="button" style={{ flex: 1, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#0b1f3a", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          View details<IcArrow size={11} sw={2.4} />
        </button>
        <button type="button" aria-label="Site settings" style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <IcSettings size={14} sw={1.8} />
        </button>
      </div>
    </article>
  );
}

// ============================================================
// Empty state
// ============================================================

function EmptyState({ onAddSite }: { onAddSite: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 10, padding: "56px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: "#ecfeff", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#0e7490" }}>
        <IcGlobe size={26} sw={1.8} />
      </div>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: "#0b1f3a", letterSpacing: "-0.01em" }}>
          No sites under monitoring yet.
        </div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "#64748b", maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          Add a site and we&apos;ll re-scan it daily, surface regressions before users hit them, and alert your team in Slack.
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button type="button" onClick={onAddSite} style={{ height: 40, padding: "0 16px", fontSize: 13.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#0b1f3a", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <IcPlus size={14} sw={2.4} />Add your first site
        </button>
        <button type="button" style={{ height: 40, padding: "0 16px", fontSize: 13.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#fff", color: "#0b1f3a", border: "1px solid #cbd5e1" }}>
          Import from sitemap.xml
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Add Site Modal
// ============================================================

function AddSiteModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,31,58,0.55)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "relative", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, width: 520, maxWidth: "calc(100% - 32px)", padding: 0, overflow: "hidden", boxShadow: "0 12px 32px rgba(15,23,42,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", fontWeight: 600 }}>Pro · continuous monitoring</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: "#0b1f3a", letterSpacing: "-0.01em", marginTop: 4 }}>Add a site to monitor.</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 6, border: 0, background: "transparent", color: "#94a3b8", cursor: "pointer" }}>
            <IcX size={16} sw={2} />
          </button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER, marginBottom: 6, display: "block" }}>Target URL</label>
            <input defaultValue="https://" placeholder="https://agency.gov" style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontFamily: FONT_INTER, color: "#0b1f3a", outline: "none" }} />
            <div style={{ marginTop: 6, fontSize: 11.5, color: "#94a3b8" }}>We&apos;ll crawl up to 5,000 pages on the Pro plan.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER, marginBottom: 6, display: "block" }}>Cadence</label>
              <select defaultValue="Daily (recommended)" style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontFamily: FONT_INTER, color: "#0b1f3a", background: "#fff" }}>
                <option>Daily (recommended)</option><option>Weekly</option><option>Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER, marginBottom: 6, display: "block" }}>Standard</label>
              <select defaultValue="WCAG 2.1 AA" style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontFamily: FONT_INTER, color: "#0b1f3a", background: "#fff" }}>
                <option>WCAG 2.1 AA</option><option>WCAG 2.1 AAA</option><option>Section 508</option>
              </select>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer", background: "#ecfeff" }}>
            <input type="checkbox" defaultChecked style={{ accentColor: "#06b6d4", marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, color: "#0b1f3a", fontWeight: 600, fontFamily: FONT_INTER }}>Alert on regression ≥ 5 points</div>
              <div style={{ fontSize: 12, color: "#64748b", fontFamily: FONT_INTER }}>Email + Slack · sent within 5 minutes of scan completion.</div>
            </div>
          </label>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ height: 38, padding: "0 14px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#fff", color: "#0b1f3a", border: "1px solid #cbd5e1" }}>Cancel</button>
          <button type="button" onClick={onSubmit} style={{ height: 38, padding: "0 16px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: "pointer", background: "#0b1f3a", color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            Start monitoring<IcArrow size={11} sw={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mock data
// ============================================================

const ALL_SITES: Site[] = [
  { id: 1, url: "agency.gov", faviconColor: "#0b1f3a", status: "monitoring", score: 87, critical: 3, lastScan: "2 hrs ago", trend: [78, 79, 77, 80, 82, 81, 83, 85, 84, 86, 84, 85, 86, 84, 86, 87, 86, 88, 87, 86, 87, 86, 88, 87, 86, 88, 87, 86, 87, 87] },
  { id: 2, url: "forms.agency.gov", faviconColor: "#dc2626", status: "failing", score: 71, critical: 8, lastScan: "1 hr ago", trend: [82, 82, 81, 80, 79, 80, 78, 79, 78, 77, 76, 75, 74, 75, 74, 73, 72, 71, 72, 71, 70, 71, 72, 71, 70, 72, 71, 70, 71, 71] },
  { id: 3, url: "news.agency.gov", faviconColor: "#06b6d4", status: "monitoring", score: 94, critical: 0, lastScan: "4 hrs ago", trend: [88, 89, 89, 90, 89, 91, 90, 91, 92, 91, 92, 93, 92, 93, 93, 94, 93, 93, 94, 93, 94, 93, 94, 94, 93, 94, 94, 93, 94, 94] },
  { id: 4, url: "internal.agency.gov", faviconColor: "#0b1f3a", status: "scanning", score: 82, critical: 2, lastScan: "Running…", trend: [76, 77, 76, 78, 79, 78, 80, 79, 80, 81, 80, 81, 82, 81, 82, 81, 82, 83, 82, 83, 82, 82, 83, 82, 82, 83, 82, 82, 82, 82] },
  { id: 5, url: "data.agency.gov", faviconColor: "#06b6d4", status: "monitoring", score: 96, critical: 0, lastScan: "Yesterday", trend: [92, 93, 93, 94, 93, 94, 94, 95, 94, 95, 95, 96, 95, 96, 96, 95, 96, 96, 95, 96, 96, 96, 96, 95, 96, 96, 96, 96, 96, 96] },
  { id: 6, url: "staging.agency.gov", faviconColor: "#94a3b8", status: "paused", score: 79, critical: 5, lastScan: "Mar 18, 2026", trend: [82, 81, 82, 80, 81, 80, 79, 80, 79, 80, 79, 80, 79, 80, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79] },
  { id: 7, url: "careers.agency.gov", faviconColor: "#0b1f3a", status: "monitoring", score: 89, critical: 1, lastScan: "6 hrs ago", trend: [84, 85, 84, 86, 85, 86, 87, 86, 87, 88, 87, 88, 87, 88, 89, 88, 89, 88, 89, 89, 89, 88, 89, 89, 89, 89, 89, 89, 89, 89] },
  { id: 8, url: "press.agency.gov", faviconColor: "#dc2626", status: "failing", score: 68, critical: 12, lastScan: "30 min ago", trend: [82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 72, 71, 70, 71, 70, 69, 68, 69, 68, 68, 69, 68, 68, 67, 68, 68, 67, 68, 68] },
  { id: 9, url: "support.agency.gov", faviconColor: "#06b6d4", status: "monitoring", score: 91, critical: 0, lastScan: "8 hrs ago", trend: [86, 86, 87, 86, 87, 88, 87, 88, 89, 88, 89, 89, 89, 90, 89, 90, 90, 91, 90, 91, 91, 90, 91, 91, 91, 91, 91, 91, 91, 91] },
];

// ============================================================
// Page composition
// ============================================================

export default function MonitoredSitesV2PreviewPage() {
  // Preview defaults — Pro tier, populated state
  const showEmpty = false;
  const isFreeTier = false;

  const [filter, setFilter] = useState<FilterKey>("All sites");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpsell, setShowUpsell] = useState<boolean>(isFreeTier);

  // close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const onDoc = () => setOpenMenu(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openMenu]);

  const filterMap: Record<FilterKey, Site["status"] | null> = {
    "All sites": null,
    "Monitoring": "monitoring",
    "Regressing": "failing",
    "Paused": "paused",
  };
  const filtered = filterMap[filter] ? ALL_SITES.filter((s) => s.status === filterMap[filter]) : ALL_SITES;
  const sites: Site[] = showEmpty ? [] : filtered;

  return (
    <>
      <style>{`
        @keyframes msPulse { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: .5; transform: scale(1.4) } }
        body { background: #f8fafc; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Monitored sites" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar
            title="Monitored sites"
            breadcrumb="Workspace · Acme Agency"
          />
          <main style={{ flex: 1, padding: "28px 32px", background: "#f8fafc", overflow: "auto", fontFamily: FONT_INTER }}>
            {showUpsell && <ProUpsellBanner onDismiss={() => setShowUpsell(false)} />}

            <PageHeader
              count={showEmpty ? 0 : ALL_SITES.length}
              capacity={25}
              filter={filter}
              setFilter={setFilter}
              onAdd={() => setShowAdd(true)}
            />

            {!showEmpty && <PortfolioSummary sites={ALL_SITES} />}

            {sites.length === 0 ? (
              <EmptyState onAddSite={() => setShowAdd(true)} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {sites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    isMenuOpen={openMenu === site.id}
                    onMenu={(id) => setOpenMenu(openMenu === id ? null : id)}
                    onAction={() => setOpenMenu(null)}
                  />
                ))}
              </div>
            )}

            {showAdd && <AddSiteModal onClose={() => setShowAdd(false)} onSubmit={() => setShowAdd(false)} />}
          </main>
        </div>
      </div>
    </>
  );
}

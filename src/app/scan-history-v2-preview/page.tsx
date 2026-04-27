"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

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
function IcCalendar({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IcChevron({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="6 9 12 15 18 9" /></svg>;
}
function IcChevLeft({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="15 18 9 12 15 6" /></svg>;
}
function IcChevRight({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 18 15 12 9 6" /></svg>;
}
function IcRefresh({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
}
function IcEye({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function IcMore({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
}
function IcDownload({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function IcTrash({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>;
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

function Sidebar({ active = "Scan history" }: { active?: string }) {
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
// History Stats (KPI cards)
// ============================================================

function HistoryStats() {
  type Card = { title: string; value: string; sub: string; icon: ReactNode; danger?: boolean; delta?: { positive: boolean; text: string } };
  const stats: Card[] = [
    { title: "Total scans", value: "1,847", sub: "Last 30 days", icon: <IcScan size={13} sw={2} />, delta: { positive: true, text: "+128 vs prior 30d" } },
    { title: "Avg compliance score", value: "84", sub: "Across 12 sites", icon: <IcShield size={13} sw={2} />, delta: { positive: true, text: "+3 vs prior 30d" } },
    { title: "Critical issues found", value: "412", sub: "Across all scans", icon: <IcAlert size={13} sw={2} />, danger: true, delta: { positive: true, text: "−47 vs prior 30d" } },
    { title: "Sites covered", value: "12", sub: "8 monitored continuously", icon: <IcGlobe size={13} sw={2} />, delta: { positive: true, text: "+2 this month" } },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {stats.map((s) => (
        <div key={s.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>{s.title}</span>
            <span style={{ width: 26, height: 26, borderRadius: 5, background: s.danger ? "rgba(220,38,38,0.08)" : "#f1f5f9", color: s.danger ? "#dc2626" : "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</span>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: 1, color: s.danger ? "#dc2626" : "#0b1f3a", letterSpacing: "-0.02em" }}>{s.value}</div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>{s.sub}</span>
            {s.delta && (
              <span style={{ fontSize: 11, color: s.delta.positive ? "#16a34a" : "#dc2626", fontWeight: 600, fontFamily: FONT_INTER }}>{s.delta.text}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Filter Bar
// ============================================================

type Filters = { search: string; range: string; status: string; severity: string };

type DropOption = { value: string; label: string; dot?: string };

function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const opts: { v: string; l: string }[] = [
    { v: "7", l: "Last 7 days" },
    { v: "30", l: "Last 30 days" },
    { v: "90", l: "Last 90 days" },
    { v: "custom", l: "Custom range…" },
  ];
  const current = opts.find((o) => o.v === value) || opts[1];
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ height: 38, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", color: "#0b1f3a", fontSize: 13, fontFamily: FONT_INTER, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 170 }}>
        <IcCalendar size={13} sw={1.8} style={{ color: "#64748b" }} />
        <span style={{ flex: 1, textAlign: "left" }}>{current.l}</span>
        <IcChevron size={12} sw={2} style={{ color: "#64748b" }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
          <div style={{ position: "absolute", top: 42, left: 0, minWidth: 200, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(11,31,58,0.08)", padding: 4, zIndex: 6 }}>
            {opts.map((o) => (
              <button key={o.v} type="button" onClick={() => { onChange(o.v); setOpen(false); }} style={{ display: "flex", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 4, border: 0, background: o.v === value ? "#f1f5f9" : "transparent", color: "#0b1f3a", fontSize: 13, fontFamily: FONT_INTER, fontWeight: o.v === value ? 600 : 500, cursor: "pointer", alignItems: "center", gap: 8 }}>
                {o.l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: DropOption[] }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ height: 38, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", color: "#0b1f3a", fontSize: 13, fontFamily: FONT_INTER, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 150 }}>
        <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        {current.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: current.dot }} />}
        <span style={{ flex: 1, textAlign: "left" }}>{current.label}</span>
        <IcChevron size={12} sw={2} style={{ color: "#64748b" }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
          <div style={{ position: "absolute", top: 42, left: 0, minWidth: 180, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(11,31,58,0.08)", padding: 4, zIndex: 6 }}>
            {options.map((o) => (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }} style={{ display: "flex", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 4, border: 0, background: o.value === value ? "#f1f5f9" : "transparent", color: "#0b1f3a", fontSize: 13, fontFamily: FONT_INTER, fontWeight: o.value === value ? 600 : 500, cursor: "pointer", alignItems: "center", gap: 8 }}>
                {o.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: o.dot }} />}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const hasFilters = Boolean(filters.search) || filters.range !== "30" || filters.status !== "all" || filters.severity !== "all";
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240 }}>
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}><IcScan size={14} sw={2} /></span>
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Filter by site URL or path…"
          style={{ height: 38, width: "100%", padding: "0 12px 0 34px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: FONT_INTER, color: "#0b1f3a", outline: "none", background: "#fff" }}
        />
      </div>
      <DateRangePicker value={filters.range} onChange={(r) => setFilters({ ...filters, range: r })} />
      <FilterDropdown
        label="Status"
        value={filters.status}
        onChange={(v) => setFilters({ ...filters, status: v })}
        options={[
          { value: "all", label: "All statuses" },
          { value: "completed", label: "Completed", dot: "#16a34a" },
          { value: "failed", label: "Failed", dot: "#dc2626" },
          { value: "scanning", label: "Scanning", dot: "#a855f7" },
        ]}
      />
      <FilterDropdown
        label="Severity"
        value={filters.severity}
        onChange={(v) => setFilters({ ...filters, severity: v })}
        options={[
          { value: "all", label: "All severities" },
          { value: "critical", label: "Critical", dot: "#dc2626" },
          { value: "serious", label: "Serious", dot: "#f59e0b" },
          { value: "moderate", label: "Moderate", dot: "#06b6d4" },
          { value: "minor", label: "Minor", dot: "#94a3b8" },
        ]}
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => setFilters({ search: "", range: "30", status: "all", severity: "all" })}
          style={{ height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12.5, fontWeight: 500, fontFamily: FONT_INTER, cursor: "pointer" }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ============================================================
// Sparkline + Status Badge
// ============================================================

function Sparkline({ data, color = "#06b6d4" }: { data: number[] | null; color?: string }) {
  const w = 72, h = 22, pad = 2;
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(",");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

type ScanStatus = "completed" | "failed" | "scanning";

function StatusBadge({ status }: { status: ScanStatus }) {
  const map: Record<ScanStatus, { bg: string; color: string; dot: string; label: string; pulse?: boolean }> = {
    completed: { bg: "rgba(22,163,74,0.10)", color: "#15803d", dot: "#16a34a", label: "Completed" },
    failed: { bg: "rgba(220,38,38,0.10)", color: "#b91c1c", dot: "#dc2626", label: "Failed" },
    scanning: { bg: "rgba(168,85,247,0.10)", color: "#7e22ce", dot: "#a855f7", label: "Scanning", pulse: true },
  };
  const m = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, fontFamily: FONT_INTER }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, ...(m.pulse ? { animation: "scanHistPulseDot 1.4s ease-out infinite" } : {}) }} />
      {m.label}
    </span>
  );
}

// ============================================================
// Sample data + Table
// ============================================================

type Severity = "critical" | "serious" | "moderate" | "minor";

type Scan = {
  id: number;
  url: string;
  path: string;
  date: string;
  dateFull: string;
  pages: number | null;
  score: number | null;
  scoreTrend: number[] | null;
  critical: number | null;
  status: ScanStatus;
  pr: string | null;
  severityMix: Severity[];
};

const SCANS: Scan[] = [
  { id: 1847, url: "agency.gov", path: "/", date: "2 hrs ago", dateFull: "Apr 26, 2026 · 14:22 UTC", pages: 124, score: 87, scoreTrend: [82, 84, 83, 85, 86, 87, 87], critical: 3, status: "completed", pr: "#142", severityMix: ["critical", "serious", "moderate"] },
  { id: 1846, url: "agency.gov", path: "/forms/I-90", date: "2 hrs ago", dateFull: "Apr 26, 2026 · 14:18 UTC", pages: 18, score: 71, scoreTrend: [68, 70, 71, 70, 72, 71, 71], critical: 8, status: "completed", pr: null, severityMix: ["critical", "serious"] },
  { id: 1845, url: "agency.gov", path: "/news", date: "Yesterday", dateFull: "Apr 25, 2026 · 09:11 UTC", pages: 47, score: 94, scoreTrend: [88, 90, 91, 92, 93, 93, 94], critical: 0, status: "completed", pr: null, severityMix: ["minor"] },
  { id: 1844, url: "internal.agency.gov", path: "/", date: "Yesterday", dateFull: "Apr 25, 2026 · 08:02 UTC", pages: null, score: null, scoreTrend: null, critical: null, status: "scanning", pr: null, severityMix: [] },
  { id: 1843, url: "staging.agency.gov", path: "/", date: "Apr 24", dateFull: "Apr 24, 2026 · 22:50 UTC", pages: null, score: null, scoreTrend: null, critical: null, status: "failed", pr: null, severityMix: [] },
  { id: 1842, url: "agency.gov", path: "/services", date: "Apr 24", dateFull: "Apr 24, 2026 · 16:30 UTC", pages: 64, score: 89, scoreTrend: [82, 84, 86, 87, 88, 88, 89], critical: 1, status: "completed", pr: "#138", severityMix: ["critical", "moderate"] },
  { id: 1841, url: "agency.gov", path: "/about", date: "Apr 23", dateFull: "Apr 23, 2026 · 11:15 UTC", pages: 12, score: 96, scoreTrend: [91, 93, 94, 95, 95, 96, 96], critical: 0, status: "completed", pr: null, severityMix: ["minor"] },
  { id: 1840, url: "library.agency.gov", path: "/", date: "Apr 23", dateFull: "Apr 23, 2026 · 09:48 UTC", pages: 88, score: 78, scoreTrend: [70, 72, 74, 75, 76, 77, 78], critical: 5, status: "completed", pr: "#136", severityMix: ["critical", "serious", "moderate"] },
  { id: 1839, url: "agency.gov", path: "/forms", date: "Apr 22", dateFull: "Apr 22, 2026 · 17:05 UTC", pages: 32, score: 73, scoreTrend: [69, 70, 71, 72, 72, 73, 73], critical: 6, status: "completed", pr: "#134", severityMix: ["critical", "serious"] },
  { id: 1838, url: "parks.agency.gov", path: "/", date: "Apr 22", dateFull: "Apr 22, 2026 · 12:00 UTC", pages: 41, score: 91, scoreTrend: [85, 87, 88, 89, 90, 91, 91], critical: 0, status: "completed", pr: null, severityMix: ["moderate", "minor"] },
  { id: 1837, url: "agency.gov", path: "/contact", date: "Apr 21", dateFull: "Apr 21, 2026 · 14:22 UTC", pages: 4, score: 98, scoreTrend: [95, 96, 96, 97, 97, 98, 98], critical: 0, status: "completed", pr: null, severityMix: ["minor"] },
  { id: 1836, url: "transit.agency.gov", path: "/", date: "Apr 21", dateFull: "Apr 21, 2026 · 10:11 UTC", pages: 56, score: 82, scoreTrend: [76, 78, 79, 80, 81, 81, 82], critical: 2, status: "completed", pr: "#131", severityMix: ["critical", "serious", "moderate"] },
];

const ICON_BTN_STYLE: CSSProperties = {
  width: 30, height: 30, borderRadius: 6, border: "1px solid transparent", background: "transparent", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background-color .12s, border-color .12s",
};

function MenuItem({ icon, label, danger }: { icon: ReactNode; label: string; danger?: boolean }) {
  return (
    <button type="button" style={{ display: "flex", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 4, border: 0, background: "transparent", color: danger ? "#dc2626" : "#0b1f3a", fontSize: 13, fontFamily: FONT_INTER, fontWeight: 500, cursor: "pointer", alignItems: "center", gap: 10 }}>
      <span style={{ color: danger ? "#dc2626" : "#64748b", display: "inline-flex" }}>{icon}</span>{label}
    </button>
  );
}

function Pagination({ total, pageSize, page }: { total: number; pageSize: number; page: number }) {
  const totalPages = Math.ceil(total / pageSize);
  const items: (number | string)[] = [1, 2, 3, "…", totalPages - 1, totalPages];
  return (
    <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_INTER }}>
      <div style={{ fontSize: 12.5, color: "#64748b" }}>
        Showing <span style={{ color: "#0b1f3a", fontWeight: 600 }}>1–{pageSize}</span> of <span style={{ color: "#0b1f3a", fontWeight: 600 }}>{total.toLocaleString()}</span> scans
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" disabled={page === 1} style={{ ...ICON_BTN_STYLE, border: "1px solid #e2e8f0", opacity: page === 1 ? 0.4 : 1 }}>
          <IcChevLeft size={13} sw={2} />
        </button>
        {items.map((p, i) => (
          <button key={`${p}-${i}`} type="button" style={{
            height: 30, minWidth: 30, padding: "0 8px", borderRadius: 6,
            border: p === page ? "1px solid #0b1f3a" : "1px solid transparent",
            background: p === page ? "#0b1f3a" : "transparent",
            color: p === page ? "#fff" : "#475569",
            fontSize: 12.5, fontWeight: p === page ? 600 : 500, fontFamily: FONT_INTER, cursor: p === "…" ? "default" : "pointer",
          }}>{p}</button>
        ))}
        <button type="button" style={{ ...ICON_BTN_STYLE, border: "1px solid #e2e8f0" }}>
          <IcChevRight size={13} sw={2} />
        </button>
      </div>
    </div>
  );
}

function ScansTable({ scans }: { scans: Scan[] }) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const sevColor: Record<Severity, string> = { critical: "#dc2626", serious: "#f59e0b", moderate: "#06b6d4", minor: "#94a3b8" };

  const headers: ReadonlyArray<readonly [string, "left" | "right", number]> = [
    ["Site URL", "left", 0],
    ["Date", "left", 0],
    ["Pages", "right", 80],
    ["Compliance", "left", 160],
    ["Critical", "right", 90],
    ["Status", "left", 130],
    ["", "right", 130],
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: "#0b1f3a" }}>All scans</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{scans.length} {scans.length === 1 ? "scan" : "scans"} matching filters</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={{ height: 32, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 500, fontFamily: FONT_INTER, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IcDownload size={12} sw={2} />Export CSV
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {headers.map(([h, align, w]) => (
                <th key={h} style={{ padding: "11px 16px", textAlign: align, fontSize: 10.5, letterSpacing: "0.10em", textTransform: "uppercase", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", width: w || "auto" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scans.map((r, i) => {
              const isHover = hovered === r.id;
              return (
                <tr
                  key={r.id}
                  onMouseEnter={() => setHovered(r.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ borderBottom: i === scans.length - 1 ? 0 : "1px solid #f1f5f9", background: isHover ? "#f8fafc" : "transparent", transition: "background-color .12s" }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 5, background: "#f1f5f9", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IcGlobe size={13} sw={1.8} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: "#0b1f3a", fontWeight: 600, fontFamily: FONT_INTER }}>{r.url}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b", fontFamily: FONT_MONO, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{r.path}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 13, color: "#0b1f3a", fontWeight: 500 }}>{r.date}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontFamily: FONT_MONO, marginTop: 2 }}>scan #{r.id}</div>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: FONT_MONO, fontWeight: 600, color: r.pages == null ? "#cbd5e1" : "#0b1f3a", fontSize: 13 }}>
                    {r.pages ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {r.score != null ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 14.5, color: r.score >= 90 ? "#16a34a" : r.score >= 80 ? "#0b1f3a" : "#dc2626", minWidth: 26 }}>{r.score}</span>
                        <Sparkline data={r.scoreTrend} color={r.score >= 90 ? "#16a34a" : r.score >= 80 ? "#06b6d4" : "#dc2626"} />
                      </div>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontFamily: FONT_MONO, fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    {r.critical != null ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {r.severityMix.slice(0, 3).map((sev, idx) => (
                            <span key={idx} style={{ width: 4, height: 12, borderRadius: 1, background: sevColor[sev] }} />
                          ))}
                        </div>
                        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 13, color: r.critical === 0 ? "#16a34a" : "#dc2626", minWidth: 18, textAlign: "right" }}>{r.critical}</span>
                      </div>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontFamily: FONT_MONO, fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, opacity: isHover ? 1 : 0.6, transition: "opacity .12s" }}>
                      {r.status === "completed" && (
                        <button type="button" title="View report" style={ICON_BTN_STYLE}>
                          <IcEye size={14} sw={1.8} />
                        </button>
                      )}
                      {r.status !== "scanning" && (
                        <button type="button" title="Re-run scan" style={ICON_BTN_STYLE}>
                          <IcRefresh size={14} sw={1.8} />
                        </button>
                      )}
                      {r.pr ? (
                        <button type="button" title={`Open PR ${r.pr}`} style={{ ...ICON_BTN_STYLE, color: "#0e7490" }}>
                          <IcPr size={14} sw={1.8} />
                        </button>
                      ) : r.status === "completed" && (r.critical ?? 0) > 0 ? (
                        <button type="button" title="Open Auto-Fix PR" style={{ ...ICON_BTN_STYLE, color: "#0e7490" }}>
                          <IcPr size={14} sw={1.8} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        title="More"
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === r.id ? null : r.id); }}
                        style={{ ...ICON_BTN_STYLE, position: "relative" }}
                      >
                        <IcMore size={14} sw={2} />
                        {openMenu === r.id && (
                          <>
                            <div onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
                            <div style={{ position: "absolute", top: 30, right: 0, minWidth: 180, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 6px 20px rgba(11,31,58,0.10)", padding: 4, zIndex: 6, textAlign: "left" }}>
                              <MenuItem icon={<IcEye size={13} sw={1.8} />} label="View report" />
                              <MenuItem icon={<IcRefresh size={13} sw={1.8} />} label="Re-run scan" />
                              <MenuItem icon={<IcDownload size={13} sw={1.8} />} label="Export VPAT 2.5" />
                              <MenuItem icon={<IcPr size={13} sw={1.8} />} label="Open Auto-Fix PR" />
                              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                              <MenuItem icon={<IcTrash size={13} sw={1.8} />} label="Delete scan" danger />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination total={1847} pageSize={12} page={1} />
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "72px 24px", textAlign: "center" }}>
      <div style={{ width: 96, height: 96, margin: "0 auto 24px", position: "relative" }}>
        <svg viewBox="0 0 96 96" width="96" height="96">
          <rect x="8" y="14" width="80" height="58" rx="6" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="8" y1="26" x2="88" y2="26" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="14" cy="20" r="1.2" fill="#cbd5e1" />
          <circle cx="18" cy="20" r="1.2" fill="#cbd5e1" />
          <circle cx="22" cy="20" r="1.2" fill="#cbd5e1" />
          <line x1="16" y1="36" x2="64" y2="36" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="44" x2="76" y2="44" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="52" x2="48" y2="52" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="60" x2="56" y2="60" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="68" cy="62" r="14" fill="#fff" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="78" y1="72" x2="86" y2="80" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: "#0b1f3a", letterSpacing: "-0.01em" }}>
        {hasFilters ? "No scans match these filters." : "No scans yet."}
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: "#64748b", maxWidth: 420, margin: "8px auto 0" }}>
        {hasFilters
          ? "Try widening your date range or clearing the status filter to see more results."
          : "Run your first WCAG 2.1 AA scan and AccessiScan will surface every violation, plus open a GitHub PR with safe fixes."}
      </div>
      <div style={{ marginTop: 24, display: "inline-flex", gap: 10 }}>
        {hasFilters ? (
          <button type="button" onClick={onClear} style={{ height: 40, padding: "0 18px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#0b1f3a", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer" }}>
            Clear filters
          </button>
        ) : (
          <>
            <button type="button" style={{ height: 40, padding: "0 18px", borderRadius: 6, border: 0, background: "#0b1f3a", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <IcScan size={14} sw={2} />Run your first scan
            </button>
            <button type="button" style={{ height: 40, padding: "0 18px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#0b1f3a", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer" }}>
              See sample report
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Page composition
// ============================================================

export default function ScanHistoryV2PreviewPage() {
  const [filters, setFilters] = useState<Filters>({ search: "", range: "30", status: "all", severity: "all" });

  const filtered = useMemo(() => {
    return SCANS.filter((s) => {
      if (filters.search && !`${s.url}${s.path}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status !== "all" && s.status !== filters.status) return false;
      if (filters.severity !== "all" && !s.severityMix.includes(filters.severity as Severity)) return false;
      return true;
    });
  }, [filters]);

  const hasFilters = filters.search !== "" || filters.range !== "30" || filters.status !== "all" || filters.severity !== "all";
  const showEmpty = filtered.length === 0;

  return (
    <>
      <style>{`
        @keyframes scanHistPulseDot {
          0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5); }
          70% { box-shadow: 0 0 0 6px rgba(168,85,247,0); }
          100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); }
        }
        body { background: #f8fafc; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Scan history" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar
            title="Scans"
            breadcrumb="Workspace · Acme Agency · Scan history"
            action={<Btn variant="primary" size="md">+ New scan</Btn>}
          />
          <main style={{ flex: 1, padding: "24px 28px", background: "#f8fafc", overflow: "auto" }}>
            <HistoryStats />
            <div style={{ marginTop: 16 }}>
              <FilterBar filters={filters} setFilters={setFilters} />
            </div>
            <div style={{ marginTop: 16 }}>
              {showEmpty
                ? <EmptyState hasFilters={hasFilters} onClear={() => setFilters({ search: "", range: "30", status: "all", severity: "all" })} />
                : <ScansTable scans={filtered} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

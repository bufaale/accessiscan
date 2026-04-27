"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

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
function IcBell({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}
function IcGithub({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
}
function IcArrow({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function IcCheck({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="20 6 9 17 4 12" /></svg>;
}
function IcLock({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}
function IcRefresh({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
}
function IcInfo({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
}
function IcChev({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="6 9 12 15 18 9" /></svg>;
}

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Buttons
// ============================================================

type BtnVariant = "primary" | "urgent" | "outline" | "cyan" | "ghost";
type BtnSize = "sm" | "md" | "lg";

function Btn({
  children,
  variant = "primary",
  size = "md",
  leadIcon,
  trailIcon,
  type = "button",
  style,
  onClick,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  leadIcon?: ReactNode;
  trailIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const sizes: Record<BtnSize, { h: number; px: number; fs: number }> = {
    lg: { h: 44, px: 18, fs: 14 },
    md: { h: 36, px: 14, fs: 13.5 },
    sm: { h: 30, px: 10, fs: 12.5 },
  };
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
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: s.h,
        padding: `0 ${s.px}px`,
        fontSize: s.fs,
        fontWeight: 600,
        fontFamily: FONT_INTER,
        borderRadius: 6,
        cursor: "pointer",
        background: v.bg,
        color: v.color,
        border: v.border,
        transition: "background-color .15s,border-color .15s",
        ...style,
      }}
    >
      {leadIcon}
      {children}
      {trailIcon}
    </button>
  );
}

// ============================================================
// Sidebar
// ============================================================

type SidebarItem = { label: string; icon: ReactNode };

function Sidebar({ active = "New scan" }: { active?: string }) {
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
// URL Scan Field
// ============================================================

function UrlScanField({ url, onUrlChange }: { url: string; onUrlChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const trimmed = url.trim();
  const valid = /^https?:\/\/.+\..+/.test(trimmed) || trimmed === "" || /^.+\..+/.test(trimmed);
  const showValid = trimmed.length > 0 && valid;

  const ring = focused ? "0 0 0 4px rgba(6,182,212,0.18)" : "0 1px 2px rgba(15, 23, 42, 0.04)";
  const borderColor = focused ? "#06b6d4" : "#cbd5e1";

  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", marginBottom: 12, fontFamily: FONT_INTER }}>
        URL · Required
      </label>

      <div style={{ display: "flex", alignItems: "stretch", background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: 8, boxShadow: ring, transition: "border-color .15s, box-shadow .15s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px 0 18px", borderRight: "1px solid #f1f5f9", color: "#64748b", flexShrink: 0 }}>
          <IcLock size={15} sw={2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: "#64748b", fontWeight: 500 }}>https://</span>
        </div>
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value.replace(/^https?:\/\//, ""))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="agency.gov  ·  your-firm.com  ·  app.example.org/dashboard"
          style={{ flex: 1, minWidth: 0, height: 68, padding: "0 16px", border: 0, outline: "none", fontSize: 20, fontFamily: FONT_INTER, fontWeight: 500, color: "#0b1f3a", background: "transparent", letterSpacing: "-0.005em" }}
        />
        {showValid && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 4px 0 12px", color: "#0e7490", fontWeight: 600, fontSize: 12, fontFamily: FONT_INTER, gap: 6 }}>
            <IcCheck size={14} sw={2.5} /> Valid
          </div>
        )}
        <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 9, height: "auto", margin: 8, padding: "0 22px", fontSize: 14.5, fontWeight: 600, fontFamily: FONT_INTER, background: "#0b1f3a", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer", flexShrink: 0, transition: "background-color .15s" }}>
          <IcScan size={15} sw={2.2} />
          Start scan
          <IcArrow size={13} sw={2.5} />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 12, color: "#64748b", fontFamily: FONT_INTER }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <IcInfo size={12} sw={2} style={{ color: "#64748b" }} />
          We respect <span style={{ fontFamily: FONT_MONO, color: "#0b1f3a" }}>robots.txt</span> and authenticated routes by default.
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14, color: "#64748b" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
            axe-core 4.10
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
            AI vision
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
            ~90s avg
          </span>
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Segmented control
// ============================================================

type SegOption<T extends string> = { value: T; label: string; hint: string };

function Segmented<T extends string>({ options, value, onChange }: { options: ReadonlyArray<SegOption<T>>; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 3, gap: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
              padding: "10px 12px",
              borderRadius: 4,
              background: active ? "#fff" : "transparent",
              border: 0,
              boxShadow: active ? "0 1px 2px rgba(15,23,42,.06), 0 0 0 1px #cbd5e1" : "none",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: FONT_INTER,
              transition: "background .15s",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#0b1f3a" : "#475569" }}>{o.label}</span>
            <span style={{ fontSize: 11.5, color: active ? "#64748b" : "#94a3b8" }}>{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Toggle
// ============================================================

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        padding: 2,
        border: 0,
        borderRadius: 9999,
        background: disabled ? "#e2e8f0" : checked ? "#06b6d4" : "#cbd5e1",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        position: "relative",
        transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transform: `translateX(${checked ? 16 : 0}px)`,
          transition: "transform .15s",
          boxShadow: "0 1px 2px rgba(15,23,42,.18)",
        }}
      />
    </button>
  );
}

// ============================================================
// Row helper
// ============================================================

function Row({ label, hint, right, children }: { label: string; hint?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: right ? "1fr auto" : "1fr", alignItems: "flex-start", gap: 16 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER, marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: "#64748b", fontFamily: FONT_INTER, marginBottom: children ? 10 : 0 }}>{hint}</div>}
        {children}
      </div>
      {right}
    </div>
  );
}

// ============================================================
// Quick options
// ============================================================

type Depth = "single" | "top10" | "full";
type Level = "A" | "AA" | "AAA";

const DEPTH_OPTIONS: ReadonlyArray<SegOption<Depth>> = [
  { value: "single", label: "Single page", hint: "~30s" },
  { value: "top10", label: "Top 10 pages", hint: "~90s · recommended" },
  { value: "full", label: "Full crawl", hint: "Up to 5,000 pages" },
];

const LEVEL_OPTIONS: ReadonlyArray<SegOption<Level>> = [
  { value: "A", label: "A", hint: "Minimum" },
  { value: "AA", label: "AA", hint: "DOJ Title II · default" },
  { value: "AAA", label: "AAA", hint: "Aspirational" },
];

function QuickOptions({
  depth,
  onDepthChange,
  level,
  onLevelChange,
  autoFix,
  onAutoFixChange,
  githubConnected,
}: {
  depth: Depth;
  onDepthChange: (d: Depth) => void;
  level: Level;
  onLevelChange: (l: Level) => void;
  autoFix: boolean;
  onAutoFixChange: (v: boolean) => void;
  githubConnected: boolean;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 22 }}>
      <div style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>
        Scan options
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Depth */}
        <Row label="Scan depth" hint="How much of the site we crawl.">
          <Segmented<Depth> value={depth} onChange={onDepthChange} options={DEPTH_OPTIONS} />
        </Row>

        {/* WCAG level */}
        <Row label="WCAG level" hint={<>VPAT 2.5 maps A &amp; AA. AAA is rarely required.</>}>
          <Segmented<Level> value={level} onChange={onLevelChange} options={LEVEL_OPTIONS} />
        </Row>

        {/* Auto-fix toggle */}
        <Row
          label="Generate Auto-Fix PR"
          hint={
            githubConnected
              ? <>Opens a PR against <span style={{ fontFamily: FONT_MONO, color: "#0b1f3a", fontWeight: 600 }}>agency-org/website</span> with patches for safe rules.</>
              : <>Connect the AccessiScan GitHub App to enable.</>
          }
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {githubConnected ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", background: "#ecfeff", border: "1px solid rgba(6,182,212,0.35)", borderRadius: 4, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0b1f3a", fontFamily: FONT_INTER }}>
                  <IcGithub size={11} sw={2} />
                  Connected
                </span>
              ) : (
                <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", color: "#0b1f3a", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer" }}>
                  <IcGithub size={12} sw={2} />
                  Connect GitHub
                </button>
              )}
              <Toggle checked={autoFix && githubConnected} onChange={onAutoFixChange} disabled={!githubConnected} />
            </div>
          }
        />
      </div>
    </div>
  );
}

// ============================================================
// What we check (collapsible POUR groups)
// ============================================================

type PourCriterion = readonly [string, string];
type PourGroup = {
  key: string;
  letter: string;
  title: string;
  blurb: string;
  color: "cyan" | "navy";
  criteria: ReadonlyArray<PourCriterion>;
};

const POUR_GROUPS: ReadonlyArray<PourGroup> = [
  {
    key: "perceivable",
    letter: "P",
    title: "Perceivable",
    blurb: "Information must be presentable to users in ways they can perceive.",
    color: "cyan",
    criteria: [
      ["1.1.1", "Non-text content"],
      ["1.2.1", "Audio-only & video-only (prerecorded)"],
      ["1.2.2", "Captions (prerecorded)"],
      ["1.2.3", "Audio description or media alternative"],
      ["1.2.4", "Captions (live)"],
      ["1.2.5", "Audio description (prerecorded)"],
      ["1.3.1", "Info and relationships"],
      ["1.3.2", "Meaningful sequence"],
      ["1.3.3", "Sensory characteristics"],
      ["1.3.4", "Orientation"],
      ["1.3.5", "Identify input purpose"],
      ["1.4.1", "Use of color"],
      ["1.4.2", "Audio control"],
      ["1.4.3", "Contrast (minimum)"],
      ["1.4.4", "Resize text"],
      ["1.4.5", "Images of text"],
      ["1.4.10", "Reflow"],
      ["1.4.11", "Non-text contrast"],
      ["1.4.12", "Text spacing"],
      ["1.4.13", "Content on hover or focus"],
    ],
  },
  {
    key: "operable",
    letter: "O",
    title: "Operable",
    blurb: "User interface and navigation must be operable.",
    color: "navy",
    criteria: [
      ["2.1.1", "Keyboard"],
      ["2.1.2", "No keyboard trap"],
      ["2.1.4", "Character key shortcuts"],
      ["2.2.1", "Timing adjustable"],
      ["2.2.2", "Pause, stop, hide"],
      ["2.3.1", "Three flashes or below threshold"],
      ["2.4.1", "Bypass blocks"],
      ["2.4.2", "Page titled"],
      ["2.4.3", "Focus order"],
      ["2.4.4", "Link purpose (in context)"],
      ["2.4.5", "Multiple ways"],
      ["2.4.6", "Headings and labels"],
      ["2.4.7", "Focus visible"],
      ["2.5.1", "Pointer gestures"],
      ["2.5.2", "Pointer cancellation"],
      ["2.5.3", "Label in name"],
      ["2.5.4", "Motion actuation"],
    ],
  },
  {
    key: "understandable",
    letter: "U",
    title: "Understandable",
    blurb: "Information and operation of the UI must be understandable.",
    color: "navy",
    criteria: [
      ["3.1.1", "Language of page"],
      ["3.1.2", "Language of parts"],
      ["3.2.1", "On focus"],
      ["3.2.2", "On input"],
      ["3.2.3", "Consistent navigation"],
      ["3.2.4", "Consistent identification"],
      ["3.3.1", "Error identification"],
      ["3.3.2", "Labels or instructions"],
      ["3.3.3", "Error suggestion"],
      ["3.3.4", "Error prevention (legal, financial, data)"],
    ],
  },
  {
    key: "robust",
    letter: "R",
    title: "Robust",
    blurb: "Content must be robust enough to work with assistive tech.",
    color: "navy",
    criteria: [
      ["4.1.1", "Parsing (obsolete in 2.2)"],
      ["4.1.2", "Name, role, value"],
      ["4.1.3", "Status messages"],
    ],
  },
];

function WhatWeCheck() {
  const [open, setOpen] = useState(false);
  const total = POUR_GROUPS.reduce((n, g) => n + g.criteria.length, 0);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", background: "#fff", border: 0, cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 6, background: "#ecfeff", color: "#0e7490", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <IcShield size={17} sw={2.2} />
          </span>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: "#0b1f3a", letterSpacing: "-0.005em" }}>
              What we check
            </div>
            <div style={{ fontSize: 12.5, color: "#64748b", fontFamily: FONT_INTER, marginTop: 2 }}>
              {total} WCAG 2.1 success criteria · grouped by POUR
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", fontFamily: FONT_INTER }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
            All AA covered
          </span>
          <span style={{ color: "#64748b", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-flex" }}>
            <IcChev size={16} sw={2} />
          </span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
            {POUR_GROUPS.map((g, idx) => (
              <div
                key={g.key}
                style={{
                  padding: "20px 22px",
                  borderRight: idx % 2 === 0 ? "1px solid #f1f5f9" : "none",
                  borderBottom: idx < 2 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: g.color === "cyan" ? "#ecfeff" : "rgba(11,31,58,0.06)",
                      color: g.color === "cyan" ? "#06b6d4" : "#0b1f3a",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {g.letter}
                  </span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#0b1f3a" }}>{g.title}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: "#64748b", marginLeft: "auto" }}>{g.criteria.length}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, fontFamily: FONT_INTER }}>{g.blurb}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {g.criteria.map(([id, label]) => (
                    <span
                      key={id}
                      title={label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 7px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 4,
                        fontFamily: FONT_MONO,
                        fontSize: 10.5,
                        fontWeight: 500,
                        color: "#475569",
                      }}
                    >
                      <span style={{ color: "#0b1f3a", fontWeight: 700 }}>{id}</span>
                      <span style={{ color: "#64748b" }}>·</span>
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Recently scanned
// ============================================================

type RecentRow = { url: string; when: string; score: number | null; status: "ok" | "warn" | "running" };

function RecentlyScanned() {
  const rows: ReadonlyArray<RecentRow> = [
    { url: "agency.gov", when: "2 hrs ago", score: 87, status: "ok" },
    { url: "agency.gov/forms/I-90", when: "2 hrs ago", score: 71, status: "warn" },
    { url: "agency.gov/news", when: "yesterday", score: 94, status: "ok" },
    { url: "internal.agency.gov", when: "yesterday", score: null, status: "running" },
    { url: "staging.agency.gov", when: "Mar 24", score: 62, status: "warn" },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IcHistory size={15} sw={2} style={{ color: "#64748b" }} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#0b1f3a" }}>Recently scanned</span>
        </div>
        <a style={{ fontSize: 12, color: "#64748b", textDecoration: "none", fontFamily: FONT_INTER, fontWeight: 500, cursor: "pointer" }}>
          View all <span style={{ color: "#0e7490" }}>→</span>
        </a>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r, i) => {
          const scoreColor = r.score === null ? "#cbd5e1" : r.score >= 90 ? "#16a34a" : r.score >= 80 ? "#0b1f3a" : "#dc2626";
          return (
            <li
              key={`${r.url}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                alignItems: "center",
                gap: 16,
                padding: "12px 22px",
                borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
                fontFamily: FONT_INTER,
                fontSize: 13,
              }}
            >
              <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <IcGlobe size={13} sw={1.7} style={{ color: "#64748b", flexShrink: 0 }} />
                <span style={{ color: "#0b1f3a", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.url}</span>
              </div>
              <span style={{ color: "#64748b", fontSize: 12 }}>{r.when}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color: scoreColor, minWidth: 28, textAlign: "right" }}>
                {r.status === "running" ? (
                  <span style={{ color: "#a855f7", fontFamily: FONT_INTER, fontWeight: 500, fontSize: 11 }}>Scanning…</span>
                ) : (
                  r.score
                )}
              </span>
              <button
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#0b1f3a", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, cursor: "pointer", transition: "border-color .15s, background .15s" }}
              >
                <IcRefresh size={11} sw={2.2} />
                Re-scan
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================
// Educational callout
// ============================================================

function EduCallout() {
  const cards = [
    { k: "axe-core 4.10", v: "DOM-level rules", note: "Open-source, audited" },
    { k: "AI vision", v: "Rendered pixels", note: "Image contrast · touch targets" },
    { k: "AccessiScan", v: "Auto-Fix patches", note: "PR-ready, atomic commits" },
  ];

  return (
    <div style={{ background: "#0b1f3a", color: "#fff", borderRadius: 8, padding: 28, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          pointerEvents: "none",
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -120,
          width: 360,
          height: 360,
          background: "radial-gradient(50% 50% at 50% 50%, rgba(6,182,212,0.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0e7490", marginBottom: 14 }}>
          Why axe-core + AI vision.
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, letterSpacing: "-0.01em", lineHeight: 1.2, maxWidth: 520, marginBottom: 14 }}>
          Code-only scanners catch 57% of WCAG issues. We catch the rest.
        </div>

        <p style={{ margin: 0, fontFamily: FONT_INTER, fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", maxWidth: 580 }}>
          axe-core inspects the rendered DOM for structural failures — missing alts, ARIA mistakes, label associations. Our AI vision pass renders each page and flags what code can&apos;t see: low-contrast text on photos, undersized touch targets, focus rings hidden behind sticky headers, and decorative motion that violates 2.3.1.
        </p>

        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {cards.map((c) => (
            <div key={c.k} style={{ padding: 14, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: "#0e7490", marginBottom: 8 }}>{c.k}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.v}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{c.note}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: FONT_INTER }}>
          <a style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Read the methodology
            <IcArrow size={12} sw={2.2} />
          </a>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
          <span>Audit logs available for procurement.</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Page composition
// ============================================================

export default function NewScanV2PreviewPage() {
  const [url, setUrl] = useState<string>("");
  const [depth, setDepth] = useState<Depth>("top10");
  const [level, setLevel] = useState<Level>("AA");
  const [autoFix, setAutoFix] = useState<boolean>(true);
  const githubConnected = true;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log("New scan submitted:", { url, depth, level, autoFix, githubConnected });
  };

  const topbarAction = (
    <Btn variant="outline" size="md">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} />
        GitHub connected
      </span>
    </Btn>
  );

  return (
    <>
      <style>{`
        body { background: #f8fafc; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="New scan" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar title="Scan a website" breadcrumb="Scans · New" action={topbarAction} />
          <main style={{ flex: 1, padding: "32px 28px 64px", background: "#f8fafc", overflow: "auto" }}>
            <form onSubmit={handleSubmit} style={{ maxWidth: 760, margin: "0 auto" }}>
              {/* Title */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: FONT_INTER, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
                  Scans · New
                </div>
                <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#0b1f3a" }}>
                  Scan a website.
                </h1>
                <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.55, color: "#475569", fontFamily: FONT_INTER, maxWidth: 600 }}>
                  WCAG 2.1 AA scan via axe-core + AI vision. Results in ~90 seconds.
                </p>
              </div>

              {/* Focal URL input */}
              <UrlScanField url={url} onUrlChange={setUrl} />

              {/* Quick options */}
              <div style={{ marginTop: 18 }}>
                <QuickOptions
                  depth={depth}
                  onDepthChange={setDepth}
                  level={level}
                  onLevelChange={setLevel}
                  autoFix={autoFix}
                  onAutoFixChange={setAutoFix}
                  githubConnected={githubConnected}
                />
              </div>

              {/* What we check */}
              <div style={{ marginTop: 14 }}>
                <WhatWeCheck />
              </div>

              {/* Recently scanned */}
              <div style={{ marginTop: 14 }}>
                <RecentlyScanned />
              </div>

              {/* Below the fold — educational callout */}
              <div style={{ marginTop: 36 }}>
                <EduCallout />
              </div>

              {/* Footer microcopy */}
              <div style={{ marginTop: 24, fontSize: 11, color: "#64748b", textAlign: "center", fontFamily: FONT_INTER, lineHeight: 1.6 }}>
                AccessiScan does not warrant legal compliance. Consult qualified counsel.
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

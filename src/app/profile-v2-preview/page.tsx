"use client";

import { useState, type CSSProperties, type ChangeEvent, type FormEvent, type ReactNode } from "react";

// ============================================================
// Fonts
// ============================================================

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

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
function IcAlert({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function IcBell({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}
function IcCamera({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}
function IcLock({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}
function IcGoogle({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21.35 11.1H12v3.2h5.35a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 3-4.32 3-7.4 0-.6-.06-1.1-.16-1.62z" /><path d="M12 22c2.7 0 4.97-.9 6.6-2.43l-3.24-2.5c-.9.6-2.05.96-3.36.96-2.58 0-4.77-1.74-5.55-4.08H3.1v2.57A10 10 0 0 0 12 22z" /><path d="M6.45 13.95a6 6 0 0 1 0-3.9V7.48H3.1a10 10 0 0 0 0 9.04l3.35-2.57z" /><path d="M12 5.97c1.46 0 2.78.5 3.82 1.5l2.86-2.87C17 3.06 14.7 2 12 2A10 10 0 0 0 3.1 7.48l3.35 2.57C7.23 7.71 9.42 5.97 12 5.97z" /></svg>;
}
function IcGithub({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
}
function IcTrash({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
}
function IcEye({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function IcEyeOff({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
}
function IcLink({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}
function IcUnlink({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M5.17 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" /><line x1="8" y1="2" x2="8" y2="5" /><line x1="2" y1="8" x2="5" y2="8" /><line x1="16" y1="19" x2="16" y2="22" /><line x1="19" y1="16" x2="22" y2="16" /></svg>;
}
function IcInfo({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
}
function IcCheck({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="20 6 9 17 4 12" /></svg>;
}

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
  disabled,
  onClick,
  style,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  leadIcon?: ReactNode;
  trailIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
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
      disabled={disabled}
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
        cursor: disabled ? "not-allowed" : "pointer",
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
// Settings sub-nav
// ============================================================

function SettingsTabs({ active = "Profile" }: { active?: string }) {
  const tabs: string[] = ["Profile", "Billing", "GitHub App", "Notifications", "Team"];
  const disabled: Record<string, boolean> = { Team: true };
  return (
    <div style={{ borderBottom: "1px solid #e2e8f0", padding: "0 28px", background: "#fff" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {tabs.map((t) => {
          const isActive = active === t;
          const isDisabled = !!disabled[t];
          return (
            <button
              key={t}
              type="button"
              disabled={isDisabled}
              style={{
                position: "relative",
                height: 44,
                padding: "0 14px",
                border: 0,
                background: "transparent",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                fontFamily: FONT_INTER,
                color: isDisabled ? "#cbd5e1" : isActive ? "#0b1f3a" : "#64748b",
                cursor: isDisabled ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {t}
              {t === "Team" && (
                <span style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 3, padding: "1px 5px" }}>Soon</span>
              )}
              {isActive && <span style={{ position: "absolute", left: 10, right: 10, bottom: -1, height: 2, background: "#0b1f3a", borderRadius: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Settings layout helpers
// ============================================================

function SettingsSection({
  eyebrow,
  title,
  description,
  children,
  footer,
  danger,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: danger ? "1px solid rgba(220,38,38,0.35)" : "1px solid #e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "none",
      }}
    >
      <div style={{ padding: "22px 24px 4px" }}>
        {eyebrow && (
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: danger ? "#dc2626" : "#06b6d4", marginBottom: 8 }}>
            {eyebrow}
          </div>
        )}
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: danger ? "#7f1d1d" : "#0b1f3a", letterSpacing: "-0.01em" }}>{title}</div>
        {description && <div style={{ marginTop: 6, fontSize: 13, color: "#64748b", lineHeight: 1.55, maxWidth: 640 }}>{description}</div>}
      </div>
      <div style={{ padding: "18px 24px 22px" }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "14px 24px",
            background: danger ? "rgba(220,38,38,0.04)" : "#f8fafc",
            borderTop: "1px solid " + (danger ? "rgba(220,38,38,0.18)" : "#e2e8f0"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

function FormRow({ label, hint, children, error }: { label: string; hint?: string; children: ReactNode; error?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "flex-start", padding: "14px 0", borderTop: "1px solid #f1f5f9" }}>
      <div style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER }}>{label}</div>
        {hint && <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ minWidth: 0 }}>
        {children}
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626", fontFamily: FONT_INTER, display: "flex", alignItems: "center", gap: 5 }}>
            <IcAlert size={12} sw={2} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  maxWidth = 380,
  prefix,
  suffix,
  disabled,
  monospace,
}: {
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  maxWidth?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  monospace?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 38,
        maxWidth,
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: 6,
        background: disabled ? "#f8fafc" : "#fff",
        overflow: "hidden",
        transition: "border-color .15s",
      }}
    >
      {prefix && <span style={{ paddingLeft: 12, color: "#64748b", display: "inline-flex" }}>{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          height: "100%",
          padding: "0 12px",
          border: 0,
          outline: "none",
          background: "transparent",
          fontSize: 14,
          fontFamily: monospace ? FONT_MONO : FONT_INTER,
          color: "#0b1f3a",
          minWidth: 0,
        }}
      />
      {suffix && <span style={{ paddingRight: 8, display: "inline-flex" }}>{suffix}</span>}
    </div>
  );
}

// ============================================================
// Avatar
// ============================================================

function Avatar({ initials = "EM", size = 64, ring = false }: { initials?: string; size?: number; ring?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0b1f3a",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: "-0.01em",
        flexShrink: 0,
        boxShadow: ring ? "0 0 0 4px #fff, 0 0 0 5px #e2e8f0" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {initials}
    </div>
  );
}

// ============================================================
// Connected account row
// ============================================================

type ProviderName = "Google" | "GitHub";

function ConnectedAccountRow({
  provider,
  icon,
  connected,
  account,
  scopes,
  onAction,
}: {
  provider: ProviderName;
  icon: ReactNode;
  connected: boolean;
  account: string;
  scopes: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 18px",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          flexShrink: 0,
          background: provider === "GitHub" ? "#0b1f3a" : "#fff",
          border: provider === "GitHub" ? "1px solid #0b1f3a" : "1px solid #e2e8f0",
          color: provider === "GitHub" ? "#fff" : "#0b1f3a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1f3a", fontFamily: FONT_INTER }}>{provider}</span>
          {connected ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(6,182,212,0.1)",
                color: "#0e7490",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: FONT_INTER,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#06b6d4" }} />
              Connected
            </span>
          ) : (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: FONT_INTER,
              }}
            >
              Not connected
            </span>
          )}
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, color: "#64748b", fontFamily: connected && account ? FONT_MONO : FONT_INTER }}>
          {connected ? account : scopes}
        </div>
      </div>
      <Btn variant={connected ? "outline" : "primary"} size="sm" onClick={onAction} leadIcon={connected ? <IcUnlink size={12} sw={2} /> : <IcLink size={12} sw={2} />}>
        {connected ? "Disconnect" : "Connect"}
      </Btn>
    </div>
  );
}

// ============================================================
// Password modal
// ============================================================

type PwFields = { current: string; next: string; confirm: string };

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);
  const [pw, setPw] = useState<PwFields>({ current: "", next: "", confirm: "" });

  const computeStrength = (): { score: number; label: string; color: string } => {
    const p = pw.next;
    if (!p) return { score: 0, label: "Enter a password", color: "#cbd5e1" };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (p.length >= 14) s++;
    const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
    const colors = ["#dc2626", "#dc2626", "#f59e0b", "#06b6d4", "#16a34a"];
    return { score: s, label: labels[Math.min(s, 4)], color: colors[Math.min(s, 4)] };
  };
  const strength = computeStrength();
  const valid = !!pw.current && pw.next.length >= 8 && pw.next === pw.confirm;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    // eslint-disable-next-line no-console
    console.log("Update password", { current: "***", next: "***" });
    onClose();
  };

  const fields: Array<[string, keyof PwFields]> = [
    ["Current password", "current"],
    ["New password", "next"],
    ["Confirm new password", "confirm"],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,0.55)", backdropFilter: "blur(2px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 20px 60px rgba(11,31,58,0.25)" }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0b1f3a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <IcLock size={16} sw={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Change password.</div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>You&apos;ll be signed out of other sessions.</div>
          </div>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map(([label, key]) => (
            <div key={key}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0b1f3a", marginBottom: 6, fontFamily: FONT_INTER }}>{label}</div>
              <TextInput
                type={show ? "text" : "password"}
                value={pw[key]}
                onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                maxWidth={9999}
                suffix={
                  key === "current" ? (
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      style={{ height: 30, width: 30, border: 0, background: "transparent", color: "#64748b", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {show ? <IcEyeOff size={15} sw={1.8} /> : <IcEye size={15} sw={1.8} />}
                    </button>
                  ) : null
                }
              />
              {key === "next" && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden", display: "flex", gap: 2 }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: "100%", background: i < strength.score ? strength.color : "transparent" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, fontFamily: FONT_INTER, minWidth: 70, textAlign: "right" }}>{strength.label}</span>
                </div>
              )}
              {key === "confirm" && pw.confirm && pw.next !== pw.confirm && (
                <div style={{ marginTop: 6, fontSize: 11.5, color: "#dc2626", fontFamily: FONT_INTER }}>Passwords don&apos;t match.</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 8, background: "#f8fafc" }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" variant="primary" size="sm" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}>
            Update password
          </Btn>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// Profile Settings (main content)
// ============================================================

type AccountState = {
  google: { connected: boolean; account: string };
  github: { connected: boolean; account: string };
};

function ProfileSettings() {
  const originalName = "Elena Marquez";
  const originalEmail = "elena.marquez@agency.gov";
  const originalRole = "Compliance Lead";

  const [name, setName] = useState(originalName);
  const [email, setEmail] = useState(originalEmail);
  const [role, setRole] = useState(originalRole);

  const [accounts, setAccounts] = useState<AccountState>({
    google: { connected: true, account: "elena.marquez@agency.gov" },
    github: { connected: true, account: "elenamarquez · 4 repos installed" },
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const dirty = name !== originalName || email !== originalEmail || role !== originalRole;
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("") || "EM";

  const flashSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  const handleAccountSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dirty) return;
    // eslint-disable-next-line no-console
    console.log("Save account details", { name, email, role });
    flashSaved();
  };

  const handleDiscard = () => {
    setName(originalName);
    setEmail(originalEmail);
    setRole(originalRole);
  };

  const handleDelete = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (deleteConfirm !== "delete my account") return;
    // eslint-disable-next-line no-console
    console.log("Delete account confirmed");
  };

  const toggleGoogle = () => {
    setAccounts((a) => ({
      ...a,
      google: {
        connected: !a.google.connected,
        account: a.google.connected ? "" : email,
      },
    }));
  };

  const toggleGithub = () => {
    setAccounts((a) => ({
      ...a,
      github: {
        connected: !a.github.connected,
        account: a.github.connected ? "" : "elenamarquez · 4 repos installed",
      },
    }));
  };

  const deleteEnabled = deleteConfirm === "delete my account";

  return (
    <main style={{ flex: 1, background: "#f8fafc", overflow: "auto" }}>
      <SettingsTabs active="Profile" />
      <div style={{ padding: 28, maxWidth: 920, margin: "0 auto" }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: "#0b1f3a", letterSpacing: "-0.015em" }}>
            Profile settings.
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#64748b", maxWidth: 620, lineHeight: 1.55 }}>
            Manage your AccessiScan account, sign-in methods, and how compliance reports are attributed to you.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Avatar */}
          <SettingsSection
            title="Profile photo"
            description="Used in the top bar, scan exports, and the audit trail of any Auto-Fix PR you approve."
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24, paddingTop: 4 }}>
              <Avatar initials={initials} size={84} ring />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <Btn variant="outline" size="sm" leadIcon={<IcCamera size={13} sw={1.8} />}>
                    Change photo
                  </Btn>
                  <Btn variant="ghost" size="sm">
                    Remove
                  </Btn>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", fontFamily: FONT_INTER, display: "flex", alignItems: "center", gap: 6 }}>
                  <IcInfo size={12} sw={2} />
                  PNG or JPG. 512×512px recommended. Max 2 MB.
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Identity */}
          <form onSubmit={handleAccountSubmit}>
            <SettingsSection
              title="Account details"
              description="Your name appears on VPAT 2.5 and Section 508 exports as the report author."
              footer={
                <>
                  <div style={{ fontSize: 12, color: "#64748b", fontFamily: FONT_INTER, display: "flex", alignItems: "center", gap: 8 }}>
                    {dirty ? (
                      <>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                        Unsaved changes.
                      </>
                    ) : savedToast ? (
                      <span style={{ color: "#0e7490", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <IcCheck size={12} sw={2.5} />
                        Saved.
                      </span>
                    ) : (
                      <>Last updated Mar 14, 2026.</>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="outline" size="sm" onClick={handleDiscard}>
                      Discard
                    </Btn>
                    <Btn type="submit" variant="primary" size="sm" disabled={!dirty}>
                      Save changes
                    </Btn>
                  </div>
                </>
              }
            >
              <FormRow label="Full name" hint="As it should appear on procurement-grade reports.">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} />
              </FormRow>
              <FormRow label="Work email" hint="We send scan summaries and DOJ deadline reminders here.">
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormRow>
              <FormRow label="Role / title" hint="Optional. Shown next to your signature on VPAT exports.">
                <TextInput value={role} onChange={(e) => setRole(e.target.value)} />
              </FormRow>
              <FormRow label="Workspace" hint="Owner-level access · contact your admin to switch.">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    height: 38,
                    padding: "0 12px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    borderRadius: 6,
                    fontSize: 13.5,
                    color: "#0b1f3a",
                    fontFamily: FONT_INTER,
                    maxWidth: 380,
                    width: "100%",
                  }}
                >
                  <span style={{ width: 22, height: 22, borderRadius: 4, background: "#06b6d4", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <IcShield size={12} sw={2.5} />
                  </span>
                  <span style={{ fontWeight: 500 }}>Acme Agency</span>
                  <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 11, color: "#64748b" }}>Owner</span>
                </div>
              </FormRow>
            </SettingsSection>
          </form>

          {/* Password */}
          <SettingsSection
            title="Password"
            description="Use a strong, unique password. AccessiScan supports SSO and passkeys for organization-wide rollouts."
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f1f5f9", color: "#0b1f3a", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <IcLock size={18} sw={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, color: "#0b1f3a", fontWeight: 600, fontFamily: FONT_INTER }}>Password set</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontFamily: FONT_INTER }}>Last changed 47 days ago · 2FA enabled via authenticator app</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" size="sm">
                  Manage 2FA
                </Btn>
                <Btn variant="outline" size="sm" onClick={() => setShowPwModal(true)}>
                  Change password
                </Btn>
              </div>
            </div>
          </SettingsSection>

          {/* Connected accounts */}
          <SettingsSection
            title="Connected accounts"
            description="Sign-in providers and service connections. Disconnecting GitHub will pause Auto-Fix PRs on all monitored repos."
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              <ConnectedAccountRow
                provider="Google"
                icon={<IcGoogle size={20} sw={1.8} />}
                connected={accounts.google.connected}
                account={accounts.google.account}
                scopes="Sign in with your Google Workspace account."
                onAction={toggleGoogle}
              />
              <ConnectedAccountRow
                provider="GitHub"
                icon={<IcGithub size={20} sw={1.8} />}
                connected={accounts.github.connected}
                account={accounts.github.account}
                scopes="Required for Auto-Fix PRs and CI/CD scan checks."
                onAction={toggleGithub}
              />
            </div>
            {accounts.github.connected && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "rgba(6,182,212,0.07)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  fontSize: 12,
                  color: "#0b1f3a",
                  fontFamily: FONT_INTER,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <IcInfo size={13} sw={2} style={{ color: "#0e7490", flexShrink: 0 }} />
                Auto-Fix PRs are active for{" "}
                <span style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>agency-org/website</span>,{" "}
                <span style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>agency-org/forms</span>, and 2 more.
              </div>
            )}
          </SettingsSection>

          {/* Danger zone */}
          <SettingsSection
            danger
            eyebrow="Danger zone"
            title="Delete account"
            description="Permanently delete your AccessiScan account, all scan history, VPAT exports, and any pending Auto-Fix PRs authored by you. This cannot be undone."
          >
            {!showDelete ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 4 }}>
                <div style={{ fontSize: 12.5, color: "#7f1d1d", fontFamily: FONT_INTER, lineHeight: 1.5, maxWidth: 540 }}>
                  As an Owner, deleting your account will also transfer ownership of <b>Acme Agency</b> to another admin or schedule the workspace for deletion in 30 days.
                </div>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDelete(true)}
                  style={{ borderColor: "rgba(220,38,38,0.4)", color: "#dc2626" }}
                  leadIcon={<IcTrash size={12} sw={2} />}
                >
                  Delete account…
                </Btn>
              </div>
            ) : (
              <form onSubmit={handleDelete} style={{ paddingTop: 4, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 13, color: "#7f1d1d", fontFamily: FONT_INTER, lineHeight: 1.55 }}>
                  Type{" "}
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "1px 6px", borderRadius: 3 }}>
                    delete my account
                  </span>{" "}
                  to confirm. This action is permanent.
                </div>
                <TextInput
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="delete my account"
                  monospace
                  maxWidth={420}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDelete(false);
                      setDeleteConfirm("");
                    }}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    type="submit"
                    variant="urgent"
                    size="sm"
                    disabled={!deleteEnabled}
                    leadIcon={<IcTrash size={12} sw={2} />}
                    style={{ opacity: deleteEnabled ? 1 : 0.45 }}
                  >
                    Permanently delete account
                  </Btn>
                </div>
              </form>
            )}
          </SettingsSection>
        </div>

        <div style={{ marginTop: 28, fontSize: 11.5, color: "#64748b", fontFamily: FONT_INTER, textAlign: "center" }}>
          AccessiScan does not warrant legal compliance. Consult qualified counsel.
        </div>
      </div>

      {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} />}
    </main>
  );
}

// ============================================================
// Page composition
// ============================================================

export default function ProfileV2PreviewPage() {
  return (
    <>
      <style>{`
        body { background: #f8fafc; }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Profile" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar title="Settings" breadcrumb="Workspace · Acme Agency · Settings" />
          <ProfileSettings />
        </div>
      </div>
    </>
  );
}

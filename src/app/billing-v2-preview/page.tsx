"use client";

import { type CSSProperties, type ReactNode } from "react";

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
function IcPr({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></svg>;
}
function IcBell({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
}
function IcExt({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function IcDownload({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function IcArrow({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function IcCheck({ size = 14, sw = 1.7, style }: IcProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="20 6 9 17 4 12" /></svg>;
}

const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";

// ============================================================
// Buttons
// ============================================================

type BtnVariant = "primary" | "urgent" | "outline" | "cyan" | "ghost";
type BtnSize = "sm" | "md" | "lg";

function Btn({ children, variant = "primary", size = "md", leadIcon, trailIcon, style, disabled }: { children: ReactNode; variant?: BtnVariant; size?: BtnSize; leadIcon?: ReactNode; trailIcon?: ReactNode; style?: CSSProperties; disabled?: boolean }) {
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
    <button type="button" disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer", background: v.bg, color: v.color, border: v.border, transition: "background-color .15s,border-color .15s", ...style }}>
      {leadIcon}{children}{trailIcon}
    </button>
  );
}

// ============================================================
// Sidebar
// ============================================================

type SidebarItem = { label: string; icon: ReactNode };

function Sidebar({ active = "Billing" }: { active?: string }) {
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
// Shared primitives
// ============================================================

function Eyebrow({ children, color = "#06b6d4" }: { children: ReactNode; color?: string }) {
  return <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color, fontWeight: 600, fontFamily: FONT_INTER }}>{children}</span>;
}

function Card({ children, style, accent }: { children: ReactNode; style?: CSSProperties; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      borderTop: accent ? `3px solid ${accent}` : "1px solid #e2e8f0",
      ...style,
    }}>{children}</div>
  );
}

function Section({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <section>
      {(title || sub) && (
        <div style={{ marginBottom: 14 }}>
          {title && <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, color: "#0b1f3a", letterSpacing: "-0.01em" }}>{title}.</div>}
          {sub && <div style={{ marginTop: 2, fontSize: 13, color: "#64748b", fontFamily: FONT_INTER }}>{sub}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================================
// Current Plan
// ============================================================

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#0b1f3a", fontWeight: 600, fontFamily: FONT_INTER }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function CurrentPlanCard() {
  return (
    <Card accent="#06b6d4" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", minHeight: 200 }}>
        {/* Left: plan info */}
        <div style={{ padding: "26px 28px", borderRight: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Eyebrow>Current plan</Eyebrow>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 4, background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.25)", color: "#15803d", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />Active
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1, color: "#0b1f3a", letterSpacing: "-0.02em" }}>Pro</span>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: 18, color: "#0b1f3a" }}>$99<span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>/mo</span></span>
          </div>
          <div style={{ marginTop: 14, fontSize: 13.5, color: "#475569", fontFamily: FONT_INTER, lineHeight: 1.55, maxWidth: 460 }}>
            Up to 10 monitored sites · unlimited scans · Auto-Fix PRs · VPAT 2.5 export · CI/CD integration · priority support.
          </div>
          <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 28, fontFamily: FONT_INTER }}>
            <Meta label="Next renewal" value="May 26, 2026" sub="Auto-renews · annual billing" />
            <Meta label="Billing cycle" value="Annual" sub="$1,188 / year · save 17%" />
            <Meta label="Member since" value="Aug 2024" sub="20 months" />
          </div>
        </div>
        {/* Right: actions */}
        <div style={{ padding: "26px 28px", background: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
          <div>
            <Eyebrow color="#64748b">Subscription</Eyebrow>
            <div style={{ marginTop: 10, fontSize: 13, color: "#475569", lineHeight: 1.55, fontFamily: FONT_INTER }}>
              Manage card, switch to monthly, change tier, or cancel — all via Stripe&apos;s secure portal.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Btn variant="primary" size="md" trailIcon={<IcExt size={12} sw={2} />}>Manage Subscription</Btn>
            <Btn variant="ghost" size="sm" style={{ justifyContent: "center", fontSize: 12, color: "#64748b" }}>Cancel subscription</Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Usage
// ============================================================

type UsageItem = { label: string; used: number; total: number | null; icon: "globe" | "scan" | "pr"; limit: string; warn?: boolean };

function UsageRow() {
  const usage: UsageItem[] = [
    { label: "Sites tracked", used: 3, total: 3, icon: "globe", limit: "Plan limit", warn: true },
    { label: "Scans run", used: 47, total: null, icon: "scan", limit: "Unlimited" },
    { label: "Auto-Fix PRs opened", used: 12, total: null, icon: "pr", limit: "Unlimited" },
  ];
  const renderIcon = (k: UsageItem["icon"]) => {
    if (k === "globe") return <IcGlobe size={14} sw={1.8} />;
    if (k === "scan") return <IcScan size={14} sw={1.8} />;
    return <IcPr size={14} sw={1.8} />;
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
      {usage.map((u) => {
        const pct = u.total ? Math.min(100, (u.used / u.total) * 100) : null;
        const atCap = u.total !== null && u.used >= u.total;
        return (
          <Card key={u.label} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#64748b", fontFamily: FONT_INTER }}>{u.label}</span>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: "#f1f5f9", color: "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {renderIcon(u.icon)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: 1, color: atCap ? "#dc2626" : "#0b1f3a", letterSpacing: "-0.02em" }}>{u.used}</span>
              <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 13, color: "#64748b" }}>
                {u.total !== null ? `of ${u.total}` : `of ${u.limit.toLowerCase()}`}
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              {pct !== null ? (
                <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: atCap ? "#dc2626" : pct > 80 ? "#f59e0b" : "#06b6d4" }} />
                </div>
              ) : (
                <div style={{ height: 5, background: "linear-gradient(90deg,#06b6d4 0%,#22d3ee 100%)", borderRadius: 3, opacity: 0.35 }} />
              )}
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: FONT_INTER }}>
                <span style={{ color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 600 }}>{u.limit}</span>
                {atCap && <span style={{ color: "#dc2626", fontWeight: 600 }}>At capacity</span>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================
// Plan tiers
// ============================================================

type TierState = "downgrade" | "current" | "upgrade";
type Tier = { name: string; price: string; cycle: string; state: TierState; tagline: string; features: string[]; recommended?: boolean };

function PlanTiers() {
  const tiers: Tier[] = [
    {
      name: "Starter", price: "$19", cycle: "/mo", state: "downgrade",
      tagline: "For single-site teams getting compliance off the ground.",
      features: [
        "1 monitored site",
        "Up to 100 pages per scan",
        "2 scans / month",
        "WCAG 2.1 AA report",
        "Email support",
      ],
    },
    {
      name: "Pro", price: "$99", cycle: "/mo", state: "current", recommended: true,
      tagline: "Most agencies and procurement teams land here.",
      features: [
        "Up to 10 monitored sites",
        "Up to 5,000 pages per scan",
        "Unlimited scans",
        "Auto-Fix PRs (GitHub)",
        "VPAT 2.5 export · CI/CD",
        "Priority support",
      ],
    },
    {
      name: "Enterprise", price: "Custom", cycle: "", state: "upgrade",
      tagline: "DOJ procurement, multi-tenant, dedicated infra.",
      features: [
        "Unlimited sites & pages",
        "SSO / SAML · audit log",
        "Dedicated CSM",
        "Custom SLA · DPA",
        "On-prem / private cloud",
        "Section 508 attestations",
      ],
    },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <Eyebrow color="#64748b">Available plans</Eyebrow>
          <div style={{ marginTop: 4, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, color: "#0b1f3a", letterSpacing: "-0.01em" }}>Change plan.</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Prorated upgrades take effect immediately. Downgrades apply at next renewal.</div>
        </div>
        <div style={{ display: "inline-flex", padding: 3, background: "#f1f5f9", borderRadius: 6, fontFamily: FONT_INTER, fontSize: 12.5 }}>
          <button type="button" style={{ height: 28, padding: "0 14px", borderRadius: 4, border: 0, background: "#fff", color: "#0b1f3a", fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}>Annual <span style={{ color: "#0e7490", marginLeft: 4 }}>−17%</span></button>
          <button type="button" style={{ height: 28, padding: "0 14px", borderRadius: 4, border: 0, background: "transparent", color: "#64748b", fontWeight: 500, cursor: "pointer" }}>Monthly</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {tiers.map((t) => {
          const isCurrent = t.state === "current";
          return (
            <div key={t.name} style={{
              background: "#fff",
              border: isCurrent ? "1px solid #06b6d4" : "1px solid #e2e8f0",
              borderTop: isCurrent ? "3px solid #06b6d4" : (t.recommended ? "3px solid #06b6d4" : "1px solid #e2e8f0"),
              borderRadius: 8,
              padding: 22,
              position: "relative",
              boxShadow: isCurrent ? "0 0 0 3px rgba(6,182,212,0.10)" : "none",
            }}>
              {isCurrent && (
                <span style={{ position: "absolute", top: -11, left: 22, padding: "3px 10px", borderRadius: 4, background: "#06b6d4", color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT_INTER }}>
                  Current plan
                </span>
              )}
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: "#0b1f3a", letterSpacing: "-0.01em" }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4, lineHeight: 1.5, minHeight: 36 }}>{t.tagline}</div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 4, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: "#0b1f3a", letterSpacing: "-0.02em", lineHeight: 1 }}>{t.price}</span>
                {t.cycle && <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 13, color: "#64748b" }}>{t.cycle}</span>}
              </div>
              <ul style={{ padding: 0, margin: "16px 0 18px", listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#334155", fontFamily: FONT_INTER, lineHeight: 1.5 }}>
                    <span style={{ color: "#0e7490", marginTop: 3, flexShrink: 0, display: "inline-flex" }}><IcCheck size={13} sw={2.5} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              {t.state === "current" && (
                <button type="button" disabled style={{ width: "100%", height: 40, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 13, fontFamily: FONT_INTER, cursor: "not-allowed" }}>
                  Your current plan
                </button>
              )}
              {t.state === "upgrade" && (
                <Btn variant="primary" size="md" style={{ width: "100%", justifyContent: "center" }} trailIcon={<IcArrow size={11} sw={2.5} />}>Contact sales</Btn>
              )}
              {t.state === "downgrade" && (
                <button type="button" style={{ width: "100%", height: 40, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 500, fontSize: 13, fontFamily: FONT_INTER, cursor: "pointer" }}>
                  Downgrade to Starter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Payment method
// ============================================================

function PaymentMethodCard() {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <Eyebrow color="#64748b">Payment method</Eyebrow>
              <div style={{ marginTop: 4, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Default card on file</div>
            </div>
            <span style={{ fontSize: 10.5, letterSpacing: "0.10em", textTransform: "uppercase", color: "#16a34a", fontWeight: 600, padding: "3px 8px", background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 4 }}>Verified</span>
          </div>
          {/* Card visual */}
          <div style={{
            background: "linear-gradient(135deg, #0b1f3a 0%, #122c4f 60%, #1c3a66 100%)",
            color: "#fff",
            borderRadius: 8,
            padding: "20px 22px",
            position: "relative",
            overflow: "hidden",
            fontFamily: FONT_INTER,
            minHeight: 160,
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 120 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Visa · Business</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ width: 22, height: 14, borderRadius: 2, background: "#dc2626" }} />
                  <span style={{ width: 22, height: 14, borderRadius: 2, background: "#f59e0b", marginLeft: -8 }} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 500, letterSpacing: "0.08em", marginTop: 14 }}>•••• •••• •••• 4242</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11.5 }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Cardholder</div>
                    <div style={{ marginTop: 2 }}>Acme Agency</div>
                  </div>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Expires</div>
                    <div style={{ marginTop: 2, fontFamily: FONT_MONO }}>08 / 2028</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "22px 24px", background: "#f8fafc", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Eyebrow color="#64748b">Billing contact</Eyebrow>
            <div style={{ marginTop: 8, fontSize: 13.5, color: "#0b1f3a", fontWeight: 600, fontFamily: FONT_INTER }}>finance@acme-agency.gov</div>
            <div style={{ fontSize: 12, color: "#64748b", fontFamily: FONT_INTER }}>Receipts and renewal reminders are sent here.</div>
          </div>
          <div>
            <Eyebrow color="#64748b">Billing address</Eyebrow>
            <div style={{ marginTop: 8, fontSize: 12.5, color: "#334155", fontFamily: FONT_INTER, lineHeight: 1.55 }}>
              Acme Agency, LLC<br />
              221 W 3rd St, Suite 400<br />
              Austin, TX 78701 · United States
            </div>
          </div>
          <div>
            <Eyebrow color="#64748b">Tax ID</Eyebrow>
            <div style={{ marginTop: 6, fontSize: 12.5, color: "#0b1f3a", fontFamily: FONT_MONO, fontWeight: 500 }}>EIN · 47-•••2418</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <Btn variant="primary" size="sm" trailIcon={<IcExt size={11} sw={2} />}>Update card</Btn>
            <Btn variant="outline" size="sm">Edit billing info</Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Invoices
// ============================================================

type InvoiceStatus = "paid" | "refunded" | "failed";
type Invoice = { id: string; date: string; plan: string; amount: string; status: InvoiceStatus };

function InvoiceStatusBadge({ s }: { s: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { bg: string; color: string; border: string; label: string }> = {
    paid: { bg: "rgba(22,163,74,0.10)", color: "#15803d", border: "rgba(22,163,74,0.25)", label: "Paid" },
    refunded: { bg: "rgba(148,163,184,0.15)", color: "#475569", border: "rgba(148,163,184,0.3)", label: "Refunded" },
    failed: { bg: "rgba(220,38,38,0.10)", color: "#b91c1c", border: "rgba(220,38,38,0.25)", label: "Failed" },
  };
  const m = map[s];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 4, background: m.bg, border: `1px solid ${m.border}`, color: m.color, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: FONT_INTER }}>
      {m.label}
    </span>
  );
}

function InvoicesTable() {
  const invoices: Invoice[] = [
    { id: "INV-2026-0426", date: "Apr 26, 2026", plan: "Pro · Annual", amount: "$1,188.00", status: "paid" },
    { id: "INV-2026-0326", date: "Mar 26, 2026", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2026-0226", date: "Feb 26, 2026", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2026-0126", date: "Jan 26, 2026", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2025-1226", date: "Dec 26, 2025", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2025-1126", date: "Nov 26, 2025", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2025-1026", date: "Oct 26, 2025", plan: "Pro · Monthly", amount: "$99.00", status: "refunded" },
    { id: "INV-2025-0926", date: "Sep 26, 2025", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2025-0826", date: "Aug 26, 2025", plan: "Pro · Monthly", amount: "$99.00", status: "paid" },
    { id: "INV-2025-0726", date: "Jul 26, 2025", plan: "Starter · Monthly", amount: "$19.00", status: "paid" },
    { id: "INV-2025-0626", date: "Jun 26, 2025", plan: "Starter · Monthly", amount: "$19.00", status: "paid" },
    { id: "INV-2025-0526", date: "May 26, 2025", plan: "Starter · Monthly", amount: "$19.00", status: "paid" },
  ];
  const headers: { label: string; align: "left" | "right" }[] = [
    { label: "Invoice", align: "left" },
    { label: "Date", align: "left" },
    { label: "Plan", align: "left" },
    { label: "Amount", align: "right" },
    { label: "Status", align: "left" },
    { label: "", align: "right" },
  ];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#0b1f3a" }}>Invoices.</div>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2, fontFamily: FONT_INTER }}>Last 12 invoices · all amounts in USD</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select defaultValue="All statuses" style={{ height: 32, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12.5, fontFamily: FONT_INTER, color: "#475569", background: "#fff" }}>
            <option>All statuses</option><option>Paid</option><option>Refunded</option><option>Failed</option>
          </select>
          <Btn variant="outline" size="sm" leadIcon={<IcDownload size={12} sw={2} />}>Export CSV</Btn>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {headers.map((h, i) => (
              <th key={`${h.label}-${i}`} style={{
                padding: "10px 16px",
                textAlign: h.align,
                fontSize: 10.5, letterSpacing: "0.10em", textTransform: "uppercase",
                color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0",
                fontFamily: FONT_INTER,
              }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id} style={{ borderBottom: i === invoices.length - 1 ? 0 : "1px solid #f1f5f9" }}>
              <td style={{ padding: "13px 16px", fontFamily: FONT_MONO, fontSize: 12, color: "#0b1f3a", fontWeight: 500 }}>{inv.id}</td>
              <td style={{ padding: "13px 16px", color: "#475569" }}>{inv.date}</td>
              <td style={{ padding: "13px 16px", color: "#0b1f3a", fontWeight: 500 }}>{inv.plan}</td>
              <td style={{ padding: "13px 16px", fontFamily: FONT_MONO, fontWeight: 600, color: "#0b1f3a", textAlign: "right" }}>{inv.amount}</td>
              <td style={{ padding: "13px 16px" }}><InvoiceStatusBadge s={inv.status} /></td>
              <td style={{ padding: "13px 16px", textAlign: "right" }}>
                <a style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0e7490", fontWeight: 600, fontSize: 12, fontFamily: FONT_INTER, textDecoration: "none", cursor: "pointer" }}>
                  <IcDownload size={12} sw={2} />PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "12px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748b", fontFamily: FONT_INTER, background: "#f8fafc" }}>
        <span>Showing 12 of 20 invoices</span>
        <a style={{ color: "#0e7490", fontWeight: 600, cursor: "pointer" }}>View all in Stripe portal →</a>
      </div>
    </Card>
  );
}

// ============================================================
// Page composition
// ============================================================

export default function BillingV2PreviewPage() {
  return (
    <>
      <style>{`body { background: #f8fafc; }`}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0b1f3a" }}>
        <Sidebar active="Billing" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar
            title="Billing"
            breadcrumb="Settings · Billing"
            action={<Btn variant="outline" size="md" trailIcon={<IcExt size={12} sw={2} />}>Stripe portal</Btn>}
          />
          <main style={{ flex: 1, padding: "24px 28px 40px", background: "#f8fafc", overflow: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <CurrentPlanCard />

              <Section title="Usage this month" sub="Resets on May 26, 2026 · 30 days remaining in cycle">
                <UsageRow />
              </Section>

              <Section>
                <PlanTiers />
              </Section>

              <Section title="Payment & billing details" sub="Card and billing info are managed in Stripe.">
                <PaymentMethodCard />
              </Section>

              <Section>
                <InvoicesTable />
              </Section>

              {/* Footer note */}
              <div style={{ marginTop: 6, padding: "14px 18px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_INTER, fontSize: 12.5, color: "#64748b" }}>
                <span>Need a custom invoice, PO, or annual contract? Email <a style={{ color: "#0b1f3a", fontWeight: 600 }}>billing@accessiscan.com</a>.</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#94a3b8" }}>Acct · acme-agency · 4f8b9c</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

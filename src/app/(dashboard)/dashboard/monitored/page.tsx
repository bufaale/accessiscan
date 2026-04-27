// TODO(B4): replace mock sparklines (per-card 7-day trend) with /api/sites/[id]/sparkline.
// TODO(B4): replace mock "Recently changed" feed with a real feed sourced from
// scan_snapshots regression deltas (currently 100% mock data, marked below).
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { toast } from "sonner";

// ===== Design tokens (mirror Claude Design v2) =====
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const GREEN = "#16a34a";
const GREEN_DARK = "#15803d";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";
const SLATE_600 = "#475569";

// ===== Types =====
interface MonitoredSite {
  id: string;
  url: string;
  label: string | null;
  cadence: "daily" | "weekly" | "monthly";
  enabled: boolean;
  last_scan_at: string | null;
  last_score: number | null;
  last_critical: number;
  last_serious: number;
  last_moderate?: number | null;
  last_minor?: number | null;
  alert_email: string | null;
  regression_threshold: number;
  created_at: string;
  sparkline?: Array<{ score: number; t: string }>;
}

type FilterKey = "all" | "monitoring" | "regressing" | "paused";

// ===== Helpers =====
function scoreColor(score: number | null): string {
  if (score == null) return SLATE_400;
  if (score >= 85) return GREEN;
  if (score >= 70) return AMBER;
  return RED;
}

function scoreGrade(score: number | null): string {
  if (score == null) return "Awaiting first scan";
  if (score >= 95) return "VPAT-ready";
  if (score >= 90) return "AA conformant";
  if (score >= 80) return "Near AA";
  if (score >= 70) return "Below AA";
  return "Non-conformant";
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Awaiting first scan";
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const min = Math.round(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const days = Math.round(hr / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function siteAtRisk(site: MonitoredSite): boolean {
  if (site.last_critical && site.last_critical > 0) return true;
  if (site.last_score != null && site.last_score < 70) return true;
  return false;
}

function siteStatus(site: MonitoredSite): "monitoring" | "paused" | "regressing" {
  if (!site.enabled) return "paused";
  if (siteAtRisk(site)) return "regressing";
  return "monitoring";
}

// Pull real 7-day sparkline points from /api/monitored response when present,
// fall back to a deterministic mock when scan_snapshots is empty (e.g. site
// added today, no cron run yet).
function sparklineFor(site: MonitoredSite): number[] {
  if (site.sparkline && site.sparkline.length >= 2) {
    return site.sparkline.map((p) => p.score);
  }
  return mockSparklineFor(site);
}

function mockSparklineFor(site: MonitoredSite): number[] {
  const base = site.last_score ?? 75;
  // Pseudo-random per id (stable across renders)
  let h = 0;
  for (let i = 0; i < site.id.length; i++) {
    h = (h * 31 + site.id.charCodeAt(i)) | 0;
  }
  const arr: number[] = [];
  for (let i = 0; i < 7; i++) {
    const seed = (h ^ (i * 2654435761)) >>> 0;
    const jitter = ((seed % 1000) / 1000 - 0.5) * 6; // ±3 pts
    const drift = (i - 6) * 0.4; // slight rise toward today
    arr.push(Math.max(0, Math.min(100, Math.round(base + jitter + drift))));
  }
  arr[arr.length - 1] = base; // anchor "today" to current score
  return arr;
}

// ===== Recently changed feed (MOCK) =====
// TODO(B4): replace with real /api/sites/recently-changed feed.
function mockRecentlyChanged(sites: MonitoredSite[]): Array<{
  id: string;
  url: string;
  delta: number;
  from: number;
  to: number;
  ago: string;
}> {
  if (sites.length === 0) return [];
  const sample = sites.slice(0, Math.min(4, sites.length));
  const events = ["2 hr ago", "6 hr ago", "Yesterday", "2 days ago"];
  const deltas = [+6, -4, +3, -8];
  return sample.map((s, i) => {
    const to = s.last_score ?? 80;
    const delta = deltas[i % deltas.length];
    const from = Math.max(0, Math.min(100, to - delta));
    return {
      id: s.id,
      url: s.label ?? s.url,
      delta,
      from,
      to,
      ago: events[i % events.length],
    };
  });
}

// ===== Inline SVG icons (no dangerouslySetInnerHTML — hard-coded paths) =====
type IconName =
  | "plus"
  | "arrow"
  | "clock"
  | "alert"
  | "check"
  | "trash"
  | "pause"
  | "play"
  | "ext"
  | "zap"
  | "trendUp"
  | "trendDown"
  | "globe";

function Icon({
  name,
  size = 14,
  sw = 1.7,
  style,
}: {
  name: IconName;
  size?: number;
  sw?: number;
  style?: CSSProperties;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    "aria-hidden": true,
  };
  switch (name) {
    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "ext":
      return (
        <svg {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "trendUp":
      return (
        <svg {...common}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "trendDown":
      return (
        <svg {...common}>
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    default:
      return null;
  }
}

// ===== Sparkline =====
function Sparkline({
  data,
  color = CYAN,
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 200;
  const h = height;
  const pad = 2;
  if (data.length < 2) {
    return <svg width="100%" height={h} aria-hidden />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 4);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  const polyline = pts.map((p) => p.join(",")).join(" ");
  const area = `${pts[0][0]},${h} ${polyline} ${pts[pts.length - 1][0]},${h}`;
  const last = pts[pts.length - 1];
  return (
    <svg
      data-testid="site-sparkline"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
      aria-hidden
    >
      <polygon points={area} fill={color} fillOpacity={0.12} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={2.5}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ===== Status pill =====
function StatusPill({ status }: { status: "monitoring" | "paused" | "regressing" }) {
  const m = {
    monitoring: { dot: GREEN, label: "Healthy", bg: "rgba(22,163,74,0.10)", color: GREEN_DARK },
    regressing: { dot: RED, label: "Critical", bg: "rgba(220,38,38,0.10)", color: "#b91c1c" },
    paused: { dot: SLATE_400, label: "Paused", bg: SLATE_100, color: SLATE_600 },
  }[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 4,
        background: m.bg,
        color: m.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontFamily: FONT_INTER,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: m.dot,
        }}
      />
      {m.label}
    </span>
  );
}

// ===== Main page =====
export default function MonitoredSitesPage() {
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAdd, setShowAdd] = useState(false);

  // Add-site modal form state
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [cadence, setCadence] = useState<MonitoredSite["cadence"]>("weekly");
  const [alertEmail, setAlertEmail] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/monitored");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSites(data.sites ?? []);
      setPlan((data.plan ?? "free").toLowerCase());
    } catch {
      toast.error("Failed to load monitored sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const hasAccess = plan === "business";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/monitored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          label: label || undefined,
          cadence,
          alert_email: alertEmail || undefined,
          regression_threshold: threshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Create failed");
        return;
      }
      toast.success("Site added to monitoring");
      setUrl("");
      setLabel("");
      setAlertEmail("");
      setShowAdd(false);
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleEnabled(site: MonitoredSite) {
    await fetch(`/api/monitored/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !site.enabled }),
    });
    await load();
  }

  async function remove(site: MonitoredSite) {
    if (!confirm(`Stop monitoring ${site.label ?? site.url}?`)) return;
    await fetch(`/api/monitored/${site.id}`, { method: "DELETE" });
    toast.success("Removed");
    await load();
  }

  // Computed KPIs
  const kpis = useMemo(() => {
    const total = sites.length;
    const scored = sites.filter((s) => s.last_score != null);
    const avg =
      scored.length === 0
        ? null
        : Math.round(
            scored.reduce((a, s) => a + (s.last_score ?? 0), 0) / scored.length,
          );
    const atRisk = sites.filter(siteAtRisk).length;
    return { total, avg, atRisk };
  }, [sites]);

  const filtered = useMemo(() => {
    if (filter === "all") return sites;
    return sites.filter((s) => siteStatus(s) === filter);
  }, [sites, filter]);

  const recentlyChanged = useMemo(() => mockRecentlyChanged(sites), [sites]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: "24px 28px 48px",
        color: NAVY,
        fontFamily: FONT_INTER,
      }}
    >
      <PageHeader
        count={sites.length}
        capacity={10}
        plan={plan}
        filter={filter}
        setFilter={setFilter}
        canAdd={hasAccess}
        onAdd={() => setShowAdd(true)}
      />

      {!hasAccess && <BusinessUpsellBanner />}

      {hasAccess && (
        <>
          <KpiStrip kpis={kpis} />

          {loading ? (
            <SectionCard>
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: SLATE_500,
                  fontSize: 13.5,
                }}
              >
                Loading monitored sites…
              </div>
            </SectionCard>
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={() => setShowAdd(true)} />
          ) : (
            <div
              data-testid="monitored-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 16,
              }}
            >
              {filtered.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onToggle={() => toggleEnabled(site)}
                  onRemove={() => remove(site)}
                />
              ))}
            </div>
          )}

          <RecentlyChangedFeed events={recentlyChanged} />
        </>
      )}

      {showAdd && (
        <AddSiteModal
          onClose={() => setShowAdd(false)}
          onSubmit={handleCreate}
          url={url}
          setUrl={setUrl}
          label={label}
          setLabel={setLabel}
          cadence={cadence}
          setCadence={setCadence}
          alertEmail={alertEmail}
          setAlertEmail={setAlertEmail}
          threshold={threshold}
          setThreshold={setThreshold}
          creating={creating}
        />
      )}
    </div>
  );
}

// ===== Sub-components =====

function PageHeader({
  count,
  capacity,
  filter,
  setFilter,
  canAdd,
  onAdd,
}: {
  count: number;
  capacity: number;
  plan: string;
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
  canAdd: boolean;
  onAdd: () => void;
}) {
  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: "all", label: "All sites" },
    { key: "monitoring", label: "Healthy" },
    { key: "regressing", label: "Critical" },
    { key: "paused", label: "Paused" },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              borderRadius: 4,
              background: "#ecfeff",
              border: "1px solid rgba(6,182,212,0.30)",
              fontSize: 10.5,
              fontFamily: FONT_INTER,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#0e7490",
            }}
          >
            <Icon name="zap" size={10} sw={2.4} />
            Business tier
          </span>
          <span
            data-testid="monitored-count"
            style={{
              fontSize: 12,
              color: SLATE_500,
              fontFamily: FONT_MONO,
            }}
          >
            {count} / {capacity} sites monitored
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.1,
            color: NAVY,
            letterSpacing: "-0.02em",
          }}
        >
          Monitored sites
        </h1>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13.5,
            color: SLATE_500,
            maxWidth: 620,
            lineHeight: 1.55,
          }}
        >
          We re-scan each registered URL on your chosen cadence and surface
          regressions before users hit them. Up to 10 sites on the Business
          plan.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {canAdd && (
          <div
            style={{
              display: "inline-flex",
              padding: 3,
              background: "#fff",
              border: `1px solid ${SLATE_200}`,
              borderRadius: 6,
            }}
          >
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  type="button"
                  data-testid={`filter-${f.key}`}
                  style={{
                    height: 28,
                    padding: "0 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: FONT_INTER,
                    borderRadius: 4,
                    border: 0,
                    cursor: "pointer",
                    background: active ? NAVY : "transparent",
                    color: active ? "#fff" : SLATE_600,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={canAdd ? onAdd : undefined}
          disabled={!canAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 36,
            padding: "0 14px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: FONT_INTER,
            borderRadius: 6,
            background: canAdd ? NAVY : SLATE_300,
            color: "#fff",
            border: "none",
            cursor: canAdd ? "pointer" : "not-allowed",
            opacity: canAdd ? 1 : 0.6,
          }}
          title={canAdd ? "Add a new site to monitoring" : "Upgrade to Business to add sites"}
        >
          <Icon name="plus" size={13} sw={2.4} />
          Add site
        </button>
      </div>
    </div>
  );
}

function BusinessUpsellBanner() {
  return (
    <div
      role="alert"
      data-testid="monitored-upsell"
      style={{
        background: NAVY,
        borderRadius: 10,
        padding: "20px 24px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        position: "relative",
        overflow: "hidden",
        flexWrap: "wrap",
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
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          position: "relative",
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.4)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: CYAN,
          }}
        >
          <Icon name="zap" size={20} sw={2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 8px",
              border: "1px solid rgba(6,182,212,0.4)",
              background: "rgba(6,182,212,0.1)",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: CYAN,
              }}
            />
            Business tier
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            Continuous monitoring is on the Business plan.
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.55,
            }}
          >
            Daily WCAG 2.1 AA re-scans · regression alerts via email · up to 10
            monitored sites.
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          position: "relative",
        }}
      >
        <Link
          href="/settings/billing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 36,
            padding: "0 16px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: FONT_INTER,
            borderRadius: 6,
            background: CYAN,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          See Business plan
          <Icon name="arrow" size={12} sw={2.5} />
        </Link>
      </div>
    </div>
  );
}

function KpiStrip({
  kpis,
}: {
  kpis: { total: number; avg: number | null; atRisk: number };
}) {
  const items: Array<{
    testId: string;
    label: string;
    value: ReactNode;
    suffix: string;
    color: string;
  }> = [
    {
      testId: "kpi-total",
      label: "Sites monitored",
      value: kpis.total,
      suffix: "active",
      color: NAVY,
    },
    {
      testId: "kpi-avg-score",
      label: "Average score",
      value: kpis.avg ?? "—",
      suffix: kpis.avg == null ? "no scans yet" : "/ 100",
      color: scoreColor(kpis.avg),
    },
    {
      testId: "kpi-at-risk",
      label: "Sites at risk",
      value: kpis.atRisk,
      suffix: kpis.atRisk === 0 ? "all healthy" : "needs review",
      color: kpis.atRisk > 0 ? RED : GREEN,
    },
  ];
  return (
    <div
      data-testid="kpi-strip"
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        overflow: "hidden",
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.testId}
          data-testid={it.testId}
          style={{
            padding: "16px 22px",
            borderRight: i < items.length - 1 ? `1px solid ${SLATE_100}` : 0,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: SLATE_400,
              fontWeight: 600,
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <span
              data-testid={`${it.testId}-value`}
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 28,
                color: it.color,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {it.value}
            </span>
            <span style={{ fontSize: 11.5, color: SLATE_400 }}>{it.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px dashed ${SLATE_300}`,
        borderRadius: 10,
        padding: "56px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: "#ecfeff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: CYAN,
        }}
      >
        <Icon name="globe" size={26} sw={1.8} />
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 20,
            color: NAVY,
            letterSpacing: "-0.01em",
          }}
        >
          No sites under monitoring yet.
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 13.5,
            color: SLATE_500,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.55,
          }}
        >
          Add a site and we&apos;ll re-scan it on your chosen cadence, surface
          regressions before users hit them, and email your team when the
          compliance score drops.
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        style={{
          height: 40,
          padding: "0 16px",
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: FONT_INTER,
          borderRadius: 6,
          cursor: "pointer",
          background: NAVY,
          color: "#fff",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <Icon name="plus" size={14} sw={2.4} />
        Add your first site
      </button>
    </div>
  );
}

function SiteCard({
  site,
  onToggle,
  onRemove,
}: {
  site: MonitoredSite;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const status = siteStatus(site);
  const score = site.last_score;
  const trend = sparklineFor(site);
  const trendColor = scoreColor(score);
  const delta = trend[trend.length - 1] - trend[0];
  const trendUp = delta >= 0;
  const isPaused = !site.enabled;
  const displayName = site.label ?? site.url;
  const initial = (site.label ?? site.url.replace(/^https?:\/\//, "").replace(/^www\./, ""))
    .charAt(0)
    .toUpperCase();
  const nextScanLabel =
    site.cadence === "daily"
      ? "Next: in 24 hr"
      : site.cadence === "weekly"
        ? "Next: weekly"
        : "Next: monthly";

  return (
    <article
      data-testid="site-card"
      data-site-id={site.id}
      data-site-status={status}
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: isPaused ? 0.78 : 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 12px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: status === "regressing" ? RED : NAVY,
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
              }}
            >
              <span
                data-testid="site-domain"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 15,
                  color: NAVY,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.01em",
                }}
              >
                {displayName}
              </span>
              <Icon
                name="ext"
                size={11}
                sw={2}
                style={{ color: SLATE_400, flexShrink: 0 }}
              />
            </div>
            <div style={{ marginTop: 4 }}>
              <StatusPill status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* Score row */}
      <div
        style={{
          padding: "0 18px 12px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            data-testid="site-score"
            data-score={score ?? ""}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              color: trendColor,
              display: "inline-flex",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            {score ?? "—"}
            <span
              style={{
                fontFamily: FONT_INTER,
                fontSize: 13,
                fontWeight: 500,
                color: SLATE_400,
                letterSpacing: 0,
              }}
            >
              /100
            </span>
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: SLATE_500,
              fontWeight: 600,
            }}
          >
            {scoreGrade(score)}
          </div>
        </div>
        {score != null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 4,
              background: trendUp
                ? "rgba(22,163,74,0.10)"
                : "rgba(220,38,38,0.10)",
              color: trendUp ? GREEN_DARK : "#b91c1c",
              fontFamily: FONT_MONO,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Icon
              name={trendUp ? "trendUp" : "trendDown"}
              size={10}
              sw={2.4}
            />
            {trendUp ? "+" : ""}
            {delta} pts
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div style={{ padding: "0 14px 12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontFamily: FONT_MONO,
            color: SLATE_400,
            padding: "0 4px 4px",
          }}
        >
          <span>7d</span>
          <span>now</span>
        </div>
        <div style={{ position: "relative", height: 36 }}>
          <Sparkline data={trend} color={trendColor} height={36} />
        </div>
      </div>

      {/* Issue chips */}
      <div
        style={{
          margin: "0 18px",
          padding: "12px 0",
          borderTop: `1px solid ${SLATE_100}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
        data-testid="site-issue-chips"
      >
        <IssueChip severity="critical" count={site.last_critical} label="critical" />
        <IssueChip severity="serious" count={site.last_serious} label="serious" />
        <IssueChip severity="moderate" count={site.last_moderate ?? 0} label="moderate" />
        <IssueChip severity="minor" count={site.last_minor ?? 0} label="minor" />
      </div>

      {/* Last / next scan */}
      <div
        style={{
          margin: "0 18px",
          padding: "10px 0 14px",
          borderTop: `1px solid ${SLATE_100}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: SLATE_400,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Last scan
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: SLATE_600,
            }}
          >
            <Icon name="clock" size={11} sw={2} />
            {timeAgo(site.last_scan_at)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: SLATE_400,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Cadence
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: SLATE_600,
              textTransform: "capitalize",
            }}
          >
            {site.cadence} · {nextScanLabel}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px 14px",
          borderTop: `1px solid ${SLATE_100}`,
          display: "flex",
          gap: 6,
          alignItems: "center",
          background: "#fafbfc",
        }}
      >
        <Link
          href="/dashboard/scans"
          style={{
            flex: 1,
            height: 32,
            padding: "0 12px",
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: FONT_INTER,
            borderRadius: 6,
            background: CYAN,
            color: "#fff",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Open scan
          <Icon name="arrow" size={11} sw={2.4} />
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isPaused ? `Resume monitoring ${displayName}` : `Pause monitoring ${displayName}`}
          title={isPaused ? "Resume monitoring" : "Pause monitoring"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: `1px solid ${SLATE_200}`,
            background: "#fff",
            color: SLATE_600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={isPaused ? "play" : "pause"} size={13} sw={2} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Stop monitoring ${displayName}`}
          title="Remove site"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: `1px solid ${SLATE_200}`,
            background: "#fff",
            color: RED,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="trash" size={13} sw={2} />
        </button>
      </div>
    </article>
  );
}

function IssueChip({
  severity,
  count,
  label,
}: {
  severity: "critical" | "serious" | "moderate" | "minor";
  count: number;
  label: string;
}) {
  const palette: Record<typeof severity, { bg: string; color: string }> = {
    critical: { bg: "rgba(220,38,38,0.10)", color: RED },
    serious: { bg: "rgba(245,158,11,0.10)", color: "#b45309" },
    moderate: { bg: "rgba(6,182,212,0.10)", color: "#0e7490" },
    minor: { bg: SLATE_100, color: SLATE_600 },
  };
  const muted = count === 0;
  const c = palette[severity];
  return (
    <span
      data-testid={`issue-chip-${severity}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 4,
        background: muted ? SLATE_50 : c.bg,
        color: muted ? SLATE_400 : c.color,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 11,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: muted ? SLATE_300 : c.color,
        }}
      />
      {count}{" "}
      <span
        style={{
          fontFamily: FONT_INTER,
          fontWeight: 500,
          textTransform: "lowercase",
        }}
      >
        {label}
      </span>
    </span>
  );
}

function RecentlyChangedFeed({
  events,
}: {
  events: Array<{
    id: string;
    url: string;
    delta: number;
    from: number;
    to: number;
    ago: string;
  }>;
}) {
  return (
    <div
      data-testid="recently-changed"
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${SLATE_200}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 16,
              color: NAVY,
              letterSpacing: "-0.01em",
            }}
          >
            Recently changed
          </div>
          <div
            style={{
              fontSize: 12,
              color: SLATE_500,
              marginTop: 2,
            }}
          >
            Score deltas across your monitored portfolio.
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: SLATE_400,
            fontWeight: 600,
            fontFamily: FONT_INTER,
          }}
          title="Mock data — replaced by /api/sites/recently-changed in Phase B"
        >
          Preview · mock data
        </span>
      </div>
      {events.length === 0 ? (
        <div
          style={{
            padding: 24,
            fontSize: 13,
            color: SLATE_500,
            textAlign: "center",
          }}
        >
          No score changes yet. Once a second snapshot is captured we&apos;ll
          surface regressions here.
        </div>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {events.map((e, i) => {
            const up = e.delta >= 0;
            return (
              <li
                key={e.id + i}
                data-testid="recently-changed-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  borderTop: i === 0 ? "none" : `1px solid ${SLATE_100}`,
                  fontFamily: FONT_INTER,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    color: NAVY,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.url}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    color: SLATE_500,
                  }}
                >
                  {e.from} <span style={{ color: SLATE_300 }}>→</span>{" "}
                  <span style={{ color: NAVY, fontWeight: 600 }}>{e.to}</span>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: up
                      ? "rgba(22,163,74,0.10)"
                      : "rgba(220,38,38,0.10)",
                    color: up ? GREEN_DARK : "#b91c1c",
                    fontFamily: FONT_MONO,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  <Icon name={up ? "trendUp" : "trendDown"} size={10} sw={2.4} />
                  {up ? "+" : ""}
                  {e.delta}
                  <span
                    style={{
                      color: SLATE_500,
                      fontFamily: FONT_INTER,
                      fontWeight: 500,
                      marginLeft: 6,
                    }}
                  >
                    {e.ago}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ===== Add Site Modal =====
function AddSiteModal({
  onClose,
  onSubmit,
  url,
  setUrl,
  label,
  setLabel,
  cadence,
  setCadence,
  alertEmail,
  setAlertEmail,
  threshold,
  setThreshold,
  creating,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  url: string;
  setUrl: (v: string) => void;
  label: string;
  setLabel: (v: string) => void;
  cadence: MonitoredSite["cadence"];
  setCadence: (v: MonitoredSite["cadence"]) => void;
  alertEmail: string;
  setAlertEmail: (v: string) => void;
  threshold: number;
  setThreshold: (v: number) => void;
  creating: boolean;
}) {
  const inputStyle: CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: `1px solid ${SLATE_300}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: FONT_INTER,
    color: NAVY,
    background: "#fff",
    outline: "none",
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,31,58,0.55)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a site to monitor"
        style={{
          position: "relative",
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 10,
          width: 540,
          maxWidth: "calc(100% - 32px)",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
        }}
      >
        <form onSubmit={onSubmit}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${SLATE_200}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: CYAN,
                  fontWeight: 600,
                }}
              >
                Business · continuous monitoring
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 20,
                  color: NAVY,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}
              >
                Add a site to monitor
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 0,
                background: "transparent",
                color: SLATE_400,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <label
                htmlFor="monitored-url"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: NAVY,
                  fontFamily: FONT_INTER,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Target URL
              </label>
              <input
                id="monitored-url"
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/checkout"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                htmlFor="monitored-label"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: NAVY,
                  fontFamily: FONT_INTER,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Label (optional)
              </label>
              <input
                id="monitored-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Marketing checkout"
                maxLength={80}
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label
                  htmlFor="monitored-cadence"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: NAVY,
                    fontFamily: FONT_INTER,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Cadence
                </label>
                <select
                  id="monitored-cadence"
                  value={cadence}
                  onChange={(e) =>
                    setCadence(e.target.value as MonitoredSite["cadence"])
                  }
                  style={{ ...inputStyle, appearance: "auto" }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="monitored-threshold"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: NAVY,
                    fontFamily: FONT_INTER,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Regression threshold
                </label>
                <input
                  id="monitored-threshold"
                  type="number"
                  min={1}
                  max={50}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="monitored-alert"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: NAVY,
                  fontFamily: FONT_INTER,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Alert email (optional)
              </label>
              <input
                id="monitored-alert"
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Defaults to your account email"
                style={inputStyle}
              />
            </div>
          </div>
          <div
            style={{
              padding: "16px 24px",
              borderTop: `1px solid ${SLATE_200}`,
              background: SLATE_50,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 38,
                padding: "0 14px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: FONT_INTER,
                borderRadius: 6,
                cursor: "pointer",
                background: "#fff",
                color: NAVY,
                border: `1px solid ${SLATE_300}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                height: 38,
                padding: "0 16px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: FONT_INTER,
                borderRadius: 6,
                cursor: creating ? "not-allowed" : "pointer",
                background: creating ? SLATE_300 : NAVY,
                color: "#fff",
                border: "none",
              }}
            >
              {creating ? "Adding…" : "Start monitoring"}
              <Icon name="arrow" size={11} sw={2.4} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

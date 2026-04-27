"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardError } from "@/components/dashboard/dashboard-error";
import { CrossPromoBanner } from "@/components/dashboard/cross-promo-banner";
import type { Scan, Site } from "@/types/database";

// Design tokens (mirror Claude Design v2)
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";

type Stats = {
  sitesTracked: number;
  totalScans: number;
  avgScore: number | null;
  criticalIssues: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [stats, setStats] = useState<Stats>({
    sitesTracked: 0,
    totalScans: 0,
    avgScore: null,
    criticalIssues: 0,
  });

  async function load(isRetry = false) {
    if (isRetry) setRetrying(true);
    else setLoading(true);
    setError(null);
    try {
      const [scansRes, sitesRes, statsRes] = await Promise.all([
        fetch("/api/scans?limit=6"),
        fetch("/api/sites"),
        fetch("/api/stats"),
      ]);
      if (scansRes.ok) {
        const data = await scansRes.json();
        setRecentScans(data.scans);
      } else if (scansRes.status >= 500) {
        throw new Error(`scans API returned ${scansRes.status}`);
      }
      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        setSites(sitesData.sites ?? []);
      } else if (sitesRes.status >= 500) {
        throw new Error(`sites API returned ${sitesRes.status}`);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else if (statsRes.status >= 500) {
        throw new Error(`stats API returned ${statsRes.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <Heading onNewScan={() => router.push("/dashboard/scans/new")} />

      {error && (
        <DashboardError
          message={error}
          retrying={retrying}
          onRetry={() => void load(true)}
        />
      )}

      <DojStrip />

      <KpiCards stats={stats} loading={loading} />

      <RecentScansTable
        scans={recentScans}
        sites={sites}
        loading={loading}
        onRowClick={(id) => router.push(`/dashboard/scans/${id}`)}
        onNewScan={() => router.push("/dashboard/scans/new")}
        onViewAll={() => router.push("/dashboard/scans")}
      />

      {sites.length > 0 && (
        <SitesGrid sites={sites} onClick={(domain) => router.push(`/dashboard/sites/${domain}`)} />
      )}

      <CrossPromoBanner />
    </div>
  );
}

function Heading({ onNewScan }: { onNewScan: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER }}>
          Monitor your websites&apos; accessibility compliance
        </p>
      </div>
      <button
        type="button"
        onClick={onNewScan}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", border: "none", cursor: "pointer" }}
      >
        + New scan
      </button>
    </div>
  );
}

function DojStrip() {
  const target = new Date("2027-04-26T00:00:00Z").getTime();
  const days = Math.max(0, Math.round((target - Date.now()) / 86400000));
  return (
    <div style={{ background: NAVY, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, fontFamily: FONT_INTER, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} aria-hidden />
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <span style={{ width: 36, height: 36, borderRadius: 6, background: RED, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }} aria-hidden>!</span>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN, fontWeight: 700, marginBottom: 3 }}>
            DOJ Title II · WCAG 2.1 AA · 50,000+ residents
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            <span style={{ fontFamily: FONT_MONO, color: RED, fontWeight: 700 }}>{days}</span> days until enforcement deadline · April 26, 2027
          </div>
        </div>
      </div>
      <Link
        href="/why-not-overlays"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 4, background: RED, color: "#fff", textDecoration: "none", position: "relative" }}
      >
        Title II checklist →
      </Link>
    </div>
  );
}

function KpiCards({ stats, loading }: { stats: Stats; loading: boolean }) {
  const cards = [
    { title: "Sites tracked", value: loading ? "—" : String(stats.sitesTracked) },
    { title: "Total scans", value: loading ? "—" : String(stats.totalScans) },
    {
      title: "Avg compliance score",
      value: loading ? "—" : stats.avgScore !== null ? String(stats.avgScore) : "—",
      suffix: stats.avgScore !== null ? "/100" : undefined,
    },
    { title: "Critical issues", value: loading ? "—" : String(stats.criticalIssues), danger: true },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {cards.map((c, idx) => (
        <div key={idx} style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: SLATE_500, fontFamily: FONT_INTER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
            {c.title}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: 1, color: c.danger && c.value !== "0" && c.value !== "—" ? RED : NAVY, letterSpacing: "-0.02em" }}>
              {c.value}
            </span>
            {c.suffix && (
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 16, color: SLATE_400 }}>{c.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentScansTable({
  scans,
  sites,
  loading,
  onRowClick,
  onNewScan,
  onViewAll,
}: {
  scans: Scan[];
  sites: Site[];
  loading: boolean;
  onRowClick: (id: string) => void;
  onNewScan: () => void;
  onViewAll: () => void;
}) {
  const sitesById = new Map(sites.map((s) => [s.id, s.domain]));

  const headerCells: ReactNode = (
    <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${SLATE_200}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: NAVY }}>
          Recent scans.
        </div>
        <div style={{ fontSize: 12.5, color: SLATE_500, marginTop: 2 }}>
          Latest 6 scans across all your monitored sites.
        </div>
      </div>
      <button
        type="button"
        onClick={onViewAll}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: "transparent", color: SLATE_500, border: "none", cursor: "pointer" }}
      >
        View all →
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, overflow: "hidden" }}>
        {headerCells}
        <div style={{ padding: 24 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 14, background: SLATE_100, borderRadius: 4, marginBottom: 12 }} aria-hidden />
          ))}
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, overflow: "hidden" }}>
        {headerCells}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: NAVY }}>No scans yet</div>
          <p style={{ fontSize: 13, color: SLATE_500, marginTop: 6, marginBottom: 18, fontFamily: FONT_INTER }}>
            Run your first accessibility scan to get started.
          </p>
          <button
            type="button"
            onClick={onNewScan}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", border: "none", cursor: "pointer" }}
          >
            Run first scan
          </button>
        </div>
      </div>
    );
  }

  const Status = ({ status }: { status: Scan["status"] }) => {
    const m: Record<Scan["status"], { color: string; bg: string; label: string }> = {
      completed: { color: "#16a34a", bg: "rgba(22,163,74,0.10)", label: "Completed" },
      analyzing: { color: "#7c3aed", bg: "rgba(124,58,237,0.10)", label: "Analyzing" },
      crawling: { color: "#2563eb", bg: "rgba(37,99,235,0.10)", label: "Crawling" },
      pending: { color: SLATE_500, bg: SLATE_100, label: "Pending" },
      failed: { color: RED, bg: "rgba(220,38,38,0.10)", label: "Failed" },
    };
    const it = m[status];
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 9999, background: it.bg, color: it.color, fontSize: 11, fontWeight: 600 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.color }} aria-hidden />
        {it.label}
      </span>
    );
  };

  const tableHead = ["Site", "Scanned", "Score", "Status"] as const;
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, overflow: "hidden" }}>
      {headerCells}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
        <thead>
          <tr style={{ background: SLATE_50 }}>
            {tableHead.map((h, idx) => (
              <th key={h} style={{ padding: "10px 20px", textAlign: idx >= 2 && idx < 3 ? "right" : "left", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: SLATE_500, fontWeight: 600, borderBottom: `1px solid ${SLATE_200}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, i) => {
            const isLast = i === scans.length - 1;
            const score = scan.compliance_score;
            const dateText = new Date(scan.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const siteDomain = scan.site_id ? sitesById.get(scan.site_id) ?? scan.url : scan.url;
            const rowStyle: CSSProperties = {
              borderBottom: isLast ? 0 : `1px solid ${SLATE_100}`,
              cursor: "pointer",
            };
            return (
              <tr key={scan.id} style={rowStyle} onClick={() => onRowClick(scan.id)} data-scan-id={scan.id}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: NAVY, fontWeight: 600 }}>
                    {siteDomain}
                  </div>
                </td>
                <td style={{ padding: "14px 20px", color: SLATE_500, fontSize: 12.5 }}>{dateText}</td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: score === null ? SLATE_400 : score >= 90 ? "#16a34a" : score >= 80 ? NAVY : RED }}>
                  {score ?? "—"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <Status status={scan.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SitesGrid({
  sites,
  onClick,
}: {
  sites: Site[];
  onClick: (domain: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: NAVY, marginBottom: 12 }}>
        Your sites
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {sites.map((site) => (
          <div
            key={site.id}
            onClick={() => onClick(site.domain)}
            style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, cursor: "pointer", transition: "border-color .15s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontFamily: FONT_MONO, fontSize: 13, color: NAVY, fontWeight: 600, margin: 0 }}>
                  {site.domain}
                </p>
                <p style={{ fontSize: 11.5, color: SLATE_500, marginTop: 4, marginBottom: 0 }}>
                  {site.scan_count} scans
                </p>
              </div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color: site.latest_score !== null && site.latest_score >= 80 ? NAVY : RED }}>
                {site.latest_score !== null ? site.latest_score : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

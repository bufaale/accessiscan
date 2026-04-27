"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { Scan } from "@/types/database";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const GREEN = "#16a34a";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";

type StatusFilter = "all" | Scan["status"];
type SeverityFilter = "all" | "critical" | "serious" | "moderate" | "minor";
type DateRange = "7d" | "30d" | "90d" | "all";

const RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

function statusPillStyle(status: Scan["status"]): { color: string; bg: string; label: string } {
  switch (status) {
    case "completed":
      return { color: GREEN, bg: "rgba(22,163,74,0.10)", label: "Completed" };
    case "analyzing":
      return { color: "#7c3aed", bg: "rgba(124,58,237,0.10)", label: "Analyzing" };
    case "crawling":
      return { color: "#2563eb", bg: "rgba(37,99,235,0.10)", label: "Crawling" };
    case "pending":
      return { color: SLATE_500, bg: SLATE_100, label: "Pending" };
    case "failed":
      return { color: RED, bg: "rgba(220,38,38,0.10)", label: "Failed" };
    default:
      return { color: SLATE_500, bg: SLATE_100, label: status };
  }
}

function rangeMs(r: DateRange): number {
  switch (r) {
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    case "90d":
      return 90 * 24 * 60 * 60 * 1000;
    case "all":
      return Infinity;
  }
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(scans: Scan[]) {
  const headers = [
    "scan_id",
    "domain",
    "url",
    "compliance_score",
    "scan_type",
    "status",
    "critical_count",
    "serious_count",
    "moderate_count",
    "minor_count",
    "created_at",
  ];
  const rows = scans.map((s) => [
    s.id,
    s.domain ?? "",
    s.url,
    s.compliance_score ?? "",
    s.scan_type,
    s.status,
    s.critical_count ?? 0,
    s.serious_count ?? 0,
    s.moderate_count ?? 0,
    s.minor_count ?? 0,
    s.created_at,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accessiscan-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ScanHistoryPage() {
  const router = useRouter();
  const [allScans, setAllScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Load up to 200 scans for client-side filtering. Sufficient for the
  // free/pro/agency tiers' typical volume; business tier with 1000+ scans
  // would need server-side pagination but that's a follow-up.
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/scans?limit=200");
        if (res.ok) {
          const data = await res.json();
          setAllScans(data.scans ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Apply all filters client-side
  const filteredScans = useMemo(() => {
    const cutoff = Date.now() - rangeMs(dateRange);
    return allScans.filter((s) => {
      if (search && !s.domain?.toLowerCase().includes(search.toLowerCase()) && !s.url.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (severityFilter !== "all") {
        const count =
          severityFilter === "critical"
            ? s.critical_count
            : severityFilter === "serious"
              ? s.serious_count
              : severityFilter === "moderate"
                ? s.moderate_count
                : s.minor_count;
        if (!count || count === 0) return false;
      }
      if (dateRange !== "all" && new Date(s.created_at).getTime() < cutoff) return false;
      return true;
    });
  }, [allScans, search, statusFilter, severityFilter, dateRange]);

  // Compute KPI summary from the FILTERED list so it reflects the user's view
  const kpis = useMemo(() => {
    const total = filteredScans.length;
    const completed = filteredScans.filter((s) => s.status === "completed");
    const scoreSum = completed.reduce(
      (sum, s) => sum + (s.compliance_score ?? 0),
      0,
    );
    const avgScore = completed.length > 0 ? Math.round(scoreSum / completed.length) : null;
    const totalCritical = filteredScans.reduce(
      (sum, s) => sum + (s.critical_count ?? 0),
      0,
    );
    const sites = new Set(filteredScans.map((s) => s.domain).filter(Boolean));
    return {
      total,
      avgScore,
      totalCritical,
      sitesCovered: sites.size,
    };
  }, [filteredScans]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
            Scan history
          </h1>
          <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER }}>
            All your accessibility scans across every site you&apos;ve tested.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => downloadCsv(filteredScans)}
            disabled={filteredScans.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 40, padding: "0 14px", fontSize: 13, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: "#fff", color: NAVY, border: `1px solid ${SLATE_300}`, cursor: filteredScans.length === 0 ? "not-allowed" : "pointer", opacity: filteredScans.length === 0 ? 0.5 : 1 }}
          >
            ↓ Export CSV
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/scans/new")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", border: "none", cursor: "pointer" }}
          >
            + New scan
          </button>
        </div>
      </div>

      <KpiSummary kpis={kpis} />

      <FilterBar
        search={search}
        onSearch={setSearch}
        status={statusFilter}
        onStatus={setStatusFilter}
        severity={severityFilter}
        onSeverity={setSeverityFilter}
        dateRange={dateRange}
        onDateRange={setDateRange}
      />

      <div style={{ fontFamily: FONT_INTER, fontSize: 13, color: SLATE_500 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: NAVY }}>
          All scans
        </span>{" "}
        <span style={{ fontFamily: FONT_MONO, color: SLATE_500 }}>
          ({filteredScans.length} matching)
        </span>
      </div>

      {loading ? (
        <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 48, textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER, fontSize: 13.5 }}>
          Loading scans...
        </div>
      ) : filteredScans.length === 0 ? (
        <EmptyState
          searched={!!search || statusFilter !== "all" || severityFilter !== "all" || dateRange !== "all"}
          onNewScan={() => router.push("/dashboard/scans/new")}
        />
      ) : (
        <ScanTable
          scans={filteredScans}
          onRowClick={(scan) => {
            if (scan.status === "completed") router.push(`/dashboard/scans/${scan.id}`);
          }}
        />
      )}
    </div>
  );
}

function KpiSummary({
  kpis,
}: {
  kpis: { total: number; avgScore: number | null; totalCritical: number; sitesCovered: number };
}) {
  const cards: Array<{ label: string; value: string; danger?: boolean }> = [
    { label: "Total scans", value: String(kpis.total) },
    { label: "Avg compliance score", value: kpis.avgScore !== null ? String(kpis.avgScore) : "—" },
    { label: "Critical issues found", value: String(kpis.totalCritical), danger: kpis.totalCritical > 0 },
    { label: "Sites covered", value: String(kpis.sitesCovered) },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: SLATE_500, fontFamily: FONT_INTER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            {c.label}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, lineHeight: 1, color: c.danger && c.value !== "0" ? RED : NAVY, letterSpacing: "-0.02em" }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({
  search,
  onSearch,
  status,
  onStatus,
  severity,
  onSeverity,
  dateRange,
  onDateRange,
}: {
  search: string;
  onSearch: (s: string) => void;
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  severity: SeverityFilter;
  onSeverity: (s: SeverityFilter) => void;
  dateRange: DateRange;
  onDateRange: (r: DateRange) => void;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 14, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", fontFamily: FONT_INTER }}>
      <input
        type="text"
        placeholder="Filter by domain or URL..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{ flex: 1, minWidth: 220, height: 36, padding: "0 12px", border: `1px solid ${SLATE_200}`, borderRadius: 6, fontSize: 13, fontFamily: FONT_INTER, color: NAVY, background: "#fff", outline: "none" }}
      />

      <FilterGroup label="Status">
        {(["all", "completed", "failed", "analyzing", "crawling", "pending"] as const).map((s) => (
          <Chip key={s} active={status === s} onClick={() => onStatus(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Severity">
        {(["all", "critical", "serious", "moderate", "minor"] as const).map((s) => (
          <Chip key={s} active={severity === s} onClick={() => onSeverity(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </FilterGroup>

      <select
        value={dateRange}
        onChange={(e) => onDateRange(e.target.value as DateRange)}
        style={{ height: 36, padding: "0 28px 0 12px", border: `1px solid ${SLATE_200}`, borderRadius: 6, fontSize: 13, fontFamily: FONT_INTER, color: NAVY, background: "#fff", cursor: "pointer" }}
      >
        {(["7d", "30d", "90d", "all"] as const).map((r) => (
          <option key={r} value={r}>
            {RANGE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: SLATE_500, letterSpacing: "0.10em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height: 28, padding: "0 10px", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 4, background: active ? NAVY : "#fff", color: active ? "#fff" : NAVY, border: `1px solid ${active ? NAVY : SLATE_300}`, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

function EmptyState({ searched, onNewScan }: { searched: boolean; onNewScan: () => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: NAVY }}>
        {searched ? "No scans match your filters" : "No scans yet"}
      </div>
      <p style={{ fontSize: 13, color: SLATE_500, marginTop: 6, marginBottom: 18, fontFamily: FONT_INTER }}>
        {searched
          ? "Try adjusting the filters or clearing the search."
          : "Run your first accessibility scan to get started."}
      </p>
      <button
        type="button"
        onClick={onNewScan}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", border: "none", cursor: "pointer" }}
      >
        Run first scan
      </button>
    </div>
  );
}

function ScanTable({ scans, onRowClick }: { scans: Scan[]; onRowClick: (scan: Scan) => void }) {
  const headers = ["Score", "Domain", "URL", "Pages", "Critical", "Type", "Status", "Date", ""] as const;
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_INTER }}>
        <thead>
          <tr style={{ background: SLATE_50 }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: SLATE_500, fontWeight: 600, borderBottom: `1px solid ${SLATE_200}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, i) => {
            const isLast = i === scans.length - 1;
            const score = scan.compliance_score;
            const pill = statusPillStyle(scan.status);
            const pageCount = (scan as Scan & { pages_scanned?: number }).pages_scanned;
            const rowStyle: CSSProperties = {
              borderBottom: isLast ? 0 : `1px solid ${SLATE_100}`,
              cursor: scan.status === "completed" ? "pointer" : "default",
            };
            return (
              <tr key={scan.id} style={rowStyle} onClick={() => onRowClick(scan)} data-scan-id={scan.id}>
                <td style={{ padding: "14px 18px", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color: score === null ? SLATE_400 : score >= 80 ? NAVY : RED }}>
                  {score ?? "—"}
                </td>
                <td style={{ padding: "14px 18px", fontFamily: FONT_MONO, fontSize: 12.5, color: NAVY, fontWeight: 600 }}>
                  {scan.domain}
                </td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: SLATE_500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {scan.url}
                </td>
                <td style={{ padding: "14px 18px", fontFamily: FONT_MONO, fontSize: 12, color: SLATE_500 }}>
                  {pageCount ?? (scan.scan_type === "deep" ? "—" : "1")}
                </td>
                <td style={{ padding: "14px 18px", fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color: (scan.critical_count ?? 0) > 0 ? RED : SLATE_400 }}>
                  {scan.critical_count ?? 0}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, background: scan.scan_type === "deep" ? "rgba(6,182,212,0.12)" : SLATE_100, color: scan.scan_type === "deep" ? CYAN : SLATE_500, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                    {scan.scan_type === "deep" ? "Deep" : "Quick"}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 9999, background: pill.bg, color: pill.color, fontSize: 11, fontWeight: 600 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: pill.color }} aria-hidden />
                    {pill.label}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: SLATE_500, fontFamily: FONT_INTER }}>
                  {new Date(scan.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right", color: SLATE_400, fontSize: 14 }}>
                  {scan.status === "completed" ? "→" : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

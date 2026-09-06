/**
 * Dynamic OG image for /scan-result/[token] — renders a 1200×630 card
 * showing the scan URL, health score, and AccessiScan brand so that
 * Twitter / LinkedIn / Slack previews show a rich card instead of a
 * boring link.
 *
 * Next.js 15 picks this file up by convention and registers it as
 * the page's opengraph-image. The metadata in page.tsx's
 * generateMetadata still applies for description + title.
 */

import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveScanOutcome, displayHealthScore, unmeasuredHeadline } from "@/lib/free-scan/outcome";

export const runtime = "edge";
export const alt = "AccessiScan WCAG compliance scan result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ScanReport {
  url: string;
  outcome?: "ok" | "blocked" | "failed";
  fetched_status?: number | null;
  error?: string;
  health_score: number | null;
  total_issue_count: number;
  issues?: Array<{ severity: string; rule: string; count: number }>;
}

interface ScanRow {
  url: string;
  report: ScanReport;
}

export default async function ScanResultOG({
  params,
}: {
  params: { token: string };
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("public_scan_results")
    .select("url, report")
    .eq("id", params.token)
    .single();

  // Default fallback if the row was deleted / token invalid
  const row = (data as ScanRow | null) ?? {
    url: "your site",
    report: { url: "your site", outcome: "failed" as const, health_score: null, total_issue_count: 0, issues: [] },
  };
  // null = nothing was measured (blocked host, 404, DNS). A social card is the
  // loudest surface we have: a "0/100" preview of a site we never read would
  // travel through Slack and Twitter as a public accusation.
  const score = displayHealthScore(row.report);
  const critical = (row.report.issues ?? []).filter((i) => i.severity === "critical").reduce((s, i) => s + i.count, 0);
  const totalIssues = row.report.total_issue_count;

  // Display the host part of the URL (not the full URL with scheme)
  let displayHost = row.url;
  try {
    displayHost = new URL(row.url).hostname;
  } catch {}

  const tone = score === null ? "unmeasured" : score >= 90 ? "good" : score >= 75 ? "warn" : "bad";
  const scoreColor =
    tone === "good" ? "#15803d" : tone === "warn" ? "#a16207" : "#b91c1c";
  const accent = "#0ea5e9";
  const unmeasuredText = unmeasuredHeadline(deriveScanOutcome(row.report));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: "#94a3b8", fontWeight: 500 }}>
          <span style={{ color: accent }}>●</span> accessiscan · live WCAG 2.1 AA scan
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: -0.5,
            lineHeight: 1.1,
            color: "#fff",
            wordBreak: "break-all",
            display: "flex",
          }}
        >
          {displayHost}
        </div>

        {score === null ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
            <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, display: "flex" }}>
              no result
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, color: "#fbbf24", letterSpacing: -1, display: "flex" }}>
              {unmeasuredText}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: "#94a3b8" }}>
              No score, no issue count — the page was never retrieved.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 56, marginTop: 32 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                wcag score
              </div>
              <div
                style={{
                  fontSize: 160,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: scoreColor,
                  letterSpacing: -4,
                  display: "flex",
                }}
              >
                {score}
                <span style={{ fontSize: 72, color: "#64748b", marginLeft: 8, alignSelf: "flex-end", paddingBottom: 16 }}>/100</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, color: "#f87171", fontWeight: 700 }}>
                {critical} critical
              </div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 22, color: "#94a3b8" }}>
                {totalIssues} total WCAG 2.1 AA violation{totalIssues === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, color: "#94a3b8", display: "flex" }}>
            DOJ Title II → April 2027 · Title III suits keep landing
          </div>
          <div style={{ fontSize: 18, color: accent, fontWeight: 600, display: "flex" }}>
            run yours · accessiscan.piposlab.com/free
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

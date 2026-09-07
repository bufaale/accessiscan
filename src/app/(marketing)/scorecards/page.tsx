/**
 * Public scorecards index — browse every domain AccessiScan has scanned.
 *
 * Why this page exists:
 *   Each scan permalink is currently only discoverable if someone has
 *   the token (operator tweets it, recipient pastes it, etc.). This
 *   page surfaces ALL public scans as a browsable list, turning every
 *   bulk-scan-feed entry into SEO equity for the long-tail query
 *   "<domain> wcag accessibility scan".
 *
 * Sort: most recently scanned first. Filter visually via the score
 * badges (red/amber/green) so visitors can spot under-performers.
 *
 * Indexed by Google via sitemap.ts (each scan permalink also added).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayHealthScore } from "@/lib/free-scan/outcome";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5-min cache for the index

interface ScanReport {
  url: string;
  outcome?: "ok" | "blocked" | "failed";
  fetched_status?: number | null;
  error?: string;
  health_score?: number | null;
  total_issue_count?: number;
  issues?: Array<{ severity?: string }>;
}

interface ScanRow {
  id: string;
  url: string;
  report: ScanReport;
  created_at: string;
  view_count: number;
}

const PAGE_SIZE = 50;

export const metadata: Metadata = {
  title: "Public WCAG scorecards — every site AccessiScan has scanned",
  description:
    "Browse public WCAG 2.1 AA scan results across US gov, edu, and enterprise domains. Each scorecard includes health score, critical violation count, and remediation hints.",
  alternates: { canonical: "/scorecards" },
  openGraph: {
    title: "Public WCAG scorecards · AccessiScan",
    description: "Every site scanned. Sorted newest first. Free to view.",
    type: "website",
  },
};

function scoreBadgeColor(score: number | undefined): {
  bg: string;
  fg: string;
  label: string;
} {
  if (score === undefined || score === null) return { bg: "#f1f5f9", fg: "#64748b", label: "n/a" };
  if (score >= 90) return { bg: "#dcfce7", fg: "#166534", label: "pass" };
  if (score >= 75) return { bg: "#fef3c7", fg: "#92400e", label: "review" };
  return { bg: "#fee2e2", fg: "#991b1b", label: "fail" };
}

export default async function ScorecardsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("public_scan_results")
    .select("id, url, report, created_at, view_count")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  const rows = (data ?? []) as ScanRow[];

  // Dedupe by domain (keep most recent scan per domain) so the index isn't
  // flooded with duplicate entries when bulk-scan-feed re-scans.
  const seenDomains = new Set<string>();
  const deduped: Array<ScanRow & { domain: string; criticalCount: number; score: number }> = [];
  for (const r of rows) {
    let domain = "";
    try {
      domain = new URL(r.url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      continue;
    }
    if (seenDomains.has(domain)) continue;
    // Scans that measured nothing (the host blocked us, or the page was
    // unreachable) are not scorecards. Publishing them here listed the site as
    // "0/100 · fail" on an indexed page purely because its WAF turned us away.
    const score = displayHealthScore(r.report);
    if (score === null) continue;
    seenDomains.add(domain);
    const criticalCount = Array.isArray(r.report?.issues)
      ? r.report.issues.filter((i) => i?.severity === "critical").length
      : 0;
    deduped.push({ ...r, domain, criticalCount, score });
  }

  const stats = {
    total: deduped.length,
    passing: deduped.filter((r) => r.score >= 90).length,
    reviewing: deduped.filter((r) => r.score >= 75 && r.score < 90).length,
    failing: deduped.filter((r) => r.score < 75).length,
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
          PUBLIC SCORECARDS
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">
          Every site we&apos;ve scanned, public.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">
          AccessiScan runs WCAG 2.1 AA compliance scans against US gov, edu,
          and enterprise sites — published here. Each scorecard links to the
          full scan with severity-tagged findings and remediation hints. Run
          your own (no signup):{" "}
          <Link
            href="/free/wcag-scanner"
            className="font-medium text-blue-700 hover:underline"
          >
            free WCAG scanner
          </Link>
          .
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Sites scanned", value: stats.total, tone: "slate" as const },
          { label: "Passing (≥90)", value: stats.passing, tone: "green" as const },
          { label: "Review (75-89)", value: stats.reviewing, tone: "amber" as const },
          { label: "Failing (<75)", value: stats.failing, tone: "red" as const },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-md border p-4 ${
              s.tone === "green"
                ? "border-green-200 bg-green-50"
                : s.tone === "amber"
                  ? "border-amber-200 bg-amber-50"
                  : s.tone === "red"
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-white"
            }`}
          >
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              {s.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {deduped.length === 0 ? (
        <div className="rounded-md border bg-slate-50 p-6 text-sm text-slate-600">
          No public scorecards yet. Run a scan to seed the index.{" "}
          <Link href="/free/wcag-scanner" className="font-medium text-blue-700 hover:underline">
            Free scanner →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Domain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Critical
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Scanned
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {deduped.map((r) => {
                const badge = scoreBadgeColor(r.score);
                const dateStr = new Date(r.created_at).toISOString().slice(0, 10);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      <Link
                        href={`/scan-result/${r.id}`}
                        className="hover:underline"
                      >
                        {r.domain}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className="inline-flex items-center gap-2 rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: badge.bg, color: badge.fg }}
                      >
                        <span>{r.score}/100</span>
                        <span className="uppercase">· {badge.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-slate-700">
                      {r.criticalCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{dateStr}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Link
                        href={`/scan-result/${r.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        scorecard →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-10 border-t pt-6 text-sm text-slate-500">
        Showing the {PAGE_SIZE} most recently scanned domains. Each scan
        runs WCAG 2.1 AA conformance checks against the public homepage.{" "}
        <Link
          href="/pricing"
          className="font-medium text-blue-700 hover:underline"
        >
          AccessiScan plans
        </Link>{" "}
        ship full-site Playwright-based scans, VPAT 2.5 export, and Auto-Fix
        PRs on Business + Team.
      </footer>
    </main>
  );
}

/**
 * GET /api/free/public-scans?limit=50 — list recent public WCAG scans.
 *
 * Powers:
 *   1. Pipo Labs Trust Center cross-portfolio aggregation
 *   2. Pilotdeck enrich-from-scans cron (turns scanned domains into
 *      qualified outreach leads — we already have credibility because
 *      we scanned them, the score is a ready-made personalization hook)
 *
 * Data is already public — every row in public_scan_results renders at
 * /scan-result/[token] without auth. This endpoint is the bulk-list
 * counterpart, behind a tiny rate-limit and CDN cache.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveScanOutcome, displayHealthScore } from "@/lib/free-scan/outcome";

interface ScanReport {
  url: string;
  outcome?: "ok" | "blocked" | "failed";
  fetched_status?: number | null;
  error?: string;
  health_score?: number | null;
  total_issue_count?: number;
  issues?: Array<{ severity?: string }>;
}

interface PublicScanRow {
  id: string;
  url: string;
  report: ScanReport;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? "50");
  const limit = Math.max(1, Math.min(200, Number.isFinite(rawLimit) ? rawLimit : 50));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("public_scan_results")
    .select("id, url, report, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as PublicScanRow[];

  const scans = rows.map((row) => {
    let domain = "";
    try {
      domain = new URL(row.url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      domain = "";
    }
    const issues = Array.isArray(row.report?.issues) ? row.report.issues : [];
    const criticalCount = issues.filter((i) => i?.severity === "critical").length;
    // `outcome` tells consumers whether this row is a real measurement.
    // enrich-from-scans must not turn a blocked scan into a "lead scored 0" —
    // and `health_score` is null rather than 0 for exactly the same reason.
    const outcome = deriveScanOutcome(row.report);
    return {
      token: row.id,
      permalink: `https://accessiscan.piposlab.com/scan-result/${row.id}`,
      url: row.url,
      domain,
      outcome,
      blocked: outcome === "blocked",
      health_score: displayHealthScore(row.report),
      total_issue_count: row.report?.total_issue_count ?? issues.length,
      critical_count: criticalCount,
      created_at: row.created_at,
    };
  });

  return new NextResponse(JSON.stringify({ ok: true, scans }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // 5-min CDN cache + 30-min stale-while-revalidate (data updates slowly)
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    },
  });
}

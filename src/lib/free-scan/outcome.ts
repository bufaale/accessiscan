/**
 * The free scan's honesty contract, in a dependency-free module.
 *
 * Lives apart from lite-scanner.ts on purpose: that file imports `node:dns`
 * (SSRF validation), so it cannot be pulled into a client component or the
 * edge-runtime OG image. Every surface that RENDERS a scan — the scanner form,
 * the public permalink, the OG card, the scorecards index — needs these helpers,
 * so they have to be importable from anywhere.
 */

/**
 * What actually happened to a scan.
 *
 *   "ok"      — we read the page's HTML and analysed it. `health_score` and
 *               `issues` are real measurements.
 *   "blocked" — the host refused an automated request (bot protection / WAF).
 *               Very common on .gov. We measured NOTHING.
 *   "failed"  — the page could not be retrieved at all (404, DNS, timeout,
 *               unsupported redirect). We measured NOTHING.
 *
 * For anything other than "ok" the report carries `health_score: null` and an
 * empty `issues` array — that is "not measured", NOT "a perfect site with a
 * score of zero". Every renderer MUST branch on the outcome before showing a
 * score or an issue count.
 */
export type ScanOutcome = "ok" | "blocked" | "failed";

/**
 * HTTP statuses that mean "this host refuses automated requests", as opposed
 * to "this page is broken". Kept deliberately narrow and in sync with the
 * Pilotdeck bulk-scan-feed cron, which mirrors the same three codes when it
 * classifies a target it could not scan.
 */
export const BLOCKING_HTTP_STATUSES: readonly number[] = [401, 403, 429];

export function isBlockingHttpStatus(status: number | null | undefined): boolean {
  return typeof status === "number" && BLOCKING_HTTP_STATUSES.includes(status);
}

/** The shape every persisted or in-flight report satisfies, as far as we care. */
export interface ScanOutcomeSource {
  outcome?: unknown;
  fetched_status?: number | null;
  error?: string | null;
  health_score?: number | null;
}

/**
 * The outcome of a report that may predate the `outcome` field.
 *
 * `public_scan_results` holds months of rows written before this field
 * existed; those blocked scans were persisted as `health_score: 0`,
 * `issues: []`, `error: "Fetch returned 403"`. Every reader of a persisted
 * report goes through here so old rows render as honestly as new ones.
 */
export function deriveScanOutcome(
  report: ScanOutcomeSource | null | undefined,
): ScanOutcome {
  if (!report) return "failed";
  if (report.outcome === "ok" || report.outcome === "blocked" || report.outcome === "failed") {
    return report.outcome;
  }
  if (isBlockingHttpStatus(report.fetched_status)) return "blocked";
  if (report.error) return "failed";
  if (typeof report.fetched_status === "number" && report.fetched_status >= 400) return "failed";
  return "ok";
}

/**
 * The score to display for a report, or `null` when there is none.
 * Legacy blocked rows carry a stored `health_score: 0` that must not be shown.
 */
export function displayHealthScore(
  report: ScanOutcomeSource | null | undefined,
): number | null {
  if (!report) return null;
  if (deriveScanOutcome(report) !== "ok") return null;
  return typeof report.health_score === "number" ? report.health_score : null;
}

/** Human-readable headline for a scan that measured nothing. */
export function unmeasuredHeadline(outcome: ScanOutcome): string {
  return outcome === "blocked"
    ? "This site blocks automated scanners"
    : "We couldn't reach this page";
}

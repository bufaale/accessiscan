/**
 * Server-side funnel instrumentation for the FREE WCAG scanner.
 *
 * The problem this solves: /api/free/wcag-scan ran a scan and wrote only a
 * `public_scan_results` row, which carries no attribution — so an ad click that
 * RAN a scan looked exactly like a bounce, and a click that ran a scan on a
 * site that BLOCKS us looked exactly like a successful one. Client analytics
 * can't answer either question: ad-blockers eat it. Every completion and email
 * capture now lands in `free_tool_events` with its UTM attribution,
 * server-side, un-blockable.
 *
 * Two hard rules:
 *
 *  1. AGGREGATE ONLY. The event name, the scan outcome, counts, and attribution.
 *     Never an email, never the scanned URL or domain, never issue detail. The
 *     email keeps living in `public_scan_results.email_captured` alone.
 *
 *  2. LOGGING NEVER BREAKS THE USER. The insert is handed to Next's `after()`,
 *     so it runs once the response has already been streamed: it cannot delay
 *     the scan result, and it cannot change the status or body. Everything is
 *     wrapped in try/catch on top of that — a dead database costs us a data
 *     point, not a customer.
 */

import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ScanOutcome } from "@/lib/free-scan/outcome";
import type { Attribution } from "./attribution";

export type FreeToolEvent = "scan_completed" | "email_captured";

export interface FreeToolEventInput {
  readonly event: FreeToolEvent;
  /** Whether the scan actually measured anything. */
  readonly outcome?: ScanOutcome | null;
  readonly attribution?: Attribution;
  readonly referer?: string | null;
  /** 0–100, or null when nothing was measured. Aggregate only. */
  readonly healthScore?: number | null;
  /** Total WCAG occurrences found. Aggregate only. */
  readonly issueCount?: number | null;
  /** Occurrences at severity "critical". Aggregate only. */
  readonly criticalCount?: number | null;
}

const PG_INT_MAX = 2_147_483_647;
const MAX_REFERER_LENGTH = 500;

/** Postgres `integer` is 32-bit — clamp rather than let an insert blow up. */
function toInt(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded > PG_INT_MAX) return PG_INT_MAX;
  if (rounded < 0) return 0;
  return rounded;
}

function toReferer(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_REFERER_LENGTH) : null;
}

/** Occurrences at a given severity, from a report's issue list. */
export function countBySeverity(
  issues: ReadonlyArray<{ severity?: string; count?: number }> | null | undefined,
  severity: string,
): number {
  if (!Array.isArray(issues)) return 0;
  return issues
    .filter((i) => i?.severity === severity)
    .reduce((sum, i) => sum + (typeof i.count === "number" ? i.count : 0), 0);
}

async function insertEvent(input: FreeToolEventInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("free_tool_events").insert({
      event: input.event,
      outcome: input.outcome ?? null,
      // Denormalised so the ads dashboard can filter on it without parsing
      // `outcome` — "did this click get a real measurement?" is THE question.
      blocked: input.outcome === "blocked",
      utm_source: input.attribution?.utm_source ?? null,
      utm_medium: input.attribution?.utm_medium ?? null,
      utm_campaign: input.attribution?.utm_campaign ?? null,
      referer: toReferer(input.referer),
      health_score: toInt(input.healthScore),
      issue_count: toInt(input.issueCount),
      critical_count: toInt(input.criticalCount),
    });
    if (error) {
      console.error("free_tool_events insert failed:", error.message);
    }
  } catch (err) {
    console.error("free_tool_events insert threw:", err);
  }
}

/**
 * Fire-and-forget. Returns immediately; the write happens after the response.
 *
 * Safe to call from anywhere, including outside a request scope (unit tests) —
 * `after()` throws there, and we swallow it: a dropped data point is always
 * cheaper than a broken scanner.
 */
export function logFreeToolEvent(input: FreeToolEventInput): void {
  try {
    after(() => insertEvent(input));
  } catch {
    // No request scope (tests, or a runtime without `after`). Nothing to do —
    // instrumentation must never surface an error to the caller.
  }
}

/**
 * Ad attribution for the free WCAG scanner — shared by the client (which reads
 * the UTM params off the landing URL) and the API routes (which validate them
 * before writing a funnel event).
 *
 * These values arrive from a query string a stranger controls, so they are
 * UNTRUSTED: every field is Zod-validated, trimmed and length-capped here
 * before it can reach the database.
 *
 * Deliberate design choice: attribution NEVER makes a request fail. A malformed
 * or oversized utm_* is dropped, not 400'd — measurement must not be able to
 * break the product it measures.
 */

import { z } from "zod";

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];

/** Only ever the three UTM fields — no click ids, no fingerprints, no PII. */
export type Attribution = Partial<Record<AttributionKey, string>>;

/** One attribution field: a short, trimmed, optional string. */
export const attributionFieldSchema = z.string().trim().max(64).optional();

/** The full attribution object, for callers that want a single schema. */
export const attributionSchema = z.object({
  utm_source: attributionFieldSchema,
  utm_medium: attributionFieldSchema,
  utm_campaign: attributionFieldSchema,
});

/**
 * Pull attribution out of an arbitrary parsed JSON body (or any record).
 *
 * Validated per-field so one bad value doesn't discard the other two, and so a
 * client that sends nothing simply yields `{}`. Empty strings are dropped —
 * `?utm_source=` should read as "absent", not as a blank campaign.
 */
export function parseAttribution(input: unknown): Attribution {
  if (typeof input !== "object" || input === null) return {};
  const record = input as Record<string, unknown>;

  const attribution: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const parsed = attributionFieldSchema.safeParse(record[key]);
    if (parsed.success && parsed.data) attribution[key] = parsed.data;
  }
  return attribution;
}

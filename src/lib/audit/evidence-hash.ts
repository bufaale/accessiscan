import { createHash } from "node:crypto";
import type { WcagFreeIssue } from "@/lib/free-scan/lite-scanner";

/**
 * Deterministic JSON canonicalization (sorted keys at every level, undefined
 * dropped, null preserved) so the SHA-256 of a violations array is stable
 * regardless of property insertion order.
 *
 * Algorithm copied verbatim from @piposlabs/praxa-verify v0.2.0 (MIT) — kept in
 * sync manually. We do NOT import the package: it is a published Node CLI and is
 * not a dependency of this Next.js app.
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "object" || Array.isArray(v)) return v;
    const sortedKeys = Object.keys(v as Record<string, unknown>).sort();
    const out: Record<string, unknown> = {};
    for (const k of sortedKeys) {
      const inner = (v as Record<string, unknown>)[k];
      if (inner !== undefined) out[k] = inner;
    }
    return out;
  });
}

/** Engine identifier stamped into every baseline so the hash is reproducible. */
export const SCANNER_ENGINE_VERSION = "accessiscan-lite/1.0";

/** SHA-256 hex of the canonicalized violations array. The legal fingerprint. */
export function hashViolations(issues: WcagFreeIssue[]): string {
  return createHash("sha256").update(canonicalize(issues), "utf8").digest("hex");
}

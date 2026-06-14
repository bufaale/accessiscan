import { scanUrlDeep } from "@/lib/audit/deep-scanner";
import type { WcagFreeIssue } from "@/lib/free-scan/lite-scanner";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBaselineFull } from "@/lib/audit/baseline-store";
import { hashViolations } from "@/lib/audit/evidence-hash";

export interface RescanResult {
  baseline: { scannedAt: string; hash: string; issueCount: number };
  rescan: { rescannedAt: string; hash: string; score: number; issueCount: number };
  diff: { resolved: WcagFreeIssue[]; stillOpen: WcagFreeIssue[]; newIssues: WcagFreeIssue[] };
}

const count = (issues: WcagFreeIssue[]) => issues.reduce((a, i) => a + (i.count || 1), 0);

/**
 * Re-scan the audited URL and diff against the immutable baseline (by WCAG rule).
 * Token-gated via getBaselineFull. Persists an insert-only audit_rescans record
 * (the dated before/after artifact). Returns null if token/baseline invalid.
 */
export async function runRescan(auditId: string, token: string): Promise<RescanResult | null> {
  const baseline = await getBaselineFull(auditId, token);
  if (!baseline) return null;

  // Must use the SAME engine as the baseline (deep axe) so the diff is real.
  const report = await scanUrlDeep(baseline.targetUrl);
  const newIssuesAll = [...(report.issues ?? [])];
  const baseRules = new Set(baseline.issues.map((i) => i.rule));
  const newRules = new Set(newIssuesAll.map((i) => i.rule));

  const resolved = baseline.issues.filter((i) => !newRules.has(i.rule));
  const stillOpen = baseline.issues.filter((i) => newRules.has(i.rule));
  const newIssues = newIssuesAll.filter((i) => !baseRules.has(i.rule));

  const rescannedAt = new Date().toISOString();
  const newHash = hashViolations(newIssuesAll);
  const newScore = report.health_score ?? 0;
  const diff = { resolved, stillOpen, newIssues };

  try {
    const db = createAdminClient();
    await db.from("audit_rescans").insert({
      paid_audit_id: auditId,
      baseline_audit_uuid: auditId,
      rescanned_at: rescannedAt,
      new_score: newScore,
      new_hash: newHash,
      resolved_count: resolved.length,
      still_open_count: stillOpen.length,
      new_issues_count: newIssues.length,
      diff_json: diff,
    });
  } catch (e) {
    console.error("[rescan] persist failed", e);
    // Non-fatal: still return the comparison to the buyer.
  }

  return {
    baseline: { scannedAt: baseline.scannedAt, hash: baseline.violationsHash, issueCount: count(baseline.issues) },
    rescan: { rescannedAt, hash: newHash, score: newScore, issueCount: count(newIssuesAll) },
    diff,
  };
}

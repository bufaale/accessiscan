import { createAdminClient } from "@/lib/supabase/admin";
import type { WcagFreeIssue } from "@/lib/free-scan/lite-scanner";
import { hashViolations, SCANNER_ENGINE_VERSION } from "@/lib/audit/evidence-hash";

export interface BaselineRecord {
  auditUuid: string;
  targetUrl: string;
  scannedAt: string;
  engineVersion: string;
  violationsHash: string;
}

/**
 * Persist an immutable, hash-signed baseline for a completed paid audit and
 * return the record (or null on failure — callers must treat this as best-effort
 * and never let a failure block fulfilment).
 */
export async function insertBaseline(args: {
  paidAuditId: string; // = paid_audits.id, also used as the public audit_uuid slug
  targetUrl: string;
  scannedAt: string;
  issues: WcagFreeIssue[];
}): Promise<{ baselineId: string; record: BaselineRecord } | null> {
  try {
    const db = createAdminClient();
    const hash = hashViolations(args.issues);
    const { data, error } = await db
      .from("audit_baselines")
      .insert({
        paid_audit_id: args.paidAuditId,
        audit_uuid: args.paidAuditId,
        target_url: args.targetUrl,
        scanned_at: args.scannedAt,
        engine_version: SCANNER_ENGINE_VERSION,
        violations_json: args.issues,
        violations_hash: hash,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[baseline-store] insert failed", error);
      return null;
    }
    return {
      baselineId: (data as { id: string }).id,
      record: {
        auditUuid: args.paidAuditId,
        targetUrl: args.targetUrl,
        scannedAt: args.scannedAt,
        engineVersion: SCANNER_ENGINE_VERSION,
        violationsHash: hash,
      },
    };
  } catch (e) {
    console.error("[baseline-store] insert threw", e);
    return null;
  }
}

export interface FullBaseline extends BaselineRecord {
  issues: import("@/lib/free-scan/lite-scanner").WcagFreeIssue[];
}

/**
 * Token-gated full baseline read (includes violation detail) for the buyer's
 * downloadable Evidence Pack page. Validates the random access token against
 * paid_audits.evidence_token before returning anything.
 */
export async function getBaselineFull(auditUuid: string, token: string): Promise<FullBaseline | null> {
  if (!token) return null;
  try {
    const db = createAdminClient();
    const { data: paid } = await db
      .from("paid_audits")
      .select("evidence_token")
      .eq("id", auditUuid)
      .single();
    const expected = (paid as { evidence_token?: string } | null)?.evidence_token;
    if (!expected || expected !== token) return null;
    const { data, error } = await db
      .from("audit_baselines")
      .select("audit_uuid, target_url, scanned_at, engine_version, violations_hash, violations_json")
      .eq("audit_uuid", auditUuid)
      .single();
    if (error || !data) return null;
    const row = data as {
      audit_uuid: string;
      target_url: string;
      scanned_at: string;
      engine_version: string;
      violations_hash: string;
      violations_json: import("@/lib/free-scan/lite-scanner").WcagFreeIssue[];
    };
    return {
      auditUuid: row.audit_uuid,
      targetUrl: row.target_url,
      scannedAt: row.scanned_at,
      engineVersion: row.engine_version,
      violationsHash: row.violations_hash,
      issues: Array.isArray(row.violations_json) ? row.violations_json : [],
    };
  } catch {
    return null;
  }
}

/** Public-safe baseline lookup (no violation detail) for the /verify page. */
export async function getBaselinePublic(auditUuid: string): Promise<BaselineRecord | null> {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("audit_baselines_public")
      .select("audit_uuid, target_url, scanned_at, engine_version, violations_hash")
      .eq("audit_uuid", auditUuid)
      .single();
    if (error || !data) return null;
    const row = data as {
      audit_uuid: string;
      target_url: string;
      scanned_at: string;
      engine_version: string;
      violations_hash: string;
    };
    return {
      auditUuid: row.audit_uuid,
      targetUrl: row.target_url,
      scannedAt: row.scanned_at,
      engineVersion: row.engine_version,
      violationsHash: row.violations_hash,
    };
  } catch {
    return null;
  }
}

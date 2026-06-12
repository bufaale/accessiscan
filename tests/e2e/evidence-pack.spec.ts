/**
 * E2E for the Legal Evidence Pack (shipped 2026-06-12).
 *
 * The un-promptable differentiator: every paid audit persists an immutable,
 * SHA-256 hash-signed, timestamped baseline, publicly verifiable at /verify/[id].
 * These specs verify the public verification surface renders the record, makes
 * NO banned compliance claim, and degrades cleanly for an unknown id. The full
 * scan->baseline->email path runs in the Stripe webhook (covered by the
 * baseline-store + hash unit behavior + a manual test-mode run, not here).
 */

import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com";
const TEST_ID = "00000000-0000-4000-8000-0000000000bb";
const TEST_HASH = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

test.describe("Legal Evidence Pack — /verify", () => {
  test.beforeAll(async () => {
    const db = admin();
    await db.from("paid_audits").upsert(
      { id: TEST_ID, email: "e2e@piposlab.com", target_url: "https://e2e-shop.test", stripe_session_id: "cs_test_e2e_evidence", status: "delivered" },
      { onConflict: "id" },
    );
    await db.from("audit_baselines").upsert(
      {
        paid_audit_id: TEST_ID,
        audit_uuid: TEST_ID,
        target_url: "https://e2e-shop.test",
        scanned_at: new Date().toISOString(),
        engine_version: "accessiscan-lite/1.0",
        violations_json: [],
        violations_hash: TEST_HASH,
      },
      { onConflict: "audit_uuid" },
    );
  });

  test.afterAll(async () => {
    const db = admin();
    await db.from("audit_baselines").delete().eq("audit_uuid", TEST_ID);
    await db.from("paid_audits").delete().eq("id", TEST_ID);
  });

  test("renders the verifiable baseline record (hash, url, date, disclaimer)", async ({ page }) => {
    await page.goto(`${BASE}/verify/${TEST_ID}`);
    await expect(page.getByText("BASELINE ESTABLISHED")).toBeVisible();
    await expect(page.getByText(TEST_HASH, { exact: false })).toBeVisible();
    await expect(page.getByText("e2e-shop.test", { exact: false })).toBeVisible();
    await expect(page.getByText(/does not confirm that the audited website meets WCAG/i)).toBeVisible();
  });

  test("makes NO banned compliance claim (FTC accessiBe guard)", async ({ page }) => {
    await page.goto(`${BASE}/verify/${TEST_ID}`);
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const banned of ["ada compliant", "wcag compliant", "lawsuit-proof", "lawsuit proof", "certified compliant", "fully compliant", "guarantees compliance"]) {
      expect(body, `must not contain "${banned}"`).not.toContain(banned);
    }
  });

  test("unknown audit id shows not-found, not a server error", async ({ page }) => {
    const res = await page.goto(`${BASE}/verify/00000000-0000-4000-8000-0000deadbeef`);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});

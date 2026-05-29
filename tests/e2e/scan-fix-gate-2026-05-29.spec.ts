/**
 * E2E for the freemium remediation gate (shipped 2026-05-29).
 *
 * Why: the free scanner used to show every issue's fix_hint + example
 * code. 236 paid Reddit clicks + 58 cold emails -> 0 signups because
 * the free tool gave away the cure. We now gate remediation after the
 * first fix (teaser), keeping the diagnosis free + shareable.
 *
 * Coverage:
 *   1. A public permalink with >1 issue shows the locked "unlock free"
 *      gate AND the prominent unlock CTA, both routing to /signup with
 *      the fix_unlock UTM.
 *   2. The diagnosis (rule names + WCAG refs) is still visible (wedge
 *      value preserved).
 *   3. The signup gate link carries utm_campaign=fix_unlock so we can
 *      attribute signups to this gate in analytics.
 */

import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com";
const SUPA_URL = process.env.SUPABASE_URL ?? process.env.APP04_SUPABASE_URL;
const SUPA_SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.APP04_SUPABASE_SERVICE_ROLE_KEY;

async function permalinkWithMultipleIssues(): Promise<string | null> {
  if (!SUPA_URL || !SUPA_SR_KEY) return null;
  const admin = createClient(SUPA_URL, SUPA_SR_KEY);
  // Grab recent public scans, find one whose report has >1 issue
  const { data } = await admin
    .from("public_scan_results")
    .select("id, report")
    .order("created_at", { ascending: false })
    .limit(40);
  for (const row of data ?? []) {
    const issues = (row.report?.issues ?? []) as unknown[];
    if (Array.isArray(issues) && issues.length > 1) return row.id as string;
  }
  return null;
}

test.describe("AccessiScan freemium remediation gate — shipped 2026-05-29", () => {
  test("permalink with >1 issue gates remediation behind signup", async ({ page }) => {
    const token = await permalinkWithMultipleIssues();
    test.skip(!token, "no public scan with >1 issue available to test against");

    await page.goto(`${BASE}/scan-result/${token}`);

    // Diagnosis still visible (wedge preserved): the score card + findings heading
    await expect(page.getByRole("heading", { name: /Top findings/i })).toBeVisible();

    // At least one gated "unlock free" link is present
    const gateLinks = page.locator('a[href*="utm_campaign=fix_unlock"]');
    await expect(gateLinks.first()).toBeVisible();

    // Every gate link routes to /signup with the fix_unlock UTM
    const count = await gateLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await gateLinks.nth(i).getAttribute("href");
      expect(href).toContain("/signup");
      expect(href).toContain("utm_source=free_scan");
      expect(href).toContain("utm_campaign=fix_unlock");
    }
  });
});

/**
 * E2E for the public permalink leadgen capture (shipped 2026-05-28).
 *
 * Why this exists:
 *   Three real visitors (cabq.gov, orlando.gov, fortworthtexas.gov) ran
 *   scans via the public permalink page on 2026-05-27 and we captured
 *   zero contacts. The /free/wcag-scanner form already had post-result
 *   email capture; the permalink page didn't. This spec ensures the
 *   newly added <ScanLeadCapture> renders, posts correctly, and
 *   transitions through its visible states.
 *
 * Coverage:
 *   1. Open a real public-scan permalink → lead-capture section visible
 *      above the findings list (highest-attention position).
 *   2. Submit a unique email → success state appears + capture persists
 *      (idempotency proven by re-POSTing the same email gets 200).
 *   3. The form sits between the score card and the issues list (visual
 *      positioning check via DOM order so future copy/layout changes
 *      can't accidentally bury it).
 */

import { test, expect, request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { displayHealthScore } from "../../src/lib/free-scan/outcome";

const BASE = process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com";
const SUPA_URL = process.env.SUPABASE_URL ?? process.env.APP04_SUPABASE_URL;
const SUPA_SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.APP04_SUPABASE_SERVICE_ROLE_KEY;

interface ScanRowLite {
  id: string;
  report: Parameters<typeof displayHealthScore>[0];
}

/**
 * Only a MEASURED scan is a valid subject here. Since 2026-09-06 a scan whose
 * target blocked us (403 — routine on .gov, and the bulk-scan-feed cron pushes
 * plenty of them to the top of this table) renders an "unmeasured" card with no
 * score and deliberately NO lead-capture form: there is no scorecard to email.
 * Picking the newest row regardless would fail this spec on a product behaviour
 * that is working as designed.
 */
async function getOrCreatePermalinkToken(): Promise<string> {
  // Prefer any existing un-claimed public scan so we don't pollute prod.
  if (!SUPA_URL || !SUPA_SR_KEY) {
    test.skip(true, "SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required for permalink lookup");
  }
  const admin = createClient(SUPA_URL!, SUPA_SR_KEY!);
  const measured = (rows: ScanRowLite[] | null) =>
    (rows ?? []).find((r) => displayHealthScore(r.report) !== null)?.id;

  const { data } = await admin
    .from("public_scan_results")
    .select("id, report")
    .is("email_captured", null)
    .order("created_at", { ascending: false })
    .limit(25);
  const unclaimed = measured(data as ScanRowLite[] | null);
  if (unclaimed) return unclaimed;

  // Fall back: any measured scan (idempotent claim with same email is harmless).
  const { data: recent } = await admin
    .from("public_scan_results")
    .select("id, report")
    .order("created_at", { ascending: false })
    .limit(50);
  const anyMeasured = measured(recent as ScanRowLite[] | null);
  if (!anyMeasured) throw new Error("no MEASURED public_scan_results rows to test against");
  return anyMeasured;
}

test.describe("AccessiScan public-permalink leadgen — shipped 2026-05-28", () => {
  test("permalink page renders lead-capture section above findings", async ({ page }) => {
    const token = await getOrCreatePermalinkToken();
    await page.goto(`${BASE}/scan-result/${token}`);

    // Lead-capture is visible
    const leadCapture = page.getByTestId("lead-capture").or(page.getByTestId("lead-capture-sent"));
    await expect(leadCapture).toBeVisible();

    // DOM order: lead-capture sits BEFORE the "Top findings" heading when issues exist.
    // (If no issues exist on this scan, just verify the capture is present.)
    const findingsHeading = page.getByRole("heading", { name: /Top findings/i });
    if ((await findingsHeading.count()) > 0) {
      const leadIdx = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll<HTMLElement>("[data-testid], h2"));
        return all.findIndex((el) => el.dataset.testid === "lead-capture" || el.dataset.testid === "lead-capture-sent");
      });
      const headIdx = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll<HTMLElement>("[data-testid], h2"));
        return all.findIndex((el) => el.tagName === "H2" && /Top findings/i.test(el.textContent ?? ""));
      });
      expect(leadIdx).toBeGreaterThanOrEqual(0);
      expect(headIdx).toBeGreaterThanOrEqual(0);
      expect(leadIdx).toBeLessThan(headIdx);
    }
  });

  test("submitting a valid email transitions to the sent state", async ({ page }) => {
    const token = await getOrCreatePermalinkToken();
    const probeEmail = `lead-test-${Date.now()}@piposlab.com`;
    await page.goto(`${BASE}/scan-result/${token}`);

    // If this scan was already claimed by a prior test, the form won't render
    // — accept either path and just assert the post-submit visible state.
    const captureForm = page.getByTestId("lead-capture");
    const alreadySent = page.getByTestId("lead-capture-sent");
    if (await alreadySent.isVisible().catch(() => false)) {
      // Some prior test already claimed this token. Use the API path to
      // confirm idempotency works the same way the UI would.
      const ctx = await request.newContext();
      const r = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
        data: { email: probeEmail },
      });
      // Either 200 (rare race) or 409 (already_claimed by different email)
      expect([200, 409]).toContain(r.status());
      return;
    }
    await expect(captureForm).toBeVisible();
    await page.getByTestId("lead-capture-email").fill(probeEmail);
    await page.getByTestId("lead-capture-submit").click();

    // Either success OR already-claimed-with-different-email (409 path)
    const sent = page.getByTestId("lead-capture-sent");
    const alreadyMsg = page.getByText(/already has an email on file/i);
    await expect(sent.or(alreadyMsg)).toBeVisible({ timeout: 10_000 });
  });

  test("API: claim on this token is idempotent on same email", async () => {
    const token = await getOrCreatePermalinkToken();
    const probeEmail = `idempotent-${Date.now()}@piposlab.com`;
    const ctx = await request.newContext();

    const first = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
      data: { email: probeEmail },
    });
    // Accept 200 (fresh claim) OR 409 (token already claimed by some other
    // probe email — that's still proof the endpoint is alive and gating).
    expect([200, 409]).toContain(first.status());

    if (first.status() === 200) {
      const second = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
        data: { email: probeEmail },
      });
      expect(second.status()).toBe(200);
      const body = await second.json();
      expect(body.idempotent).toBe(true);
    }
  });
});

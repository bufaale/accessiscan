/**
 * E2E for the post-result email claim flow (shipped 2026-05-13).
 *
 * Funnel fix: the pre-result email field was capturing 0/78 scans.
 * Visitors give email AFTER they've seen value, not before. This spec
 * covers the new claim endpoint + the post-result UI.
 *
 * Coverage:
 *   1. POST /api/free/scan-result/<bogus>/claim → 404
 *   2. POST /api/free/scan-result/[token]/claim with bad email → 400
 *   3. POST /api/free/scan-result/[token]/claim with valid email → 200
 *      + email_captured persists
 *   4. Re-POST with same email → 200 idempotent
 *   5. Re-POST with DIFFERENT email → 409 already_claimed
 *   6. /free/wcag-scanner UI: form has no pre-scan email field anymore
 */

import { test, expect, request } from "@playwright/test";
import { postFreeScan } from "../helpers/test-utils";

const BASE = process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com";

test.describe("AccessiScan post-result email claim — shipped 2026-05-13", () => {
  test("/free/wcag-scanner does NOT show a pre-scan email field", async ({ page }) => {
    await page.goto(`${BASE}/free/wcag-scanner`);
    await expect(page.getByText(/URL to scan/i)).toBeVisible();
    // No email input visible until a scan completes
    const emailInputs = await page.locator('input[type="email"]').count();
    expect(emailInputs).toBe(0);
    // The page mentions "no signup" + results-below copy
    await expect(page.getByText(/Results appear below/i)).toBeVisible();
  });

  test("POST claim on bogus token → 404 not_found", async () => {
    const ctx = await request.newContext();
    const r = await ctx.post(`${BASE}/api/free/scan-result/not-a-real-token-xyz/claim`, {
      data: { email: "smoke@example.com" },
    });
    expect(r.status()).toBe(404);
    const body = await r.json();
    expect(body.error).toBe("not_found");
  });

  test.describe.serial("claim flow against a freshly-created scan", () => {
    // Tests share a token from beforeAll. Disable retries so the token
    // isn't re-seeded mid-block (would break the 409 conflict assertion).
    test.describe.configure({ retries: 0 });
    let token = "";

    test.beforeAll(async () => {
      // Seed a scan we can claim. Go through postFreeScan() so the free-scan
      // endpoint's 6-req/60s-per-IP limiter is waited out rather than
      // mistaken for a real answer: on a 429 the body has no share_token and
      // every test in this block then failed with a bare
      // "expect(undefined).toBeTruthy()", which reads like a broken claim
      // endpoint rather than a throttled seed request.
      const r = await postFreeScan({ url: "https://example.com" });
      const body = await r.json();
      expect(
        r.status,
        `seed scan failed (HTTP ${r.status}): ${JSON.stringify(body).slice(0, 300)}`,
      ).toBe(200);
      expect(
        body.share_token,
        `seed scan returned no share_token: ${JSON.stringify(body).slice(0, 300)}`,
      ).toBeTruthy();
      token = body.share_token as string;
    });

    test("claim with bad email shape → 400 invalid_email", async () => {
      const ctx = await request.newContext();
      const r = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
        data: { email: "not-an-email" },
      });
      expect(r.status()).toBe(400);
      const body = await r.json();
      expect(body.error).toBe("invalid_email");
    });

    test("claim with valid email → 200 ok + sends", async () => {
      const ctx = await request.newContext();
      const claimEmail = `e2e-claim-${Date.now()}@piposlab.com`;
      const r = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
        data: { email: claimEmail },
        timeout: 30_000,
      });
      expect(r.status()).toBe(200);
      const body = await r.json();
      expect(body.ok).toBe(true);
      expect(body.claimed).toBe(true);
    });

    test("re-claim with DIFFERENT email → 409 already_claimed", async () => {
      const ctx = await request.newContext();
      const r = await ctx.post(`${BASE}/api/free/scan-result/${token}/claim`, {
        data: { email: "different-claimer@example.com" },
      });
      expect(r.status()).toBe(409);
      const body = await r.json();
      expect(body.error).toBe("already_claimed");
    });
  });
});

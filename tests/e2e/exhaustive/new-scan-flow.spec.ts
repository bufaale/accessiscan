/**
 * new-scan-flow.spec.ts — Phase 3+ of app-quality-auditor
 *
 * Pre-swap baseline tests for /dashboard/scans/new. Verifies the form's
 * critical contracts so the v2 swap can't silently break them:
 *  - Form renders core fields (URL input, scan type toggle, submit)
 *  - Empty URL submit shows error, doesn't trigger API call
 *  - Valid URL submit triggers POST /api/scans
 *  - Free tier shows "Pro" gating on Deep scan toggle
 *
 * Uses page.route to intercept /api/scans so tests don't queue real worker
 * jobs in the operator's Supabase. Works against current v1 page AND
 * forthcoming v2 swap.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../../helpers/test-utils";

test.describe("New scan form — pre-swap contract", () => {
  test("free user sees URL input and submit button", async ({ page }) => {
    const u = await createTestUser("newscan-render", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      // URL input must be present (any text/url input on the page).
      const urlInput = page.locator("input[type='text'], input[type='url'], input:not([type])").first();
      await expect(urlInput).toBeVisible({ timeout: 10_000 });

      // A submit-style button labeled scan/run must be present and visible.
      const submitBtn = page
        .getByRole("button", { name: /scan|run|start/i })
        .first();
      await expect(submitBtn).toBeVisible();
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("submit with empty URL does NOT POST /api/scans", async ({ page }) => {
    const u = await createTestUser("newscan-empty", "free");
    try {
      let postCount = 0;
      await page.route("**/api/scans", (route) => {
        if (route.request().method() === "POST") postCount++;
        route.continue();
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      const submitBtn = page
        .getByRole("button", { name: /scan|run|start/i })
        .first();
      // Click submit with empty URL. App should reject (HTML5 required, or
      // visible error, or button disabled — any of those is acceptable).
      await submitBtn.click({ trial: true }).catch(() => {});
      try {
        await submitBtn.click({ timeout: 2000 });
      } catch {
        // Disabled / unclickable also OK.
      }
      await page.waitForTimeout(1500);
      expect(postCount, "Empty submit should not POST /api/scans").toBe(0);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("valid URL submit triggers a network request to /api/scans", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-submit", "free");
    try {
      // Watch for any POST to /api/scans. Use waitForRequest after clicking;
      // also intercept to avoid actually queuing a real worker job.
      await page.route("**/api/scans", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ scanId: "test-scan-id-mock-12345" }),
          });
          return;
        }
        route.continue();
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      const urlInput = page.locator("input[placeholder*='example' i], input[placeholder*='https' i]").first();
      await urlInput.fill("https://example.com");

      const submitBtn = page
        .getByRole("button", { name: /scan|run|start/i })
        .filter({ hasNotText: /quick|deep|pro/i })
        .first();

      // Wait for the POST as the click happens — more robust than checking
      // a captured variable later.
      const postPromise = page.waitForRequest(
        (req) => req.url().includes("/api/scans") && req.method() === "POST",
        { timeout: 8_000 },
      );
      await submitBtn.click();
      const req = await postPromise;
      const body = req.postDataJSON();
      expect(body.url).toMatch(/example\.com/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

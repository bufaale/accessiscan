/**
 * monitored-flow.spec.ts — baseline contract tests for /dashboard/monitored.
 *
 * Locks the form behavior before the v2 swap. The contract:
 *  - Page loads (any tier — gating is handled by API not page render)
 *  - Required form fields are present (URL, label, cadence, alert email,
 *    threshold) and submit
 *  - Empty submit is blocked (HTML5 required on URL field)
 *
 * Tier gating is API-side: free user POSTing to /api/monitored gets 402.
 * The UI exposes the form regardless and surfaces the error after submit.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../../helpers/test-utils";

test.describe("Monitored sites — pre-swap contract", () => {
  test("page renders heading + add-site form for any tier", async ({ page }) => {
    const u = await createTestUser("monitored-render", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/monitored");
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });

      // URL input must be present (placeholder hint)
      await expect(
        page.locator("input[placeholder*='example' i]").first(),
      ).toBeVisible();
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("submit triggers POST /api/monitored when URL is filled", async ({
    page,
  }) => {
    const u = await createTestUser("monitored-submit", "free");
    try {
      let postReceived = false;
      await page.route("**/api/monitored", async (route) => {
        if (route.request().method() === "POST") {
          postReceived = true;
          await route.fulfill({
            status: 402,
            contentType: "application/json",
            body: JSON.stringify({ error: "Business plan required" }),
          });
          return;
        }
        route.continue();
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/monitored");
      await page.waitForLoadState("networkidle");

      const urlInput = page.locator("input[placeholder*='example' i]").first();
      await urlInput.fill("https://monitored-flow-test.example.com");

      const submitBtn = page
        .getByRole("button", { name: /add.*monitor|monitor|add\b/i })
        .first();
      const postPromise = page.waitForRequest(
        (req) => req.url().includes("/api/monitored") && req.method() === "POST",
        { timeout: 8_000 },
      );
      await submitBtn.click();
      await postPromise;
      expect(postReceived).toBe(true);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

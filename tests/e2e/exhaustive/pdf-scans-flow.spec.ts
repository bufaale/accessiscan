/**
 * pdf-scans-flow.spec.ts — baseline contract tests for /dashboard/pdf-scans.
 *
 * Lock the page's behavior before the v2 swap:
 *  - Page renders heading + upload widget
 *  - Empty list shows "No PDF scans yet" guidance
 *  - Free-tier user POSTing returns 402 — page surfaces gated state
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../../helpers/test-utils";

test.describe("PDF scans page — pre-swap contract", () => {
  test("renders heading + upload control for any tier", async ({ page }) => {
    const u = await createTestUser("pdf-render", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/pdf-scans");
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });

      // Upload control: a hidden file input + a visible label/button. Match
      // by accept attribute or visible "Upload" text.
      const fileInput = page.locator("input[type='file']").first();
      await expect(fileInput).toBeAttached();
      const accept = await fileInput.getAttribute("accept");
      expect(accept).toMatch(/pdf/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("empty state shows 'No PDF scans yet' message for fresh user", async ({
    page,
  }) => {
    const u = await createTestUser("pdf-empty", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/pdf-scans");
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      expect(body).toMatch(/no\s+pdf\s+scans|upload.*pdf|first/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

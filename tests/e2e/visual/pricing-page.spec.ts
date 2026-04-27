/**
 * pricing-page.spec.ts — visual regression for the standalone /pricing page
 * (5-tier comparison, monthly/annual toggle, procurement FAQ).
 */
import { test, expect } from "@playwright/test";

test.describe("Pricing standalone — visual regression", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("/pricing — full page snapshot", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("pricing-full.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

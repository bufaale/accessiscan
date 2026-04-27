/**
 * landing.spec.ts — visual regression baseline for the landing page.
 *
 * Captures full-page + key sections. The countdown banner has dynamic copy
 * (changes daily) so we mask the days digit; everything else is static and
 * a regression is a real regression.
 *
 * Update workflow when intentional design change ships:
 *   npx playwright test tests/e2e/visual/landing.spec.ts --update-snapshots
 *
 * Then commit the new baseline PNGs alongside the design change.
 */
import { test, expect } from "@playwright/test";

test.describe("Landing — visual regression", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("full landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Mask the live countdown — its content changes every page load.
    await expect(page).toHaveScreenshot("landing-full.png", {
      fullPage: true,
      animations: "disabled",
      mask: [page.getByText(/Days/i).first()],
      maxDiffPixelRatio: 0.02,
    });
  });

  test("pricing section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const pricing = page.locator("#pricing");
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing).toHaveScreenshot("landing-pricing.png", {
      animations: "disabled",
    });
  });

  test("comparison section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const comparison = page.locator("#comparison");
    await comparison.scrollIntoViewIfNeeded();
    await expect(comparison).toHaveScreenshot("landing-comparison.png", {
      animations: "disabled",
    });
  });
});

/**
 * auth-pages.spec.ts — visual regression for /login, /signup, /forgot-password.
 * AuthShell is the shared component, so a regression in any of these is
 * usually a regression in all three.
 */
import { test, expect } from "@playwright/test";

test.describe("Auth pages — visual regression", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const route of ["/login", "/signup", "/forgot-password"] as const) {
    test(`${route} — full page snapshot`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const snapName = `auth${route.replace(/\//g, "-")}.png`;
      await expect(page).toHaveScreenshot(snapName, {
        fullPage: true,
        animations: "disabled",
        // Forgot-password page renders a live countdown to the DOJ deadline.
        mask: [page.getByText(/Days/i).first()],
      });
    });
  }
});

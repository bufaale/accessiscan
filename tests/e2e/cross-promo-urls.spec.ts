import { test, expect } from "@playwright/test";
import { CROSS_PROMO_OTHER_APPS, PIPO_LABS_URLS } from "@/config/cross-promo";

/**
 * Bug #6 regression test: cross-promo footer links must point to production
 * domains, not Vercel preview URLs (app-XX-name.vercel.app).
 */

test.describe("Cross-promo URLs use prod domains", () => {
  test("CROSS_PROMO_OTHER_APPS contains no vercel.app URLs", () => {
    for (const app of CROSS_PROMO_OTHER_APPS) {
      expect(app.href).not.toContain("vercel.app");
      expect(app.href).toMatch(/^https:\/\/[a-z0-9.-]+(\.com|\.app|\.us|\.io)\/?/);
    }
  });

  test("PIPO_LABS_URLS canonical map has all 4 apps", () => {
    expect(PIPO_LABS_URLS.portfolio).toBe("https://piposlab.com");
    expect(PIPO_LABS_URLS.accessiscan).toBe("https://accessiscan.app");
    expect(PIPO_LABS_URLS.callspark).toBe("https://callspark.app");
    expect(PIPO_LABS_URLS.aicomply).toBe("https://aicomply.us");
  });

  test("AccessiScan footer (this app) does NOT cross-promote itself", () => {
    for (const app of CROSS_PROMO_OTHER_APPS) {
      expect(app.href).not.toBe(PIPO_LABS_URLS.accessiscan);
    }
  });

  test("rendered landing footer does NOT contain vercel.app URLs", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).not.toMatch(/href="https:\/\/app-\d+-[a-z-]+\.vercel\.app/);
  });
});

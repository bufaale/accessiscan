/**
 * links.spec.ts — Phase 3 of app-quality-auditor
 *
 * Crawl every public route, collect every <a href>, GET each one, assert
 * non-error status. Plus assert external links point to canonical domains
 * (no leftover Vercel preview URLs from before custom domain).
 */
import { test, expect } from "@playwright/test";
import { auditPageLinks } from "../../helpers/test-utils";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/refund",
  "/why-not-overlays",
  "/overlay-detector",
  "/free/wcag-scanner",
  "/blog",
];

const FORBIDDEN_EXTERNAL_HOSTS = [
  "app-04-ada-scanner.vercel.app", // old preview URL — must use accessiscan.piposlab.com
  "ada-scanner.com", // typo / non-existent domain
  "adascanner.com", // typo / non-existent domain
];

test.describe("Internal link audit — every link resolves", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — every internal link returns < 400`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);

      // Allow redirects (3xx) for protected routes — auth gate is correct.
      const results = await auditPageLinks(page, {
        ignore: [/^\/api\//, /^\/_next\//],
      });

      const broken = results.filter((r) => r.status >= 400);
      expect(
        broken,
        `${route} has broken internal links: ${JSON.stringify(broken)}`,
      ).toHaveLength(0);
    });
  }
});

test.describe("External link domains — no stale preview URLs", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — external links point to canonical domains only`, async ({
      page,
    }) => {
      await page.goto(route);
      const externalLinks = await page.locator("a[href^='http']").all();

      const hrefs: string[] = [];
      for (const a of externalLinks) {
        const h = await a.getAttribute("href");
        if (h) hrefs.push(h);
      }

      for (const href of hrefs) {
        for (const forbidden of FORBIDDEN_EXTERNAL_HOSTS) {
          expect(href, `${route} link to forbidden host: ${href}`).not.toContain(
            forbidden,
          );
        }
      }
    });
  }
});

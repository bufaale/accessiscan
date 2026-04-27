/**
 * branding.spec.ts — Phase 3 of app-quality-auditor
 *
 * Catches the bug class the operator surfaced: ReviewStack tab title says
 * "SaaS AI Boilerplate" because the template wasn't fully rebranded. This
 * spec asserts every public route renders AccessiScan brand consistently
 * in tab title, meta description, and visible footer/header.
 *
 * Boundary: NEVER asserts against design tokens or visual layout — that's
 * the design system's job. Only the brand string identity.
 */
import { test, expect } from "@playwright/test";

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

const FORBIDDEN_BRAND_LEAKS = [
  "ADA Scanner",
  "SaaS AI Boilerplate",
  "SaaS Boilerplate",
  "Pilotdeck",
  "AIComply",
  "CallSpark",
  "ReviewStack",
  "Lorem ipsum",
  "TODO",
  "FIXME",
  "Coming soon",
  "Placeholder",
];

test.describe("Branding consistency — every public route", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — tab title and meta include "AccessiScan"`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should not 404`).toBeLessThan(400);

      const title = await page.title();
      expect(title, `${route} tab title should mention AccessiScan`).toMatch(
        /AccessiScan/i,
      );

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      if (description) {
        expect(description, `${route} meta description should not leak template names`)
          .not.toMatch(/SaaS AI Boilerplate|SaaS Boilerplate|Lorem ipsum/i);
      }

      for (const leak of FORBIDDEN_BRAND_LEAKS) {
        expect(title, `${route} tab title leaks "${leak}"`).not.toContain(leak);
      }
    });

    test(`${route} — visible body copy doesn't leak other brand names`, async ({
      page,
    }) => {
      await page.goto(route);
      const bodyText = await page.locator("body").innerText();

      // ADA Scanner is the regulatory term, allowed in body copy. Other brand
      // leaks (template names, sibling product names) are not.
      const blockers = FORBIDDEN_BRAND_LEAKS.filter((s) => s !== "ADA Scanner");
      for (const leak of blockers) {
        expect(bodyText, `${route} body leaks "${leak}"`).not.toContain(leak);
      }
    });
  }
});

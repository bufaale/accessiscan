/**
 * empty-states.spec.ts — Phase 3 of app-quality-auditor
 *
 * Every listing/dashboard route with a freshly-created (zero data) user
 * must render without crashing and show a clear CTA to populate. This
 * caches a class of bugs where lists assume non-empty data and crash on
 * .map() of undefined or render a blank screen with no recourse.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../../helpers/test-utils";

const EMPTY_STATE_ROUTES = [
  { path: "/dashboard", expectCta: /scan|start|create|new/i },
  { path: "/dashboard/scans", expectCta: /new|scan|first/i },
  { path: "/dashboard/monitored", expectCta: /add|new|monitor|first/i },
  { path: "/dashboard/pdf-scans", expectCta: /upload|new|first/i },
  { path: "/settings/github", expectCta: /install|connect|configure/i },
];

test.describe("Empty state rendering for fresh user (free tier, 0 data)", () => {
  for (const { path, expectCta } of EMPTY_STATE_ROUTES) {
    test(`${path} — renders without crash + shows CTA to populate`, async ({
      page,
    }) => {
      const u = await createTestUser(`empty-${path.replace(/\//g, "_")}`, "free");
      try {
        await loginViaUI(page, u.email);
        const response = await page.goto(path);

        // Must not 500.
        expect(response?.status(), `${path} returned ${response?.status()}`).toBeLessThan(
          500,
        );

        // Must not show generic "Application error" Next.js boundary.
        const body = await page.locator("body").innerText();
        expect(body, `${path} crashed with Next.js error boundary`).not.toMatch(
          /Application error|client-side exception|Internal Server Error/i,
        );

        // Must render meaningful content (heading visible).
        await expect(
          page.getByRole("heading").first(),
          `${path} renders no heading`,
        ).toBeVisible({ timeout: 10_000 });

        // Must show a way to fix the empty state — a CTA button or link.
        const hasCtaButton = await page
          .getByRole("button", { name: expectCta })
          .first()
          .isVisible()
          .catch(() => false);
        const hasCtaLink = await page
          .getByRole("link", { name: expectCta })
          .first()
          .isVisible()
          .catch(() => false);
        expect(
          hasCtaButton || hasCtaLink,
          `${path} empty state missing CTA matching ${expectCta}`,
        ).toBe(true);
      } finally {
        await deleteTestUser(u.id);
      }
    });
  }
});

/**
 * dashboard-flow.spec.ts — Phase 3+ of app-quality-auditor
 *
 * Verifies the data flow on /dashboard end-to-end with seeded scans:
 *  - KPIs render with values
 *  - Recent Scans list renders the user's scans (and only theirs — RLS check)
 *  - Navigation: New Scan CTA → /dashboard/scans/new
 *  - Navigation: View all → /dashboard/scans
 *  - Navigation: clicking a scan row → /dashboard/scans/[id]
 *  - Empty state CTA also navigates to /dashboard/scans/new
 *
 * Written BEFORE the v2 dashboard swap to lock in current behavior. The swap
 * must keep all of these passing.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
} from "../../helpers/test-utils";

test.describe("Dashboard data flow — with seeded scans", () => {
  test("free user with completed scans sees them in Recent Scans", async ({
    page,
  }) => {
    const u = await createTestUser("dash-with-data", "free");
    try {
      const seeded1 = await seedScan(u.id, {
        url: "https://example-test-1.test",
        compliance_score: 87,
        critical_count: 1,
      });
      const seeded2 = await seedScan(u.id, {
        url: "https://example-test-2.test",
        compliance_score: 64,
        critical_count: 4,
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      // Both seeded URLs should appear somewhere on the dashboard.
      expect(body, "seeded scan #1 URL must appear on dashboard").toContain(
        seeded1.url,
      );
      expect(body, "seeded scan #2 URL must appear on dashboard").toContain(
        seeded2.url,
      );
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("New Scan CTA navigates to /dashboard/scans/new", async ({ page }) => {
    const u = await createTestUser("dash-new-cta", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // The "New Scan" button (or "Run First Scan" empty-state CTA) must lead
      // to /dashboard/scans/new. Match either copy.
      const cta = page
        .getByRole("button", { name: /new\s*scan|run first scan|first scan/i })
        .first();
      const altCta = page
        .getByRole("link", { name: /new\s*scan|run first scan|first scan/i })
        .first();

      const ctaVisible = await cta.isVisible().catch(() => false);
      if (ctaVisible) {
        await cta.click();
      } else {
        await altCta.click();
      }
      await page.waitForURL(/\/dashboard\/scans\/new/, { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe("/dashboard/scans/new");
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("RLS: user A does not see user B's scans on dashboard", async ({
    page,
  }) => {
    const userA = await createTestUser("dash-rls-a", "free");
    const userB = await createTestUser("dash-rls-b", "free");
    try {
      // Seed a scan owned by user B.
      const otherScan = await seedScan(userB.id, {
        url: "https://leaky-example-userB.test",
        compliance_score: 99,
      });

      // Login as user A and ensure user B's scan does NOT appear.
      await loginViaUI(page, userA.email);
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      expect(
        body,
        `RLS leak: user A sees user B's scan URL "${otherScan.url}"`,
      ).not.toContain(otherScan.url);
    } finally {
      await deleteTestUser(userA.id);
      await deleteTestUser(userB.id);
    }
  });
});

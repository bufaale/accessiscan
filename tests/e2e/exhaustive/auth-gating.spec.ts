/**
 * auth-gating.spec.ts — Phase 3 of app-quality-auditor
 *
 * Every protected route, three states: signed-out / free / paid.
 * Signed-out → /login. Free → upgrade prompt (where tier-gated).
 * Paid → access. Admin → admin role required.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  setUserRole,
} from "../../helpers/test-utils";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/scans",
  "/dashboard/scans/new",
  "/dashboard/monitored",
  "/dashboard/pdf-scans",
  "/settings",
  "/settings/billing",
  "/settings/github",
];

test.describe("Auth gating — signed-out users redirect to /login", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} — signed-out user is redirected`, async ({ page }) => {
      await page.goto(route);
      // Either 200 with redirect already done, or current URL is /login.
      // Wait briefly for client-side gate then check URL.
      await page.waitForURL(/\/(login|dashboard|signup)/, { timeout: 10_000 }).catch(() => {});
      const finalUrl = new URL(page.url()).pathname;
      expect(
        finalUrl,
        `${route} should redirect signed-out user to /login (got ${finalUrl})`,
      ).toMatch(/\/login/);
    });
  }
});

test.describe("Auth gating — admin route requires admin role", () => {
  test("/admin — non-admin user is blocked", async ({ page }) => {
    const u = await createTestUser("nonadmin-gate", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");
      // Either redirect home/dashboard, OR show explicit denial. NOT show admin UI.
      const body = await page.locator("body").innerText();
      const hasAdminContent = /admin\s+panel|user\s+management|all\s+users/i.test(body);
      expect(
        hasAdminContent,
        "/admin should not render admin UI for non-admin users",
      ).toBe(false);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("/admin — admin role accesses successfully", async ({ page }) => {
    const u = await createTestUser("admin-gate", "free");
    try {
      await setUserRole(u.id, "admin");
      await loginViaUI(page, u.email);
      await page.goto("/admin");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

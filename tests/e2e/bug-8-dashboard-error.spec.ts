import { test, expect } from "@playwright/test";

/**
 * Bug #8 regression test: dashboard data-load failures must surface a visible
 * error state with a Retry button (was previously a silent `catch {}` that
 * left users with an infinite skeleton).
 */

test.describe("Bug #8 — DashboardError component contract", () => {
  test("DashboardError component file exists with required props", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/components/dashboard/dashboard-error.tsx");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain("DashboardError");
    expect(src).toContain("onRetry");
    expect(src).toContain('data-testid="dashboard-error"');
    expect(src).toContain('data-testid="dashboard-error-retry"');
  });

  test("dashboard page imports DashboardError + has error/retrying state", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain("DashboardError");
    expect(src).toContain("setError");
    expect(src).toContain("setRetrying");
    // The pre-fix bug: bare `catch {}` with no setError. Assert that's gone.
    expect(src).not.toMatch(/}\s*catch\s*\{\s*\/\/\s*Silently fail/);
  });

  test("error UI renders + Retry button visible when load fails", async ({ page }) => {
    // Mock all dashboard endpoints to return 500 so error state triggers.
    await page.route("**/api/scans*", (r) => r.fulfill({ status: 500, body: "boom" }));
    await page.route("**/api/sites*", (r) => r.fulfill({ status: 500, body: "boom" }));
    await page.route("**/api/stats*", (r) => r.fulfill({ status: 500, body: "boom" }));

    // Need to be auth'd — skip if no test user infra (this is a smoke check).
    await page.goto("/dashboard").catch(() => {});
    if (page.url().includes("/login")) {
      test.skip(true, "Auth required for /dashboard — covered by other auth-aware specs");
      return;
    }
    await expect(page.locator('[data-testid="dashboard-error"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="dashboard-error-retry"]')).toBeVisible();
  });
});

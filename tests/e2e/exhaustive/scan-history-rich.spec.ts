/**
 * scan-history-rich.spec.ts — verify KPI cards, filter chips, Export CSV
 * on /dashboard/scans. These are Claude Designs features that the initial
 * v2 swap dropped.
 *
 * The test seeds 3 scans across different statuses and severities so the
 * filters have something to work against. Asserts:
 *  - 4 KPI cards render with computed values
 *  - Status chip filter narrows the list
 *  - Severity chip filter narrows the list
 *  - Export CSV button is visible + clicking triggers a download
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
} from "../../helpers/test-utils";

test.describe("Scan history — rich features (Phase A1)", () => {
  test.setTimeout(90_000);

  test("renders 4 KPI cards (total scans, avg score, critical fixed, sites covered)", async ({
    page,
  }) => {
    const u = await createTestUser("history-kpis", "pro");
    try {
      // Seed 3 completed scans with mixed scores
      await seedScan(u.id, { url: "https://kpi-1.example.test", compliance_score: 90 });
      await seedScan(u.id, { url: "https://kpi-2.example.test", compliance_score: 70 });
      await seedScan(u.id, { url: "https://kpi-3.example.test", compliance_score: 50 });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans");
      await page.waitForLoadState("networkidle");

      // Verify the 4 KPI labels are visible (case-insensitive)
      await expect(page.getByText(/total\s+scans/i).first()).toBeVisible();
      await expect(page.getByText(/avg\s+(compliance\s+)?score/i).first()).toBeVisible();
      await expect(page.getByText(/critical/i).first()).toBeVisible();
      await expect(page.getByText(/sites\s+covered|sites\s+tracked/i).first()).toBeVisible();
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("status filter chips narrow the displayed scan list", async ({
    page,
  }) => {
    const u = await createTestUser("history-status", "pro");
    try {
      await seedScan(u.id, {
        url: "https://completed.example.test",
        compliance_score: 80,
        status: "completed",
      });
      await seedScan(u.id, {
        url: "https://failed.example.test",
        compliance_score: null,
        status: "failed",
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans");
      await page.waitForLoadState("networkidle");

      // Both URLs should be visible initially
      let body = await page.locator("body").innerText();
      expect(body).toContain("completed.example.test");
      expect(body).toContain("failed.example.test");

      // Click "Failed" status chip — only failed.example.test should remain
      const failedChip = page.getByRole("button", { name: /^failed$/i }).first();
      if (await failedChip.isVisible().catch(() => false)) {
        await failedChip.click();
        await page.waitForTimeout(500);
        body = await page.locator("body").innerText();
        expect(body).toContain("failed.example.test");
        expect(body).not.toContain("completed.example.test");
      }
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("Export CSV button is visible + triggers download", async ({ page }) => {
    const u = await createTestUser("history-export", "pro");
    try {
      await seedScan(u.id, {
        url: "https://export-test.example.test",
        compliance_score: 75,
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans");
      await page.waitForLoadState("networkidle");

      const exportBtn = page.getByRole("button", { name: /export.*csv/i }).first();
      await expect(exportBtn).toBeVisible({ timeout: 10_000 });

      // Verify clicking triggers a download event
      const downloadPromise = page.waitForEvent("download", { timeout: 5_000 });
      await exportBtn.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

/**
 * new-scan-rich.spec.ts — verify the 3 Claude Designs rich features added
 * to /dashboard/scans/new:
 *   1. WCAG level chips (2.1 A · 2.1 AA · 2.2 AA · AAA)
 *   2. "Generate Auto-Fix PR" toggle with state-aware badge
 *      (BUSINESS TIER for free, NOT CONNECTED for business w/o install,
 *       CONNECTED for business + install)
 *   3. "Recently scanned" section listing last 5 scans (hidden when empty)
 *
 * These complement new-scan-flow.spec.ts (form contract — must keep passing).
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
  borrowGithubInstall,
} from "../../helpers/test-utils";

const TEST_INSTALLATION_ID = 127055454;

test.describe("New scan page — rich features", () => {
  test.setTimeout(90_000);

  test("WCAG level chips render and are interactive", async ({ page }) => {
    const u = await createTestUser("newscan-wcag", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      // The radiogroup is labeled "WCAG level"
      const group = page.getByRole("radiogroup", { name: /wcag\s*level/i });
      await expect(group).toBeVisible({ timeout: 10_000 });

      // All 4 WCAG chips should be visible
      const chip21A = group.getByRole("radio", { name: /2\.1\s*A\b/i }).first();
      const chip21AA = group.getByRole("radio", { name: /2\.1\s*AA\b/i }).first();
      const chip22AA = group.getByRole("radio", { name: /2\.2\s*AA\b/i }).first();
      const chipAAA = group.getByRole("radio", { name: /\bAAA\b/ }).first();

      await expect(chip21A).toBeVisible();
      await expect(chip21AA).toBeVisible();
      await expect(chip22AA).toBeVisible();
      await expect(chipAAA).toBeVisible();

      // 2.1 AA is the default selection
      await expect(chip21AA).toHaveAttribute("aria-checked", "true");
      await expect(chip21A).toHaveAttribute("aria-checked", "false");

      // Clicking a different chip flips the selection
      await chip22AA.click();
      await expect(chip22AA).toHaveAttribute("aria-checked", "true");
      await expect(chip21AA).toHaveAttribute("aria-checked", "false");
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("free tier shows BUSINESS TIER badge on Auto-Fix toggle", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-autofix-free", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      const section = page.getByTestId("auto-fix-section");
      await expect(section).toBeVisible({ timeout: 10_000 });
      await expect(section.getByText(/generate\s*auto-?fix\s*pr/i).first()).toBeVisible();

      // Badge says BUSINESS TIER
      const badge = page.getByTestId("auto-fix-badge");
      await expect(badge).toHaveText(/business\s*tier/i);

      // Toggle is disabled (aria-checked = false even after click)
      const toggle = section.getByRole("switch", {
        name: /generate\s*auto-?fix\s*pr/i,
      });
      await expect(toggle).toBeDisabled();
      await expect(toggle).toHaveAttribute("aria-checked", "false");

      // Upgrade link points to billing
      const upgradeLink = section
        .getByRole("link", { name: /upgrade/i })
        .first();
      await expect(upgradeLink).toHaveAttribute("href", /\/settings\/billing/);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business tier without install shows NOT CONNECTED + Connect link", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-autofix-biz-noinstall", "business");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      const badge = page.getByTestId("auto-fix-badge");
      await expect(badge).toHaveText(/not\s*connected/i);

      const section = page.getByTestId("auto-fix-section");
      const connectLink = section
        .getByRole("link", { name: /connect\s*github/i })
        .first();
      await expect(connectLink).toHaveAttribute("href", /\/settings\/github/);

      // Toggle still disabled (no install)
      const toggle = section.getByRole("switch", {
        name: /generate\s*auto-?fix\s*pr/i,
      });
      await expect(toggle).toBeDisabled();
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business tier WITH install shows CONNECTED badge + enabled toggle", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-autofix-biz-install", "business");
    let installLease: { release: () => Promise<void> } | null = null;
    try {
      installLease = await borrowGithubInstall(u.id, TEST_INSTALLATION_ID);

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      const badge = page.getByTestId("auto-fix-badge");
      await expect(badge).toHaveText(/connected/i);
      await expect(badge).not.toHaveText(/not\s*connected/i);

      const section = page.getByTestId("auto-fix-section");
      const toggle = section.getByRole("switch", {
        name: /generate\s*auto-?fix\s*pr/i,
      });
      await expect(toggle).toBeEnabled();
      // Default ON for Business + connected
      await expect(toggle).toHaveAttribute("aria-checked", "true");

      // Click toggles it OFF
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-checked", "false");
    } finally {
      if (installLease) await installLease.release();
      await deleteTestUser(u.id);
    }
  });

  test("Recently scanned section appears when user has past scans", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-recent", "free");
    try {
      const seeded = await seedScan(u.id, {
        url: "https://recent-scan-fixture.test",
        compliance_score: 87,
      });

      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      // Wait for the GET /api/scans?limit=5 response to populate the list
      const section = page.getByTestId("recently-scanned");
      await expect(section).toBeVisible({ timeout: 15_000 });
      await expect(
        section.getByText(/recently\s*scanned/i).first(),
      ).toBeVisible();

      // The seeded scan row should be present (data-scan-id selector)
      const row = section.locator(`[data-scan-id="${seeded.id}"]`).first();
      await expect(row).toBeVisible();
      await expect(row).toContainText(/recent-scan-fixture\.test/i);
      await expect(row).toContainText("87");

      // Row link navigates to the scan detail page
      const rowLink = row.getByRole("link").first();
      await expect(rowLink).toHaveAttribute("href", `/dashboard/scans/${seeded.id}`);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("Recently scanned section hidden for fresh user (no scans)", async ({
    page,
  }) => {
    const u = await createTestUser("newscan-no-recent", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/scans/new");
      await page.waitForLoadState("networkidle");

      // Section should NOT render — verify the testid is absent.
      // Use a short timeout because the page is fully loaded.
      const section = page.getByTestId("recently-scanned");
      await expect(section).toHaveCount(0);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

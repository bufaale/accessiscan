/**
 * pour-breakdown.spec.ts — verify the POUR (Perceivable/Operable/Understandable/
 * Robust) per-principle scoring breakdown renders on the scan-result page when
 * the worker has populated scans.pour_scores. This is the consumer for backend
 * B1.
 */
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, seedScan } from "../../helpers/test-utils";

test.describe("Scan result — POUR breakdown", () => {
  test.setTimeout(60_000);

  test("renders 4 POUR cards with scores when pour_scores is set", async ({ page }) => {
    const u = await createTestUser("pour-breakdown", "pro");
    try {
      const scan = await seedScan(u.id, {
        url: "https://pour-test.example.test",
        compliance_score: 78,
        pour_scores: {
          perceivable: 92,
          operable: 71,
          understandable: 88,
          robust: 65,
        },
      });

      await loginViaUI(page, u.email);
      await page.goto(`/dashboard/scans/${scan.id}`);
      await page.waitForLoadState("networkidle");

      const wrap = page.locator("[data-testid='pour-breakdown']");
      await expect(wrap).toBeVisible({ timeout: 10_000 });

      const labels = ["Perceivable", "Operable", "Understandable", "Robust"];
      for (const label of labels) {
        await expect(wrap.getByText(label, { exact: true })).toBeVisible();
      }

      const text = await wrap.innerText();
      expect(text).toContain("92");
      expect(text).toContain("71");
      expect(text).toContain("88");
      expect(text).toContain("65");
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("hides POUR breakdown when pour_scores is null", async ({ page }) => {
    const u = await createTestUser("pour-null", "pro");
    try {
      const scan = await seedScan(u.id, {
        url: "https://pour-null.example.test",
        compliance_score: 87,
        // intentionally no pour_scores override
      });

      await loginViaUI(page, u.email);
      await page.goto(`/dashboard/scans/${scan.id}`);
      await page.waitForLoadState("networkidle");

      await expect(page.locator("[data-testid='pour-breakdown']")).toHaveCount(0);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

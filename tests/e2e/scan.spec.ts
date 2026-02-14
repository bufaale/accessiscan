import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, setUserPlan } from "../helpers/test-utils";

let freeUser: { id: string; email: string };
let proUser: { id: string; email: string };

test.beforeAll(async () => {
  [freeUser, proUser] = await Promise.all([
    createTestUser("scan-free"),
    createTestUser("scan-pro"),
  ]);
  await setUserPlan(proUser.id, "pro");
});

test.afterAll(async () => {
  await Promise.all([
    freeUser?.id ? deleteTestUser(freeUser.id) : Promise.resolve(),
    proUser?.id ? deleteTestUser(proUser.id) : Promise.resolve(),
  ]);
});

test.describe.serial("Scanning - Free user", () => {
  test("deep scan is disabled for free users", async ({ page }) => {
    await loginViaUI(page, freeUser.email);
    await page.getByRole("link", { name: "New Scan" }).click();

    const deepScanBtn = page.getByRole("button", { name: /Deep Scan/i });
    await expect(deepScanBtn).toBeDisabled();
    await expect(page.getByText("Upgrade to unlock")).toBeVisible();
  });

  test("quick scan completes and shows results", async ({ page }) => {
    test.setTimeout(120_000); // Scans can take time

    await loginViaUI(page, freeUser.email);
    await page.getByRole("link", { name: "New Scan" }).click();

    // Enter URL and run scan
    await page.getByRole("textbox", { name: /example\.com/i }).fill("https://example.com");
    await page.getByRole("button", { name: "Run Scan" }).click();

    // Should show scanning state
    await expect(page.getByText("Scanning...")).toBeVisible({ timeout: 5_000 });

    // Wait for scan to complete and redirect to results
    await page.waitForURL("**/dashboard/scans/**", { timeout: 90_000 });
    await expect(page.getByText("Completed")).toBeVisible({ timeout: 30_000 });

    // Verify results page content
    await expect(page.getByText("Compliance Score")).toBeVisible();
    await expect(page.getByText("Level A", { exact: true })).toBeVisible();
    await expect(page.getByText("Issues Found")).toBeVisible();
    await expect(page.getByRole("link", { name: "PDF Report" })).toBeVisible();

    // Free user should see AI upsell, not AI analysis
    await expect(page.getByText("Upgrade to Pro for AI Analysis")).toBeVisible();
  });

  test("scan appears in history", async ({ page }) => {
    await loginViaUI(page, freeUser.email);
    await page.getByRole("link", { name: "Scan History" }).click();

    await expect(page.getByRole("cell", { name: "example.com", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Completed" })).toBeVisible();
  });
});

test.describe("Scanning - Pro user", () => {
  test("deep scan is enabled for pro users", async ({ page }) => {
    await loginViaUI(page, proUser.email);
    await page.getByRole("link", { name: "New Scan" }).click();

    const deepScanBtn = page.getByRole("button", { name: /Deep Scan/i });
    await expect(deepScanBtn).toBeEnabled();
    await expect(page.getByText("Upgrade to unlock")).not.toBeVisible();
  });

  test("pro scan shows AI analysis and fix suggestions", async ({ page }) => {
    test.setTimeout(120_000);

    await loginViaUI(page, proUser.email);
    await page.getByRole("link", { name: "New Scan" }).click();

    await page.getByRole("textbox", { name: /example\.com/i }).fill("https://example.com");
    await page.getByRole("button", { name: "Run Scan" }).click();

    // Wait for completion
    await page.waitForURL("**/dashboard/scans/**", { timeout: 90_000 });
    await expect(page.getByText("Completed")).toBeVisible({ timeout: 30_000 });

    // Pro features: AI Analysis section (not upsell)
    await expect(page.getByText("AI Analysis")).toBeVisible();
    await expect(page.getByText("Upgrade to Pro for AI Analysis")).not.toBeVisible();

    // AI fix suggestions on individual issues
    await expect(page.getByText("AI Fix Suggestion").first()).toBeVisible();
  });
});

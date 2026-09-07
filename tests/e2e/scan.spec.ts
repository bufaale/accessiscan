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
    // The locked affordance is now a "Pro" badge plus a "Pro tier" subtitle
    // on the option card itself (ScanTypeOption in
    // src/app/(dashboard)/dashboard/scans/new/page.tsx), not the old
    // "Upgrade to unlock" string. Assert both halves so a free user is still
    // told which tier unlocks it.
    await expect(deepScanBtn.getByText(/^Pro$/)).toBeVisible();
    await expect(deepScanBtn.getByText(/Pro tier/i)).toBeVisible();
  });

  test("quick scan completes and shows results", async ({ page }) => {
    test.setTimeout(120_000); // Scans can take time

    await loginViaUI(page, freeUser.email);
    await page.getByRole("link", { name: "New Scan" }).click();

    // Enter URL and run scan
    await page.locator("#scan-url").fill("https://example.com");
    await page.getByRole("button", { name: "Run Scan" }).click();

    // Either the button is still "Scanning..." or we've already redirected —
    // both are valid transitions, so wait for whichever lands first.
    await Promise.race([
      page.getByText("Scanning...").waitFor({ timeout: 5_000 }).catch(() => null),
      page.waitForURL("**/dashboard/scans/**", { timeout: 5_000 }).catch(() => null),
    ]);

    await page.waitForURL("**/dashboard/scans/**", { timeout: 120_000 });
    await expect(page.getByText(/Completed|completed/).first()).toBeVisible({ timeout: 60_000 });

    await expect(page.getByText(/Code Analysis|Compliance Score/).first()).toBeVisible();
    await expect(page.getByText("Level A", { exact: true })).toBeVisible();
    await expect(page.getByText(/Issues Found|Issues/).first()).toBeVisible();
    // PDF Report is in a button in the header — match either <a> or <button>
    await expect(page.getByRole("link", { name: /PDF Report/i }).or(
      page.getByRole("button", { name: /PDF Report/i }),
    ).first()).toBeVisible();

    // Free user: the AI upsell (Visual AI) should be visible; the "Unlock Visual AI" button
    await expect(page.getByRole("button", { name: /Unlock Visual AI|Upgrade/i }).first()).toBeVisible();
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

    await page.locator("#scan-url").fill("https://example.com");
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

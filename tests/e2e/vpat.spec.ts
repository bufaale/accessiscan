import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  setUserPlan,
} from "../helpers/test-utils";

// On-demand VPAT is fenced to Business/Team (commit 8e504da) — see
// VPAT_TIERS in src/lib/stripe/plans.ts. Pro is NOT entitled, so the
// download path is exercised with a business user; the Pro/Agency denial
// is asserted in tier-feature-matrix.spec.ts.
let freeUser: { id: string; email: string };
let businessUser: { id: string; email: string };

test.beforeAll(async () => {
  [freeUser, businessUser] = await Promise.all([
    createTestUser("vpat-free"),
    createTestUser("vpat-business"),
  ]);
  await setUserPlan(businessUser.id, "business");
});

test.afterAll(async () => {
  await Promise.all([
    freeUser?.id ? deleteTestUser(freeUser.id) : Promise.resolve(),
    businessUser?.id ? deleteTestUser(businessUser.id) : Promise.resolve(),
  ]);
});

async function runQuickScanAndGetId(page: import("@playwright/test").Page) {
  await page.getByRole("link", { name: "New Scan" }).click();
  await page.locator("#scan-url").fill("https://example.com");
  await page.getByRole("button", { name: "Run Scan" }).click();
  await page.waitForURL(/\/dashboard\/scans\/[0-9a-f-]+/, { timeout: 90_000 });
  await expect(page.getByText("Completed")).toBeVisible({ timeout: 30_000 });
  const match = page.url().match(/\/dashboard\/scans\/([0-9a-f-]+)/);
  if (!match) throw new Error("Could not extract scan id");
  return match[1];
}

test.describe.serial("VPAT 2.5 export", () => {
  test("free users see VPAT gated with Business badge and are redirected to billing", async ({ page }) => {
    test.setTimeout(150_000);

    await loginViaUI(page, freeUser.email);
    await runQuickScanAndGetId(page);

    // Non-entitled tiers show a single combined button "VPAT / EN 301 549"
    // badged with the tier that actually unlocks it.
    const vpatButton = page.getByRole("button", { name: /VPAT.*EN 301 549/i });
    await expect(vpatButton).toBeVisible();
    await expect(vpatButton.getByText(/^BUSINESS$/)).toBeVisible();

    await vpatButton.click();
    await page.waitForURL("**/settings/billing", { timeout: 10_000 });
  });

  test("business users download a valid VPAT PDF", async ({ page }) => {
    test.setTimeout(150_000);

    await loginViaUI(page, businessUser.email);
    const scanId = await runQuickScanAndGetId(page);

    // The entitled-tier VPAT button is an <a> wrapped in <Button asChild>.
    const vpatLink = page.getByRole("link", { name: /VPAT 2\.5/i });
    await expect(vpatLink).toBeVisible();
    await expect(vpatLink).toHaveAttribute("href", `/api/scans/${scanId}/vpat`);

    // Trigger the download and assert the response is a PDF.
    const response = await page.request.get(`/api/scans/${scanId}/vpat`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect(response.headers()["content-disposition"]).toContain("vpat-2.5-");

    const buffer = await response.body();
    // PDFs always start with the %PDF- magic bytes.
    expect(buffer.slice(0, 5).toString()).toBe("%PDF-");
    // A multi-page VPAT should be more than a kilobyte.
    expect(buffer.byteLength).toBeGreaterThan(5_000);
  });
});

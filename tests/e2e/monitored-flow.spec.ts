import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../helpers/test-utils";

let user: { id: string; email: string };

test.beforeAll(async () => {
  user = await createTestUser("monitored", "business");
});

test.afterAll(async () => {
  if (user?.id) await deleteTestUser(user.id);
});

test.describe.serial("Monitored sites — business-tier full flow", () => {
  test("business user can add a monitored site", async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/dashboard/monitored");

    await page.getByLabel(/^URL$/i).fill("https://example.com");
    await page.getByLabel(/label/i).first().fill("E2E test site");
    await page.getByLabel(/alert email/i).fill(user.email);
    await page.getByRole("button", { name: /Add to monitoring/i }).click();

    // Wait for the row to appear in the list (toast is too transient to assert).
    await expect(page.getByText("example.com").first()).toBeVisible({ timeout: 15_000 });
  });

  test("monitored site appears in the list", async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/dashboard/monitored");
    await expect(page.getByText("example.com").first()).toBeVisible();
  });

  test("monitored list shows the cadence + label", async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/dashboard/monitored");
    await expect(page.getByText(/weekly/i).first()).toBeVisible();
    await expect(page.getByText(/E2E test site/i).first()).toBeVisible();
  });
});

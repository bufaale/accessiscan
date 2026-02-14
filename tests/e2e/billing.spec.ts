import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  STRIPE_TEST_CARD,
  STRIPE_TEST_EXPIRY,
  STRIPE_TEST_CVC,
} from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("billing");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

test.describe.serial("Billing - Stripe Integration", () => {
  test("free user sees upgrade buttons", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    await expect(page.getByText("Free", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade to Pro" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade to Agency" })).toBeVisible();
  });

  test("upgrade to Pro via Stripe checkout", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();
    await page.getByRole("button", { name: "Upgrade to Pro" }).click();

    // Should redirect to Stripe Checkout
    await page.waitForURL("**/checkout.stripe.com/**", { timeout: 15_000 });
    await expect(page.getByText("Subscribe to ADA Scanner Pro")).toBeVisible({ timeout: 10_000 });

    // Expand card form and fill test card
    await page.locator("text=Card").first().click({ force: true });
    await page.waitForTimeout(1000);

    await page.locator("#cardNumber").pressSequentially(STRIPE_TEST_CARD, { delay: 50 });
    await page.locator("#cardExpiry").pressSequentially(STRIPE_TEST_EXPIRY, { delay: 50 });
    await page.locator("#cardCvc").pressSequentially(STRIPE_TEST_CVC, { delay: 50 });
    await page.locator("#billingName").fill("E2E Test User");

    // Submit payment
    await page.locator('button:has-text("Subscribe")').first().click();
    await page.waitForURL("**/dashboard?checkout=success", { timeout: 30_000 });
  });

  test("billing page shows Pro plan after upgrade", async ({ page }) => {
    // Wait for webhook to process
    await page.waitForTimeout(5000);

    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();

    await expect(page.getByText("Pro", { exact: true })).toBeVisible();
    await expect(page.getByText("active", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Manage Subscription" })).toBeVisible();
  });

  test("manage subscription opens Stripe portal", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await page.getByRole("link", { name: "Billing" }).click();
    await page.getByRole("button", { name: "Manage Subscription" }).click();

    await page.waitForURL("**/billing.stripe.com/**", { timeout: 15_000 });
    await expect(page.getByText("Current subscription")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("ADA Scanner Pro").first()).toBeVisible();
    await expect(page.getByText("$29.00 per month")).toBeVisible();
  });
});

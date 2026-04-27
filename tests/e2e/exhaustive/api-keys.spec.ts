/**
 * api-keys.spec.ts — verify the /settings/api-keys page (B7f consumer of B7).
 *
 *  - Free/Pro/Agency users see the upsell card pointing at /settings/billing
 *  - Business users can create + revoke keys via the form
 *  - The plaintext key is shown ONCE in a banner after creation
 */
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../../helpers/test-utils";

test.describe("Settings — API Keys", () => {
  test.setTimeout(90_000);

  test("free user sees upsell, not the create form", async ({ page }) => {
    const u = await createTestUser("apikeys-free", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/api-keys");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("[data-testid='api-keys-upsell']")).toBeVisible({ timeout: 10_000 });
      await expect(page.locator("[data-testid='api-keys-create-form']")).toHaveCount(0);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business user can create a key + sees plaintext banner once", async ({ page }) => {
    const u = await createTestUser("apikeys-biz", "business");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/api-keys");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("[data-testid='api-keys-create-form']")).toBeVisible({ timeout: 10_000 });

      await page.locator("#api-key-label").fill("CI · GitHub Actions");
      await page.getByRole("button", { name: /generate\s*key/i }).click();

      const banner = page.locator("[data-testid='api-keys-created-banner']");
      await expect(banner).toBeVisible({ timeout: 10_000 });

      const plaintext = await page.locator("[data-testid='api-keys-plaintext']").innerText();
      expect(plaintext).toMatch(/^as_/);
      expect(plaintext.length).toBeGreaterThan(20);

      await expect(page.locator("[data-testid='api-keys-list']")).toContainText("CI · GitHub Actions");
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business user can revoke a key", async ({ page }) => {
    const u = await createTestUser("apikeys-revoke", "business");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/api-keys");
      await page.waitForLoadState("networkidle");

      // Create a key
      await page.locator("#api-key-label").fill("temp-key");
      await page.getByRole("button", { name: /generate\s*key/i }).click();
      await expect(page.locator("[data-testid='api-keys-plaintext']")).toBeVisible({ timeout: 10_000 });

      // Auto-confirm the JS confirm() dialog
      page.on("dialog", (d) => d.accept());

      const revokeBtn = page.getByRole("button", { name: /^revoke$/i }).first();
      await revokeBtn.click();

      // After revoke, the key shows "revoked" suffix in its prefix line
      await expect(page.locator("[data-testid='api-keys-list']")).toContainText("revoked", { timeout: 10_000 });
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

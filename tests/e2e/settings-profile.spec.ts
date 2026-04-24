import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../helpers/test-utils";

let user: { id: string; email: string };

test.beforeAll(async () => {
  user = await createTestUser("settings");
});

test.afterAll(async () => {
  if (user?.id) await deleteTestUser(user.id);
});

test.describe("Settings — profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/settings");
  });

  test("profile page renders with name + email fields", async ({ page }) => {
    // The page uses <h1> without explicit aria-level — use the text match.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Profile Settings/i);
    await expect(page.getByRole("textbox", { name: "Full Name" })).toBeVisible();
    // Email is inside a disabled <Input value={email}/>, not a text node.
    await expect(page.getByLabel("Email")).toHaveValue(user.email);
  });

  test("user can update full name and persist", async ({ page }) => {
    const newName = `Test User ${Date.now()}`;
    await page.getByRole("textbox", { name: "Full Name" }).fill(newName);
    await page.getByRole("button", { name: /save|update/i }).first().click();

    // Toast success OR the updated value sticks after reload.
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Full Name" })).toHaveValue(newName);
  });

  test("delete-account button is present (danger zone)", async ({ page }) => {
    // Button should be visible — do NOT click it (tears down the test user).
    await expect(
      page.getByRole("button", { name: /delete.*account/i }),
    ).toBeVisible();
  });
});

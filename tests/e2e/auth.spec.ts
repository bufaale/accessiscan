import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, TEST_PASSWORD } from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("auth");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

// Selectors stable across v1 and v2 AuthShell:
// - email input is #login-email or first input[type=email]
// - password input is #login-password or first input[type=password]
// - submit button matches /^sign in$|^signing in/i
const EMAIL_INPUT = "#login-email, input[type='email']";
const PASSWORD_INPUT = "#login-password, input[type='password']";

test.describe("Authentication", () => {
  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator(EMAIL_INPUT).first().fill(testUser.email);
    await page.locator(PASSWORD_INPUT).first().fill("WrongPassword123!");
    await page.locator("button[type='submit']").filter({ hasText: /^sign in|^signing in/i }).first().click();
    // v2 AuthShell renders error inside <div role="alert">. Either copy works.
    await expect(
      page.getByRole("alert").filter({ hasText: /invalid login credentials/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("logout redirects to login page", async ({ page }) => {
    await loginViaUI(page, testUser.email);

    const avatar = page.getByRole("button").filter({ hasText: /^[A-Z]{2,3}$/ });
    await avatar.click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    // v2 AuthShell signup form: fields "Full name", "Work email", "Password",
    // submit button "Start free WCAG scan".
    await expect(page.locator("#signup-name, input[autocomplete='name']").first()).toBeVisible();
    await expect(page.locator("#signup-email, input[type='email']").first()).toBeVisible();
    await expect(page.locator("#signup-password, input[type='password']").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign\s*up|start free|create/i }).first(),
    ).toBeVisible();
  });

  test("forgot password page renders correctly", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI, TEST_PASSWORD } from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("auth");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

test.describe("Authentication", () => {
  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await loginViaUI(page, testUser.email);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Email" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Password" }).fill("WrongPassword123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();
  });

  test("logout redirects to login page", async ({ page }) => {
    await loginViaUI(page, testUser.email);

    // Open user menu and sign out
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
    await expect(page.getByText("Create an account")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Full name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("forgot password page renders correctly", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  });
});

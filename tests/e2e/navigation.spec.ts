import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../helpers/test-utils";

let testUser: { id: string; email: string };

test.beforeAll(async () => {
  testUser = await createTestUser("nav");
});

test.afterAll(async () => {
  if (testUser?.id) await deleteTestUser(testUser.id);
});

test.describe("Navigation - Public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /get started|sign up/i })).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create an account")).toBeVisible();
  });
});

test.describe("Navigation - Authenticated pages", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email);
  });

  test("dashboard loads with stats cards", async ({ page }) => {
    await expect(page.getByText("Sites Tracked")).toBeVisible();
    await expect(page.getByText("Total Scans")).toBeVisible();
    await expect(page.getByText("Avg Compliance Score")).toBeVisible();
    await expect(page.getByText("Critical Issues")).toBeVisible();
  });

  test("new scan page loads", async ({ page }) => {
    await page.getByRole("link", { name: "New Scan" }).click();
    await expect(page.getByRole("heading", { name: "New Accessibility Scan" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /example\.com/i })).toBeVisible();
  });

  test("scan history page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Scan History" }).click();
    await expect(page.getByRole("heading", { name: "Scan History" })).toBeVisible();
  });

  test("profile settings page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Full Name" })).toBeVisible();
  });

  test("billing page loads", async ({ page }) => {
    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(page.getByText("Current Plan")).toBeVisible();
  });
});

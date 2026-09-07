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

    // Open the add-site dialog — the form lives inside a role=dialog that
    // only mounts when the user clicks "Add site". Without this click the
    // input selectors below time out at 60s.
    await page.getByRole("button", { name: /^Add site$/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });

    // Fields use ids; the visible labels are "Target URL", "Label (optional)",
    // and the alert-email input. Use stable id selectors.
    await page.locator("#monitored-url").fill("https://example.com");
    await page.locator("#monitored-label").fill("E2E test site");
    await page.getByLabel(/alert email/i).fill(user.email);
    // Dialog submit button reads "Start monitoring" ("Adding…" while in
    // flight) — see the Add Site Modal in
    // src/app/(dashboard)/dashboard/monitored/page.tsx.
    await page.getByRole("button", { name: /Start monitoring/i }).click();

    // The dialog closing is the first proof the POST succeeded rather than
    // erroring in place.
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });

    // Wait for the row to appear in the list (toast is too transient to
    // assert). The card's display name is `site.label ?? site.url`, so a site
    // created WITH a label renders the label and never the raw URL — asserting
    // on "example.com" could not match. Identify the row by its label, and
    // confirm the row's own controls are wired to that same site.
    await expect(page.getByText("E2E test site").first()).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Pause monitoring E2E test site" }),
    ).toBeVisible();
  });

  test("monitored site appears in the list", async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/dashboard/monitored");
    // Same `label ?? url` display rule as above — this asserts the row
    // persisted across a fresh page load.
    await expect(page.getByText("E2E test site").first()).toBeVisible();
  });

  test("monitored list shows the cadence + label", async ({ page }) => {
    await loginViaUI(page, user.email);
    await page.goto("/dashboard/monitored");
    await expect(page.getByText(/weekly/i).first()).toBeVisible();
    await expect(page.getByText(/E2E test site/i).first()).toBeVisible();
  });
});

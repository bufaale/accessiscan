/**
 * pricing-standalone.spec.ts
 *
 * Verifies the dedicated /pricing route renders with the real 5-tier
 * structure from src/lib/stripe/plans.ts, the monthly/annual toggle
 * actually swaps prices, and the CTAs route correctly (signup for Free,
 * mailto: for Team).
 *
 * Procurement officers and enterprise prospects get linked here directly,
 * so this page MUST render the same canonical pricing as plans.ts.
 */
import { test, expect } from "@playwright/test";

const ROUTE = "/pricing";

test.describe("/pricing — standalone marketing page", () => {
  test("renders with H1 mentioning pricing positioning", async ({ page }) => {
    const response = await page.goto(ROUTE);
    expect(response?.status(), "/pricing should not 404").toBeLessThan(400);

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const h1Text = await h1.innerText();
    expect(
      h1Text,
      "H1 should reflect 'Start free' or pricing-related copy",
    ).toMatch(/start free|pricing|plans/i);
  });

  test("renders all 5 tier names (Free, Pro, Agency, Business, Team)", async ({
    page,
  }) => {
    await page.goto(ROUTE);

    for (const tier of ["Free", "Pro", "Agency", "Business", "Team"]) {
      // Match tier name as a heading-like element inside a tier card. Using
      // the data-testid keeps this stable across copy tweaks.
      const id = tier.toLowerCase();
      const card = page.locator(`[data-testid="pricing-card-${id}"]`);
      await expect(card, `tier ${tier} card should be visible`).toBeVisible();
      await expect(
        card.locator(`[data-testid="tier-name-${id}"]`),
        `tier ${tier} name should render`,
      ).toContainText(tier);
    }
  });

  test("displays the canonical monthly prices ($39, $99, $299, $599)", async ({
    page,
  }) => {
    await page.goto(ROUTE);

    // Default state is monthly. Each tier price element renders the price
    // string (e.g. "$39"). We assert the dollar amounts at minimum.
    // Pro/Agency were repriced in 8e504da ($19->$39, $49->$99) when VPAT and
    // report-export moved out of those tiers and they became monitoring-only.
    // Verified live on 2026-09-07: /pricing renders $0/$39/$99/$299/$599,
    // matching monthlyPrice in src/lib/stripe/plans.ts.
    const expected: Record<string, string> = {
      pro: "$39",
      agency: "$99",
      business: "$299",
      team: "$599",
    };

    for (const [id, price] of Object.entries(expected)) {
      const priceEl = page.locator(`[data-testid="tier-price-${id}"]`);
      await expect(
        priceEl,
        `${id} price element should be visible`,
      ).toBeVisible();
      await expect(
        priceEl,
        `${id} should show monthly price ${price}`,
      ).toHaveText(price);
    }
  });

  test("monthly/annual toggle swaps the visible prices", async ({ page }) => {
    await page.goto(ROUTE);

    // Sanity: monthly tab is selected by default and shows monthly prices.
    await expect(
      page.locator('[data-testid="tier-price-pro"]'),
    ).toHaveText("$39");

    // Click "Annual" tab.
    await page.locator('[data-testid="billing-toggle-annual"]').click();

    // Annual prices should now appear (yearly values from plans.ts).
    await expect(
      page.locator('[data-testid="tier-price-pro"]'),
      "Pro annual price should be $390",
    ).toHaveText("$390");
    await expect(
      page.locator('[data-testid="tier-price-agency"]'),
      "Agency annual price should be $990",
    ).toHaveText("$990");
    await expect(
      page.locator('[data-testid="tier-price-business"]'),
      "Business annual price should be $2990",
    ).toHaveText("$2990");
    await expect(
      page.locator('[data-testid="tier-price-team"]'),
      "Team annual price should be $5990",
    ).toHaveText("$5990");

    // Toggle back to monthly and confirm.
    await page.locator('[data-testid="billing-toggle-monthly"]').click();
    await expect(
      page.locator('[data-testid="tier-price-pro"]'),
    ).toHaveText("$39");
  });

  test("Free tier CTA links to /signup", async ({ page }) => {
    await page.goto(ROUTE);
    const cta = page.locator('[data-testid="cta-free"]');
    await expect(cta).toBeVisible();

    const href = await cta.getAttribute("href");
    expect(
      href,
      "Free tier CTA must be an anchor to /signup",
    ).toBe("/signup");
  });

  test("Team tier CTA is a mailto: link", async ({ page }) => {
    await page.goto(ROUTE);
    const cta = page.locator('[data-testid="cta-team"]');
    await expect(cta).toBeVisible();

    const href = await cta.getAttribute("href");
    expect(
      href,
      "Team tier CTA must be a mailto: link for contact-sales flow",
    ).toMatch(/^mailto:/);
  });
});

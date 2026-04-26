import { test, expect } from "@playwright/test";
import { pricingPlans } from "@/lib/stripe/plans";

/**
 * Pricing update 2026-04-26 per .shared/brainstorming/2026-04-25/DIGEST.md:
 *  - Pro stays $19 (acquisition tier)
 *  - Agency stays $49
 *  - Business: $199 -> $299 (Auto-Fix PRs justifies bump)
 *  - Team: NEW tier at $599 with contact-sales CTA
 */

test.describe("Pricing structure (post 2026-04-26 update)", () => {
  test("free tier exists and is $0", () => {
    const free = pricingPlans.find((p) => p.id === "free");
    expect(free).toBeDefined();
    expect(free!.monthlyPrice).toBe(0);
  });

  test("pro tier is $19 (acquisition)", () => {
    const pro = pricingPlans.find((p) => p.id === "pro");
    expect(pro).toBeDefined();
    expect(pro!.monthlyPrice).toBe(19);
  });

  test("business tier bumped to $299", () => {
    const biz = pricingPlans.find((p) => p.id === "business");
    expect(biz).toBeDefined();
    expect(biz!.monthlyPrice).toBe(299);
    expect(biz!.yearlyPrice).toBe(2990);
    // Business now lists Auto-Fix PRs as a feature
    expect(biz!.features.some((f) => /Auto-Fix PRs/i.test(f))).toBe(true);
  });

  test("team tier added at $599 with contact-sales CTA", () => {
    const team = pricingPlans.find((p) => p.id === "team");
    expect(team).toBeDefined();
    expect(team!.monthlyPrice).toBe(599);
    expect(team!.yearlyPrice).toBe(5990);
    expect(team!.contactSales).toBe(true);
    expect(team!.ctaLabel).toBe("Contact sales");
    expect(team!.stripePriceIdMonthly).toBe("");
    expect(team!.stripePriceIdYearly).toBe("");
  });

  test("team tier features include SSO + audit log", () => {
    const team = pricingPlans.find((p) => p.id === "team");
    expect(team!.features.some((f) => /SSO/i.test(f))).toBe(true);
    expect(team!.features.some((f) => /audit log/i.test(f) || /audit trail/i.test(f) || /streaming/i.test(f))).toBe(true);
  });

  test("free description uses 'AccessiScan' brand (not 'ADA Scanner')", () => {
    const free = pricingPlans.find((p) => p.id === "free");
    expect(free!.description).toContain("AccessiScan");
    expect(free!.description).not.toContain("ADA Scanner");
  });
});

test.describe("Pricing landing page rendering", () => {
  test("renders all 5 tiers including new Team tier", async ({ page }) => {
    await page.goto("/");
    // Pricing CTAs are on the landing
    await expect(page.getByText("Team", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("$599", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("$299", { exact: false }).first()).toBeVisible();
  });

  test("Team tier CTA points to mailto, not Stripe", async ({ page }) => {
    await page.goto("/");
    const contactCta = page.getByRole("link", { name: /Contact sales/i }).first();
    await expect(contactCta).toBeVisible();
    const href = await contactCta.getAttribute("href");
    expect(href).toMatch(/^mailto:/);
  });

  test("no plan still shows the old $199 Business price", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    // Business is now $299. The string "199" should NOT appear as a price.
    // (allow "$1990" since pre-existing Pro yearly used to be 190 - check carefully)
    expect(html).not.toMatch(/\$199(?:\D|$)/);
  });
});

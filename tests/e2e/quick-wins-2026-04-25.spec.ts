import { test, expect } from "@playwright/test";
import { calculateRoi } from "@/components/landing/roi-calculator";
import { calcDelta } from "@/components/dashboard/last-30-days-widget";

test.describe("ROI calculator (landing)", () => {
  test("renders on / with the liability heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /What does NOT fixing accessibility cost you\?/i }),
    ).toBeVisible();
  });

  test("shows estimate result on initial render (defaults selected)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="roi-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="roi-result"]')).toContainText("$");
  });

  test("CTA links to /signup with industry + traffic params", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator('[data-testid="roi-result"] a').first();
    const href = await cta.getAttribute("href");
    expect(href).toMatch(/^\/signup\?industry=\w+&traffic=\w+$/);
  });
});

test.describe("Unit: calculateRoi", () => {
  test("returns null for unknown industry or traffic", () => {
    expect(calculateRoi("unknown", "medium")).toBeNull();
    expect(calculateRoi("ecommerce", "unknown")).toBeNull();
  });

  test("government industry has higher multiplier than saas", () => {
    const sm = calculateRoi("saas", "medium");
    const gov = calculateRoi("government", "medium");
    expect(gov!.liability_low_usd).toBeGreaterThan(sm!.liability_low_usd);
    expect(gov!.liability_high_usd).toBeGreaterThan(sm!.liability_high_usd);
  });

  test("enterprise traffic has higher base than small", () => {
    const sm = calculateRoi("saas", "small");
    const ent = calculateRoi("saas", "enterprise");
    expect(ent!.liability_low_usd).toBeGreaterThan(sm!.liability_low_usd);
  });

  test("low <= high for every combo", () => {
    const industries = ["ecommerce", "healthcare", "education", "saas", "government", "financial", "other"];
    const bands = ["small", "medium", "large", "enterprise"];
    for (const i of industries) {
      for (const b of bands) {
        const r = calculateRoi(i, b);
        expect(r!.liability_low_usd).toBeLessThanOrEqual(r!.liability_high_usd);
      }
    }
  });
});

test.describe("Unit: calcDelta (Last30Days widget)", () => {
  test("returns 100% up when prev is 0 and current > 0", () => {
    expect(calcDelta(10, 0)).toEqual({ pct: 100, direction: "up" });
  });

  test("returns flat when both are 0", () => {
    expect(calcDelta(0, 0)).toEqual({ pct: 0, direction: "flat" });
  });

  test("returns flat when current === prev", () => {
    expect(calcDelta(50, 50)).toEqual({ pct: 0, direction: "flat" });
  });

  test("returns up percentage when current > prev", () => {
    expect(calcDelta(150, 100)).toEqual({ pct: 50, direction: "up" });
  });

  test("returns down absolute percentage when current < prev", () => {
    expect(calcDelta(75, 100)).toEqual({ pct: 25, direction: "down" });
  });
});

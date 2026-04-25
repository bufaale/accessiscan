import { test, expect } from "@playwright/test";
import { analyzeHtml, computeHealthScore } from "@/lib/free-scan/lite-scanner";

test.describe("/free/wcag-scanner — landing", () => {
  test("renders heading + form", async ({ page }) => {
    await page.goto("/free/wcag-scanner");
    await expect(page.getByRole("heading", { name: /Free WCAG 2\.1 AA Scanner/i })).toBeVisible();
    await expect(page.getByPlaceholder(/example\.com/i)).toBeVisible();
    await expect(page.locator('[data-testid="scan-submit"]')).toBeVisible();
  });

  test("submit button disabled when URL empty", async ({ page }) => {
    await page.goto("/free/wcag-scanner");
    await expect(page.locator('[data-testid="scan-submit"]')).toBeDisabled();
  });

  test("metadata canonical points to /free/wcag-scanner", async ({ page }) => {
    await page.goto("/free/wcag-scanner");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/free/wcag-scanner");
  });
});

test.describe("/api/free/wcag-scan — endpoint contract", () => {
  test("400 on missing body", async ({ request }) => {
    const res = await request.post("/api/free/wcag-scan");
    expect(res.status()).toBe(400);
  });

  test("400 on invalid URL", async ({ request }) => {
    const res = await request.post("/api/free/wcag-scan", {
      data: { url: "not-a-url" },
    });
    expect(res.status()).toBe(400);
  });

  test("400 when URL resolves to private IP (SSRF guard)", async ({ request }) => {
    const res = await request.post("/api/free/wcag-scan", {
      data: { url: "http://localhost:3000" },
    });
    expect([400, 422]).toContain(res.status());
  });
});

test.describe("Unit: analyzeHtml WCAG checks", () => {
  test("flags <img> without alt as critical", () => {
    const issues = analyzeHtml('<html lang="en"><h1>x</h1><img src="a.png"></html>');
    const imgIssue = issues.find((i) => /alt attribute/i.test(i.rule));
    expect(imgIssue).toBeDefined();
    expect(imgIssue!.severity).toBe("critical");
  });

  test("does NOT flag <img alt='...'>", () => {
    const issues = analyzeHtml('<html lang="en"><h1>x</h1><img src="a.png" alt="logo"></html>');
    expect(issues.find((i) => /alt attribute/i.test(i.rule))).toBeUndefined();
  });

  test("flags <input> without label", () => {
    const issues = analyzeHtml(
      '<html lang="en"><h1>x</h1><form><input type="email" id="em"></form></html>',
    );
    expect(issues.find((i) => /inputs without label/i.test(i.rule))).toBeDefined();
  });

  test("does NOT flag input with matching <label for>", () => {
    const issues = analyzeHtml(
      '<html lang="en"><h1>x</h1><label for="em">Email</label><input type="email" id="em"></html>',
    );
    expect(issues.find((i) => /inputs without label/i.test(i.rule))).toBeUndefined();
  });

  test("does NOT flag input with aria-label", () => {
    const issues = analyzeHtml(
      '<html lang="en"><h1>x</h1><input type="email" aria-label="Email"></html>',
    );
    expect(issues.find((i) => /inputs without label/i.test(i.rule))).toBeUndefined();
  });

  test("flags missing html lang", () => {
    const issues = analyzeHtml("<html><h1>x</h1></html>");
    expect(issues.find((i) => /lang/i.test(i.rule))).toBeDefined();
  });

  test("flags missing viewport meta", () => {
    const issues = analyzeHtml('<html lang="en"><h1>x</h1></html>');
    expect(issues.find((i) => /viewport/i.test(i.rule))).toBeDefined();
  });

  test("flags missing h1", () => {
    const issues = analyzeHtml('<html lang="en"><meta name="viewport"><h2>only h2</h2></html>');
    expect(issues.find((i) => /No <h1>/i.test(i.rule))).toBeDefined();
  });

  test("flags multiple h1s", () => {
    const issues = analyzeHtml(
      '<html lang="en"><meta name="viewport" content="x"><h1>a</h1><h1>b</h1></html>',
    );
    expect(issues.find((i) => /Multiple <h1>/i.test(i.rule))).toBeDefined();
  });

  test("flags heading skips (h1 -> h3)", () => {
    const issues = analyzeHtml(
      '<html lang="en"><meta name="viewport" content="x"><h1>a</h1><h3>c</h3></html>',
    );
    expect(issues.find((i) => /Heading-level skips/i.test(i.rule))).toBeDefined();
  });
});

test.describe("Unit: computeHealthScore", () => {
  test("returns 100 when no issues", () => {
    expect(computeHealthScore([])).toBe(100);
  });

  test("decreases when critical issues present", () => {
    const score = computeHealthScore([
      { rule: "x", severity: "critical", count: 5, wcag_ref: "", fix_hint: "" },
    ]);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test("never goes below 0", () => {
    const issues = Array.from({ length: 10 }, () => ({
      rule: "x",
      severity: "critical" as const,
      count: 1000,
      wcag_ref: "",
      fix_hint: "",
    }));
    expect(computeHealthScore(issues)).toBeGreaterThanOrEqual(0);
  });
});

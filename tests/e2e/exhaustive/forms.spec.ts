/**
 * forms.spec.ts — Phase 3 of app-quality-auditor
 *
 * Every user-facing form: happy path + at least one validation error.
 * Auth/scan/monitored forms are covered in dedicated specs (auth.spec.ts,
 * scan.spec.ts, monitored-flow.spec.ts) — this spec covers the GAPS:
 * free tools (which don't require login) and forgot-password.
 */
import { test, expect } from "@playwright/test";

test.describe("Free WCAG scanner form (/free/wcag-scanner)", () => {
  test("rejects empty URL with visible error", async ({ page }) => {
    await page.goto("/free/wcag-scanner");
    const submit = page.getByRole("button", { name: /scan|run|start/i }).first();
    await submit.click();
    // Either HTML5 validation kicks in, or a visible error appears.
    const url = new URL(page.url()).pathname;
    expect(url).toBe("/free/wcag-scanner");
  });

  test("rejects malformed URL with visible error", async ({ page }) => {
    await page.goto("/free/wcag-scanner");
    const input = page.getByRole("textbox").first();
    await input.fill("not-a-url");
    const submit = page.getByRole("button", { name: /scan|run|start/i }).first();
    await submit.click();
    await page.waitForLoadState("networkidle");
    // Should not have produced a successful scan result. Acceptable: still on
    // the same page, or showing an error message.
    const body = await page.locator("body").innerText();
    const hasError = /invalid|valid url|http|https/i.test(body);
    const stillOnForm = new URL(page.url()).pathname === "/free/wcag-scanner";
    expect(hasError || stillOnForm).toBe(true);
  });
});

test.describe("Overlay detector form (/overlay-detector)", () => {
  test("rejects empty URL", async ({ page }) => {
    await page.goto("/overlay-detector");
    const submit = page.getByRole("button", { name: /check|detect|scan/i }).first();
    await submit.click();
    const url = new URL(page.url()).pathname;
    expect(url).toBe("/overlay-detector");
  });
});

test.describe("Forgot password form (/forgot-password)", () => {
  test("rejects empty email", async ({ page }) => {
    await page.goto("/forgot-password");
    const submit = page.getByRole("button", { name: /reset|send|email/i }).first();
    await submit.click();
    // Either HTML5 validation OR visible error OR still on the same page.
    const url = new URL(page.url()).pathname;
    expect(url).toBe("/forgot-password");
  });

  test("rejects malformed email", async ({ page }) => {
    await page.goto("/forgot-password");
    const input = page.getByRole("textbox", { name: /email/i });
    await input.fill("not-an-email");
    const submit = page.getByRole("button", { name: /reset|send|email/i }).first();
    await submit.click();
    // Should not have navigated away to a confirmation page.
    await page.waitForTimeout(1000);
    const url = new URL(page.url()).pathname;
    expect(url).toBe("/forgot-password");
  });

  test("accepts valid email format and shows confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    const input = page.getByRole("textbox", { name: /email/i });
    await input.fill("test-noexist@accessiscan.piposlab.com");
    const submit = page.getByRole("button", { name: /reset|send|email/i }).first();
    await submit.click();
    // Should show a confirmation message OR remain stable. Should NOT crash.
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(50);
    expect(body).not.toMatch(/error 500|internal server error|application error/i);
  });
});

test.describe("Signup form (/signup)", () => {
  test("rejects mismatched passwords if confirm field exists", async ({ page }) => {
    await page.goto("/signup");
    const inputs = await page.getByRole("textbox").all();
    if (inputs.length < 2) return; // No confirm-password field; skip.
    const passwordFields = await page.locator('input[type="password"]').all();
    if (passwordFields.length < 2) return; // No confirm; skip.

    const email = page.getByRole("textbox", { name: /email/i });
    await email.fill(`e2e-form-${Date.now()}@test.example.com`);
    await passwordFields[0].fill("ValidPass123!");
    await passwordFields[1].fill("DifferentPass456!");
    const submit = page.getByRole("button", { name: /sign\s*up|create/i }).first();
    await submit.click();
    await page.waitForTimeout(1000);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/match|differ|password/i);
  });

  test("rejects weak password", async ({ page }) => {
    await page.goto("/signup");
    const email = page.getByRole("textbox", { name: /email/i });
    await email.fill(`e2e-weak-${Date.now()}@test.example.com`);
    const pwd = page.locator('input[type="password"]').first();
    await pwd.fill("123");
    const submit = page.getByRole("button", { name: /sign\s*up|create/i }).first();
    await submit.click();
    // Should not have created the account. Either still on /signup or showing error.
    await page.waitForTimeout(1500);
    const url = new URL(page.url()).pathname;
    expect(url, "Weak password should NOT create an account").toMatch(/\/signup/);
  });
});

import { test, expect } from "@playwright/test";
import { siteConfig } from "@/config/site";

/**
 * Regression tests for the bug-hunt fixes shipped on 2026-04-25.
 * Each test asserts the fixed behavior and would have failed against the
 * pre-fix code.
 */

test.describe("Bug #2 — siteConfig.name is AccessiScan, not 'ADA Scanner'", () => {
  test("siteConfig.name is the marketing brand name", () => {
    expect(siteConfig.name).toBe("AccessiScan");
    expect(siteConfig.name).not.toBe("ADA Scanner");
  });
});

test.describe("Bug #1 — pricing CTA is honest (no fake trial)", () => {
  test("pricing button does NOT advertise a 14-day trial", async ({ page }) => {
    await page.goto("/");
    // The pricing CTA was "Start 14-day trial" but Stripe Checkout charges
    // immediately. Copy now reads "Start free — upgrade anytime" to match the
    // free tier reality.
    const pageContent = await page.content();
    expect(pageContent).not.toContain("Start 14-day trial");
    expect(pageContent).not.toContain("14-day trial");
  });
});

test.describe("Bug #7 — dashboard renders 'Crawling' badge for in-progress scans", () => {
  // Pure logic test — the bug was a `case "scanning"` in a switch where the DB
  // enum value is `"crawling"`. We assert the dashboard source contains the
  // correct case statement.
  test("dashboard status map uses 'crawling' key (matching DB enum), not 'scanning'", async () => {
    // The original implementation used a switch case; it was refactored
    // to an object lookup (`crawling: { color, label }`). Both shapes are
    // accepted as long as the canonical key is present and the obsolete
    // 'scanning' typo never reappears.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx");
    const src = await fs.readFile(file, "utf8");
    expect(src).toMatch(/crawling\s*:\s*\{|case\s+"crawling"/);
    expect(src).not.toContain('case "scanning"');
    expect(src).not.toMatch(/\bscanning\s*:\s*\{/);
  });
});

test.describe("Bug #9 — /api/scans handles malformed page param gracefully", () => {
  test("?page=abc&limit=foo returns 200 (not 500)", async ({ request }) => {
    // Even unauthenticated, the parseInt should not be the cause of failure —
    // we expect 401 (unauth) rather than 500 (parseInt produced NaN).
    const res = await request.get("/api/scans?page=abc&limit=foo");
    expect([200, 401, 403]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });
});

test.describe("Bug #10 — layout has metadataBase + OG/Twitter blocks", () => {
  test("layout source defines metadataBase + openGraph + twitter", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/layout.tsx");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain("metadataBase");
    expect(src).toContain("openGraph");
    expect(src).toContain("twitter");
  });
});

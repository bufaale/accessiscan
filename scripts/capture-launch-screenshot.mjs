/**
 * Capture screenshots for the AccessiScan May 8 launch post — both the
 * free scanner result page and a representative auto-fix PR diff. Saves
 * to .shared/launch/accessiscan/ at the apps-portfolio root.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "c:/Projects/apps-portfolio/.shared/launch/accessiscan";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1600 } })).newPage();

// 1. Free scanner with a real URL → result with violations
await page.goto("https://accessiscan.piposlab.com/free/wcag-scanner");
await page.waitForLoadState("domcontentloaded");
const urlInput = page.getByPlaceholder(/example\.com|https:/i).first();
await urlInput.waitFor({ timeout: 10000 });
await urlInput.fill("https://example.com");
const scanBtn = page.getByRole("button", { name: /scan|start scan/i }).first();
await scanBtn.click();
await page.waitForTimeout(8000); // Allow scan to complete
await page.screenshot({
  path: `${OUT}/01-free-scan-result.png`,
  fullPage: true,
});
console.log("✓ free-scan result captured");

// 2. Landing hero (for the post intro)
await page.goto("https://accessiscan.piposlab.com");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(2000);
await page.screenshot({
  path: `${OUT}/02-landing-hero.png`,
  fullPage: false,
});
console.log("✓ landing hero captured");

// 3. Pricing page (for "$19/mo" claim)
await page.goto("https://accessiscan.piposlab.com/pricing");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1500);
await page.screenshot({
  path: `${OUT}/03-pricing.png`,
  fullPage: true,
});
console.log("✓ pricing captured");

await browser.close();

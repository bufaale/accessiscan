/**
 * Capture the AccessiScan dashboard for the May 8 IH launch post — a real
 * authenticated dashboard with one completed scan, fullPage. Run before
 * midnight UTC May 7 so the post can include it.
 *
 * Usage:  node scripts/capture-day-of-dashboard.mjs
 */
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";

for (const f of [".env.test.local", ".env.test"]) {
  try {
    const env = readFileSync(`c:/Projects/apps-portfolio/app-04-ada-scanner/${f}`, "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const SUPA = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = "https://accessiscan.piposlab.com";
const OUT = "c:/Projects/apps-portfolio/.shared/launch/accessiscan";
mkdirSync(OUT, { recursive: true });

const email = `launch-day-${Date.now()}@test.example.com`;
const password = "LaunchDay_Pass123!";
const r = await fetch(`${SUPA}/auth/v1/admin/users`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const u = await r.json();
console.log("user provisioned:", u.id);

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 1600 } })).newPage();

try {
  // Login via UI
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("domcontentloaded");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.locator('form').getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForTimeout(1500);
  console.log("logged in");

  // Trigger a real scan against example.com so the dashboard has data
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(1000);
  const newScanBtn = page.getByRole("link", { name: /\+ new scan/i }).first();
  if (await newScanBtn.count()) {
    await newScanBtn.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    const urlInput = page.locator("#scan-url, input[type='url'], input[name='url']").first();
    if (await urlInput.count()) {
      await urlInput.fill("https://example.com");
      const submit = page.getByRole("button", { name: /run scan|start scan|begin scan/i }).first();
      await submit.click();
      console.log("scan submitted, waiting for results...");
      await page.waitForTimeout(15000); // crawl + analyze
    }
  }

  // Capture the dashboard with at least one scan visible
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: `${OUT}/04-dashboard-day-of.png`,
    fullPage: true,
  });
  console.log("✓ dashboard captured: 04-dashboard-day-of.png");
} finally {
  await browser.close();
  await fetch(`${SUPA}/auth/v1/admin/users/${u.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${KEY}`, apikey: KEY },
  });
  console.log("test user cleaned up");
}

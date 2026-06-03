/**
 * Real-visitor walkthrough of AccessiScan as if landing from the IH post.
 * Captures screenshots at every meaningful step + records console errors,
 * navigation timings, and any UX friction points.
 *
 * Output: c:/Projects/apps-portfolio/fotos-verificar/accessiscan-human-walkthrough/
 */
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

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
const OUT = "c:/Projects/apps-portfolio/fotos-verificar/accessiscan-human-walkthrough";
mkdirSync(OUT, { recursive: true });

const findings = [];
const issues = [];
let stepNum = 0;

async function step(page, label, action) {
  stepNum++;
  const tag = `${String(stepNum).padStart(2, "0")}-${label}`;
  console.log(`[${tag}]`);
  const errors = [];
  const onMsg = (msg) => {
    if (msg.type() === "error") errors.push(msg.text().slice(0, 250));
  };
  page.on("console", onMsg);
  const t0 = Date.now();
  try {
    await action(page);
    await page.waitForTimeout(1500);
  } catch (err) {
    issues.push({ step: tag, type: "ACTION_FAILED", message: err.message });
    console.log(`  ✗ ${err.message.slice(0, 100)}`);
  }
  const dt = Date.now() - t0;
  page.off("console", onMsg);
  await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: true });
  if (errors.length) {
    issues.push({ step: tag, type: "CONSOLE_ERRORS", errors });
    console.log(`  ⚠ ${errors.length} console errors`);
  }
  findings.push({ step: tag, url: page.url(), duration_ms: dt, errors_count: errors.length });
  console.log(`  ✓ ${page.url()} (${dt}ms)`);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();

// Provision a fresh test user via admin API for the upgrade flow (Step 14+)
const email = `human-walk-${Date.now()}@test.example.com`;
const password = "HumanWalk_Pass123!";
const provR = await fetch(`${SUPA}/auth/v1/admin/users`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const userJson = await provR.json();
console.log(`provisioned test user: ${userJson.id}`);

try {
  // ─────────────────────────────────────────────────────────────
  // ACT 1: Visitor arrives from IH post (no auth, fresh session)
  // ─────────────────────────────────────────────────────────────
  await step(page, "landing-hero", async (p) => {
    await p.goto(`${BASE}/?utm_source=ih&utm_medium=social&utm_campaign=launch-may-8`);
    await p.waitForLoadState("domcontentloaded");
  });

  await step(page, "landing-scroll-features", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 800));
  });

  await step(page, "landing-scroll-pricing-teaser", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 1200));
  });

  await step(page, "landing-scroll-bottom", async (p) => {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 2: Try the free scan (the wedge in the IH post)
  // ─────────────────────────────────────────────────────────────
  await step(page, "free-scanner-page", async (p) => {
    await p.goto(`${BASE}/free/wcag-scanner`);
    await p.waitForLoadState("domcontentloaded");
  });

  await step(page, "free-scanner-paste-url", async (p) => {
    const urlInput = p.getByPlaceholder(/example\.com|https:|enter URL/i).first();
    await urlInput.waitFor({ timeout: 10_000 });
    await urlInput.fill("https://www.boston.gov");
  });

  await step(page, "free-scanner-submit", async (p) => {
    const scanBtn = p.getByRole("button", { name: /scan|start|begin/i }).first();
    await scanBtn.click();
  });

  // Scan takes 5-15s typically
  await step(page, "free-scanner-results", async (p) => {
    await p.waitForTimeout(10_000); // let the scan complete
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 3: Pricing page (visitor decides if they want to pay)
  // ─────────────────────────────────────────────────────────────
  await step(page, "pricing-top", async (p) => {
    await p.goto(`${BASE}/pricing`);
    await p.waitForLoadState("domcontentloaded");
  });

  await step(page, "pricing-tiers", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 600));
  });

  await step(page, "pricing-comparison", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 600));
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 4: Signup flow
  // ─────────────────────────────────────────────────────────────
  await step(page, "signup-page", async (p) => {
    await p.goto(`${BASE}/signup`);
    await p.waitForLoadState("domcontentloaded");
  });

  // Don't actually submit signup form here — we already provisioned a user
  // via admin API. The signup E2E is covered by tests/e2e/exhaustive/critical-journey.spec.ts.
  // Instead: log in with the provisioned account.

  await step(page, "login-page", async (p) => {
    await p.goto(`${BASE}/login`);
    await p.waitForLoadState("domcontentloaded");
  });

  await step(page, "login-fill-and-submit", async (p) => {
    await p.locator("#login-email").fill(email);
    await p.locator("#login-password").fill(password);
    await p.locator("form").getByRole("button", { name: /sign in/i }).click();
    await p.waitForURL(/\/dashboard/, { timeout: 30_000 });
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 5: First dashboard impression (the "wow" moment)
  // ─────────────────────────────────────────────────────────────
  await step(page, "dashboard-empty-state", async (p) => {
    await p.waitForTimeout(2_000); // let chrome render
  });

  await step(page, "dashboard-scroll-down", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 600));
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 6: Run an authenticated scan
  // ─────────────────────────────────────────────────────────────
  await step(page, "new-scan-page", async (p) => {
    const newBtn = p.getByRole("link", { name: /new scan/i }).first();
    if (await newBtn.count()) {
      await newBtn.click();
      await p.waitForLoadState("domcontentloaded");
    }
  });

  await step(page, "new-scan-fill-url", async (p) => {
    const input = p.locator("input[type='url'], input[name='url'], #scan-url").first();
    if (await input.count()) {
      await input.fill("https://www.boston.gov");
    }
  });

  await step(page, "new-scan-submit", async (p) => {
    const submit = p.getByRole("button", { name: /run scan|start scan|begin/i }).first();
    if (await submit.count()) await submit.click();
    await p.waitForTimeout(3_000);
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 7: Billing page (the "should I pay?" moment)
  // ─────────────────────────────────────────────────────────────
  await step(page, "billing-page", async (p) => {
    await p.goto(`${BASE}/settings/billing`);
    await p.waitForLoadState("domcontentloaded");
  });

  // ─────────────────────────────────────────────────────────────
  // ACT 8: Click upgrade to Pro to verify Stripe checkout opens
  // ─────────────────────────────────────────────────────────────
  await step(page, "upgrade-pro-button-click", async (p) => {
    const proBtn = p.getByRole("button", { name: /upgrade to pro|start pro|pro.*\$19/i }).first();
    if (await proBtn.count()) {
      // Don't actually navigate to Stripe — just verify the button is clickable
      // and would route to Stripe Checkout. We'll do the real Stripe checkout
      // in a separate script with a test card.
      console.log(`  Upgrade-Pro button found: ${await proBtn.textContent()}`);
    } else {
      issues.push({ step: stepNum + "-upgrade-pro", type: "MISSING_CTA", message: "Upgrade to Pro button not found on /settings/billing" });
    }
  });

  await step(page, "settings-profile", async (p) => {
    await p.goto(`${BASE}/settings/profile`);
    await p.waitForLoadState("domcontentloaded");
  });
} finally {
  // Cleanup test user
  await fetch(`${SUPA}/auth/v1/admin/users/${userJson.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${KEY}`, apikey: KEY },
  });
  await browser.close();

  writeFileSync(`${OUT}/walkthrough-findings.json`, JSON.stringify({ findings, issues }, null, 2));
  console.log(`\n✓ ${findings.length} steps captured to ${OUT}`);
  console.log(`  ${issues.length} issues flagged`);
  if (issues.length) {
    console.log("\nISSUES:");
    for (const i of issues) console.log(`  - ${i.step}: ${i.type} - ${i.message || JSON.stringify(i.errors).slice(0, 150)}`);
  }
}

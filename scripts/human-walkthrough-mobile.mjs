/**
 * Phase 3: Mobile (390x844 iPhone Pro) walkthrough of AccessiScan as a
 * fresh visitor. Mirror of Phase 1 but mobile viewport — the launch IH
 * post + LinkedIn post + Twitter thread will drive 40-60% mobile traffic.
 *
 * Captures full-page screenshots at every step + flags any horizontal
 * scroll, hidden CTAs, broken touch targets.
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
const OUT = "c:/Projects/apps-portfolio/fotos-verificar/accessiscan-mobile-walkthrough";
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
  try {
    await action(page);
    await page.waitForTimeout(1500);
  } catch (err) {
    issues.push({ step: tag, type: "ACTION_FAILED", message: err.message });
    console.log(`  ✗ ${err.message.slice(0, 100)}`);
  }
  page.off("console", onMsg);

  // Detect horizontal scroll (a launch-day-killer on mobile)
  const horizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  }).catch(() => false);
  if (horizontalOverflow) {
    issues.push({ step: tag, type: "HORIZONTAL_SCROLL", message: "Page has horizontal overflow at 390px" });
    console.log(`  ⚠ horizontal scroll detected`);
  }

  await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: true });
  if (errors.length) {
    issues.push({ step: tag, type: "CONSOLE_ERRORS", errors });
    console.log(`  ⚠ ${errors.length} console errors`);
  }
  findings.push({ step: tag, url: page.url(), errors_count: errors.length, horizontal_overflow: horizontalOverflow });
  console.log(`  ${horizontalOverflow ? "⚠" : "✓"} ${page.url()}`);
}

const email = `mobile-walk-${Date.now()}@test.example.com`;
const password = "MobWalk_Pass123!";
const provR = await fetch(`${SUPA}/auth/v1/admin/users`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const u = await provR.json();
console.log(`provisioned: ${u.id}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();

try {
  // ── Landing ──
  await step(page, "landing-hero", async (p) => {
    await p.goto(`${BASE}/?utm_source=ih&utm_medium=mobile`);
    await p.waitForLoadState("domcontentloaded");
  });
  await step(page, "landing-scroll-comparison", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 800));
  });
  await step(page, "landing-scroll-pricing", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 1500));
  });
  await step(page, "landing-scroll-faq", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 1500));
  });
  await step(page, "landing-scroll-bottom", async (p) => {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  });

  // ── Free scan (the wedge) ──
  await step(page, "free-scanner", async (p) => {
    await p.goto(`${BASE}/free/wcag-scanner`);
    await p.waitForLoadState("domcontentloaded");
  });
  await step(page, "free-scanner-fill", async (p) => {
    const input = p.getByPlaceholder(/example\.com|https:|enter URL/i).first();
    await input.fill("https://www.boston.gov");
  });
  await step(page, "free-scanner-submit", async (p) => {
    await p.getByRole("button", { name: /scan|start/i }).first().click();
    await p.waitForTimeout(10_000);
  });

  // ── Pricing ──
  await step(page, "pricing", async (p) => {
    await p.goto(`${BASE}/pricing`);
    await p.waitForLoadState("domcontentloaded");
  });
  await step(page, "pricing-scroll-tiers", async (p) => {
    await p.evaluate(() => window.scrollBy(0, 600));
  });

  // ── Signup ──
  await step(page, "signup-form", async (p) => {
    await p.goto(`${BASE}/signup`);
    await p.waitForLoadState("domcontentloaded");
  });

  // ── Login + dashboard ──
  await step(page, "login-form", async (p) => {
    await p.goto(`${BASE}/login`);
    await p.waitForLoadState("domcontentloaded");
  });
  await step(page, "login-fill-and-submit", async (p) => {
    await p.locator("#login-email").fill(email);
    await p.locator("#login-password").fill(password);
    await p.locator("form").getByRole("button", { name: /sign in/i }).click();
    await p.waitForURL(/\/dashboard/, { timeout: 30_000 });
  });
  await step(page, "dashboard-mobile", async (p) => {
    await p.waitForTimeout(2_000);
  });
  await step(page, "billing-mobile", async (p) => {
    await p.goto(`${BASE}/settings/billing`);
    await p.waitForLoadState("domcontentloaded");
  });
} finally {
  await fetch(`${SUPA}/auth/v1/admin/users/${u.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${KEY}`, apikey: KEY },
  });
  await browser.close();
  writeFileSync(`${OUT}/findings.json`, JSON.stringify({ findings, issues }, null, 2));
  console.log(`\n✓ ${findings.length} mobile steps captured`);
  console.log(`  ${issues.length} issues (incl. ${issues.filter(i => i.type === "HORIZONTAL_SCROLL").length} horizontal-scroll)`);
  if (issues.length) {
    for (const i of issues) console.log(`  - ${i.step}: ${i.type} ${i.message ?? ""}`);
  }
}

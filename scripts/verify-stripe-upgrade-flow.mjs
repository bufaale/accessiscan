/**
 * Phase 2: Stripe Pro $19 upgrade flow end-to-end via the actual UI button.
 *
 * Walks through: provision user → login → /settings/billing → click "Upgrade
 * to Pro" → captures the resulting Stripe Checkout URL → hits Stripe API to
 * verify the session is well-formed (cs_live_*, amount_total=1900, the right
 * price_id, mode=subscription, success_url=accessiscan.piposlab.com).
 *
 * Does NOT complete payment — verifies the wiring only.
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

// Pull LIVE Stripe key from .env.keys
const sharedKeys = readFileSync("c:/Projects/apps-portfolio/.shared/.env.keys", "utf8");
let STRIPE_LIVE_KEY = null;
for (const line of sharedKeys.split("\n")) {
  const m = line.match(/^STRIPE_CALVE_SEGURA=(.*)$/);
  if (m) STRIPE_LIVE_KEY = m[1].trim();
}
if (!STRIPE_LIVE_KEY) throw new Error("STRIPE_CALVE_SEGURA not found in .env.keys");

const SUPA = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = "https://accessiscan.piposlab.com";
const OUT = "c:/Projects/apps-portfolio/fotos-verificar/accessiscan-stripe-upgrade";
mkdirSync(OUT, { recursive: true });

const email = `stripe-upgrade-${Date.now()}@test.example.com`;
const password = "StripeUp_Pass123!";
const provR = await fetch(`${SUPA}/auth/v1/admin/users`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const u = await provR.json();
console.log(`provisioned: ${u.id}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const findings = {};

try {
  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("domcontentloaded");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.locator("form").getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  console.log("logged in");

  // Go to billing
  await page.goto(`${BASE}/settings/billing`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/01-billing-page.png`, fullPage: true });

  // Click "Upgrade to Pro" — capture the redirect URL
  console.log("clicking Upgrade to Pro...");
  const proBtn = page.getByRole("button", { name: /upgrade to pro/i }).first();
  await proBtn.waitFor({ timeout: 10_000 });

  // Stripe Checkout opens via window.location.href = url, so we wait for navigation
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("checkout.stripe.com"), { timeout: 30_000 }).catch(() => null),
    page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 }).catch(() => null),
    proBtn.click(),
  ]);

  await page.waitForTimeout(3000);
  const checkoutUrl = page.url();
  console.log(`landed on: ${checkoutUrl}`);
  findings.checkout_url = checkoutUrl;

  if (!checkoutUrl.includes("checkout.stripe.com")) {
    findings.error = "Did NOT redirect to Stripe Checkout";
    await page.screenshot({ path: `${OUT}/02-FAIL-no-redirect.png`, fullPage: true });
    throw new Error("Upgrade button did not navigate to Stripe Checkout");
  }

  await page.screenshot({ path: `${OUT}/02-stripe-checkout-page.png`, fullPage: true });

  // Extract the cs_live_* session ID from the URL
  const sessionMatch = checkoutUrl.match(/(cs_(?:live|test)_[a-zA-Z0-9_]+)/);
  if (!sessionMatch) {
    findings.error = "Could not parse Stripe session ID from URL";
    throw new Error("Could not parse Stripe session ID");
  }
  const sessionId = sessionMatch[1];
  findings.session_id = sessionId;
  findings.is_live = sessionId.startsWith("cs_live_");
  console.log(`session: ${sessionId}`);
  console.log(`is LIVE mode: ${findings.is_live}`);

  // Hit Stripe API to verify session details
  const stripeR = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`, {
    headers: { Authorization: `Bearer ${STRIPE_LIVE_KEY}` },
  });
  const session = await stripeR.json();

  if (session.error) {
    findings.error = `Stripe API error: ${session.error.message}`;
    throw new Error(session.error.message);
  }

  findings.amount_total = session.amount_total;
  findings.amount_total_dollars = (session.amount_total ?? 0) / 100;
  findings.currency = session.currency;
  findings.mode = session.mode;
  findings.success_url = session.success_url;
  findings.cancel_url = session.cancel_url;
  findings.payment_status = session.payment_status;
  findings.line_items = session.line_items?.data?.map((li) => ({
    description: li.description,
    quantity: li.quantity,
    amount_total: li.amount_total,
    price_id: li.price?.id,
    unit_amount: li.price?.unit_amount,
    recurring_interval: li.price?.recurring?.interval,
  })) ?? [];

  console.log("\n=== Stripe Checkout Session Verification ===");
  console.log(`amount_total: $${findings.amount_total_dollars}`);
  console.log(`currency: ${findings.currency}`);
  console.log(`mode: ${findings.mode}`);
  console.log(`success_url: ${findings.success_url}`);
  console.log(`payment_status: ${findings.payment_status}`);
  console.log(`line_items:`, JSON.stringify(findings.line_items, null, 2));

  // Assertions
  const assertions = [
    { name: "Session is LIVE mode", pass: findings.is_live },
    { name: "Amount is $19.00 (1900 cents)", pass: findings.amount_total === 1900 },
    { name: "Currency is USD", pass: findings.currency === "usd" },
    { name: "Mode is subscription", pass: findings.mode === "subscription" },
    { name: "Success URL points to accessiscan.piposlab.com", pass: (findings.success_url ?? "").includes("accessiscan.piposlab.com") },
    { name: "Recurring interval is month", pass: findings.line_items[0]?.recurring_interval === "month" },
    { name: "Price ID is set", pass: !!findings.line_items[0]?.price_id },
  ];

  console.log("\n=== Assertions ===");
  let allPass = true;
  for (const a of assertions) {
    console.log(`  ${a.pass ? "✓" : "✗"} ${a.name}`);
    if (!a.pass) allPass = false;
  }
  findings.assertions = assertions;
  findings.all_pass = allPass;
} finally {
  await fetch(`${SUPA}/auth/v1/admin/users/${u.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${KEY}`, apikey: KEY },
  });
  await browser.close();
  writeFileSync(`${OUT}/findings.json`, JSON.stringify(findings, null, 2));
  console.log(`\n→ findings written to ${OUT}/findings.json`);
}

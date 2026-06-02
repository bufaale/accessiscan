/**
 * E2E for the $149 one-time WCAG audit product (shipped 2026-06-02).
 *
 * The first-dollar play: a no-account paid audit for buyers in acute ADA pain.
 * These specs verify the surfaces + the checkout contract WITHOUT spending a
 * real $149 (the success-path fulfillment runs in the Stripe webhook, which is
 * covered by the webhook unit assertions + a manual test-mode run, not here).
 *
 * Coverage:
 *   1. /audit landing renders, shows price, the honest scope limitation, and
 *      refund terms BEFORE payment (legal requirement).
 *   2. /audit landing makes NO banned compliance claims.
 *   3. /api/audit/checkout validates input: bad URL -> 400, SSRF -> blocked,
 *      missing email -> 400.
 *   4. /api/audit/checkout with a valid public URL + email returns a Stripe
 *      checkout URL (the live contract — proves the endpoint + price wire up).
 *   5. The free-scanner gate offers the audit upsell.
 */

import { test, expect, request } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com";

test.describe("AccessiScan $149 audit product — shipped 2026-06-02", () => {
  test("/audit renders price, scope limit, and pre-payment refund terms", async ({ page }) => {
    await page.goto(`${BASE}/audit`);
    await expect(page.getByRole("heading", { name: /documented WCAG 2.1 AA audit/i })).toBeVisible();
    // price visible
    await expect(page.getByText("$149").first()).toBeVisible();
    // honest scope limitation present BEFORE payment
    await expect(page.getByText(/30 to 40 percent of WCAG issues/i)).toBeVisible();
    await expect(page.getByText(/not a certificate of compliance/i)).toBeVisible();
    // refund terms present before payment
    await expect(page.getByText(/full refund/i)).toBeVisible();
    // not legal advice (copy: "Nothing here is legal advice")
    await expect(page.getByText(/is legal advice/i)).toBeVisible();
  });

  test("/audit makes NO banned compliance claims", async ({ page }) => {
    await page.goto(`${BASE}/audit`);
    const body = (await page.locator("body").innerText()).toLowerCase();
    // Check for POSITIVE banned claims (false-advertising/FTC exposure).
    // Note: the page legitimately uses "lawsuit-proof" and "certificate of
    // compliance" inside NEGATIONS ("does not make your site lawsuit-proof"),
    // which is the defensible framing — so we assert the dangerous positive
    // phrasings are absent, not the words themselves.
    expect(body).not.toContain("guaranteed compliant");
    expect(body).not.toContain("makes your site compliant");
    expect(body).not.toContain("fully compliant");
    expect(body).not.toContain("ada certified");
    expect(body).not.toContain("100% accessible");
    // and confirm the honest negation IS present
    expect(body).toContain("not a certificate of compliance");
  });

  test("checkout rejects invalid + SSRF URLs", async () => {
    const ctx = await request.newContext();
    // missing email
    let r = await ctx.post(`${BASE}/api/audit/checkout`, { data: { url: "https://example.com" } });
    expect(r.status()).toBe(400);
    // garbage url
    r = await ctx.post(`${BASE}/api/audit/checkout`, { data: { url: "not-a-url", email: "a@b.com" } });
    expect([400]).toContain(r.status());
    // SSRF: localhost / private IP must be blocked
    r = await ctx.post(`${BASE}/api/audit/checkout`, { data: { url: "http://127.0.0.1/", email: "a@b.com" } });
    expect([400]).toContain(r.status());
  });

  test("checkout with valid url+email returns a Stripe checkout URL", async () => {
    const ctx = await request.newContext();
    const r = await ctx.post(`${BASE}/api/audit/checkout`, {
      data: { url: "https://example.com", email: `e2e-audit-${Date.now()}@piposlab.com` },
    });
    // 200 + a checkout.stripe.com URL is the contract that proves the endpoint,
    // the live price, and Stripe wiring all work.
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.url).toContain("checkout.stripe.com");
  });

  test("free scanner page loads (gate upsell covered by scan-fix-gate spec)", async ({ page }) => {
    // The gate + audit upsell only render after a scan that returns >1 issue,
    // which is timing/target-dependent and already covered by
    // scan-fix-gate-2026-05-29.spec.ts. Here we just smoke the scanner page.
    await page.goto(`${BASE}/free/wcag-scanner`);
    await expect(page.getByRole("heading", { name: /Free WCAG/i })).toBeVisible();
    await expect(page.getByTestId("scan-submit")).toBeVisible();
  });
});

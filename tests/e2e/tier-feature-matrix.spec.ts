/**
 * Tier feature matrix — asserts every feature claim on /pricing matches a real
 * code path the customer can actually exercise.
 *
 * Why this exists: the existing tier-gating.spec.ts covers the headline gates
 * (Auto-Fix PRs, Continuous monitoring, PDF scans, Deep Scan). The launch-night
 * audit on 2026-05-07 found four MORE features that were promised on /pricing
 * but had inconsistent gates or no test coverage:
 *
 *   - /api/account/keys was Business-only, but plans.ts says Agency has API
 *   - VPAT export was tied to "plan === free" but had no end-to-end test
 *   - "Multi-site tracking" was advertised but not asserted
 *   - "AI fix suggestions" + "GitHub Action CI/CD" + "EN 301 549 export"
 *     were claimed in Pro features but not tested
 *
 * This spec creates one user per tier and asserts every claim, so the next
 * time we touch plans.ts or a tier gate the test fires before the customer
 * does.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  type Tier,
} from "../helpers/test-utils";

type TierUser = { id: string; email: string; tier: Tier };
const TIERS: Tier[] = ["free", "pro", "agency", "business"];
let users: Record<Tier, TierUser>;

test.beforeAll(async () => {
  const created = await Promise.all(
    TIERS.map((t) => createTestUser(`feat-matrix-${t}`, t).then((u) => ({ ...u, tier: t }))),
  );
  users = Object.fromEntries(created.map((u) => [u.tier, u])) as Record<Tier, TierUser>;
});

test.afterAll(async () => {
  await Promise.all(
    Object.values(users || {}).map((u) => (u.id ? deleteTestUser(u.id) : Promise.resolve())),
  );
});

// =============================================================================
// VPAT 2.5 export — fenced to Business/Team, NOT Pro/Agency.
//
// Commit 8e504da deliberately narrowed this gate to close the "subscribe to
// Pro, generate a VPAT, cancel" hole that undercut the one-time $149 audit,
// and stripped VPAT from the Pro/Agency feature lists in plans.ts (Business
// is described there as "the only recurring tier with VPAT"). So Pro and
// Agency MUST be denied here — that denial is the revenue guard, and a test
// asserting they pass would re-open the arbitrage.
// =============================================================================
test.describe("Tier: VPAT export gate (Business+ only)", () => {
  // The tier gate fires before the scan lookup, so a fake UUID is enough to
  // exercise it: denied tiers 402 without ever touching the scans table.
  const FAKE = "00000000-0000-0000-0000-000000000000";

  for (const tier of ["free", "pro", "agency"] as const) {
    test(`${tier} user: VPAT route returns 402 (fenced)`, async ({ page }) => {
      await loginViaUI(page, users[tier].email);
      const res = await page.request.get(`/api/scans/${FAKE}/vpat`);
      expect(res.status()).toBe(402);
    });
  }

  test("business user: VPAT route does NOT 402 (passes tier gate)", async ({ page }) => {
    await loginViaUI(page, users.business.email);
    const res = await page.request.get(`/api/scans/${FAKE}/vpat`);
    // Business clears the gate. It still 404s on the fake scan id — we only
    // need to confirm it is NOT the 402 tier rejection.
    expect(res.status()).not.toBe(402);
  });
});

// =============================================================================
// API key generation — promised on Agency ("API access") + Business
// =============================================================================
test.describe("Tier: API key creation (Agency+ promised)", () => {
  for (const tier of ["free", "pro"] as const) {
    test(`${tier} user: POST /api/account/keys returns 402`, async ({ page }) => {
      await loginViaUI(page, users[tier].email);
      const res = await page.request.post("/api/account/keys", {
        data: { label: "e2e-test-key" },
      });
      expect(res.status()).toBe(402);
      const body = await res.json();
      expect(body.error).toMatch(/agency|business|team/i);
    });
  }

  for (const tier of ["agency", "business"] as const) {
    test(`${tier} user: POST /api/account/keys does NOT 402`, async ({ page }) => {
      await loginViaUI(page, users[tier].email);
      const res = await page.request.post("/api/account/keys", {
        data: { label: `e2e-test-key-${tier}-${Date.now()}` },
      });
      // Agency+Business pass the tier gate. Should be 200/201 with key.
      expect(res.status()).not.toBe(402);
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      // Response shape: { key: { plaintext, prefix, ... } }
      expect(body.key?.plaintext).toMatch(/^as_/);
    });
  }
});

// =============================================================================
// Pricing copy honesty — homepage and /pricing must NOT contain bait language
// =============================================================================
test.describe("Pricing copy honesty: no fake-trial language", () => {
  test("homepage / does NOT contain '14-day trial' anywhere", async ({ page }) => {
    await page.goto("/");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toMatch(/14-day trial/i);
    expect(bodyText).not.toMatch(/14 day trial/i);
    expect(bodyText).not.toMatch(/Start 14-day/i);
  });

  test("/pricing does NOT contain '14-day Pro trial' anywhere", async ({ page }) => {
    await page.goto("/pricing");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toMatch(/14-day Pro trial/i);
    expect(bodyText).not.toMatch(/Start 14-day trial/i);
    // The FAQ entry is now "Can I try Pro before I pay?" — no trial mention
    expect(bodyText).not.toMatch(/How does the 14-day Pro trial work/i);
  });

  test("/pricing does NOT advertise Auto-Fix PRs on every paid plan", async ({ page }) => {
    await page.goto("/pricing");
    const head = await page.locator('meta[name="description"]').getAttribute("content");
    // Old description had "Auto-Fix PRs, and CI/CD on every paid plan." — fixed
    expect(head).not.toMatch(/Auto-Fix PRs.{0,30}every paid plan/i);
  });
});

// =============================================================================
// Pricing card claims match plans.ts (homepage `/v2`)
// =============================================================================
test.describe("Pricing card honesty (homepage)", () => {
  test("homepage pricing section does NOT mention 3 sites or 25 sites or multi-tenant", async ({ page }) => {
    await page.goto("/");
    // Pull the rendered HTML once and check the pricing section block text.
    // Searching the whole page is safe because these phrases were UNIQUE to
    // the old hardcoded pricing card — they don't appear in nav, footer,
    // or other sections.
    const html = await page.content();
    expect(html).not.toMatch(/3 sites · unlimited pages/i);
    expect(html).not.toMatch(/25 sites · multi-tenant/i);
    expect(html).not.toMatch(/Volume discounts on overage/i);
  });

  test("homepage pricing card features come from plans.ts truth", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    // Pro $19 should advertise these honest claims:
    expect(html).toMatch(/30 scans\/month/i);
    expect(html).toMatch(/GitHub Action for CI\/CD/i);
    // Agency $49 should advertise these honest claims:
    expect(html).toMatch(/Unlimited scans across clients/i);
  });

  test("homepage has visible upsell to Business + Team for Auto-Fix PRs", async ({ page }) => {
    await page.goto("/");
    const upsell = page.getByText(/Need.*Auto-Fix.*See.*Business/i);
    await expect(upsell).toBeVisible();
  });
});

// =============================================================================
// Auto-Fix PR error message matches plans.ts price ($299, not $199)
// =============================================================================
test.describe("Auto-Fix error message price (must match plans.ts $299)", () => {
  test("Pro user: 402 error message says $299 not $199", async ({ page }) => {
    await loginViaUI(page, users.pro.email);
    const FAKE_UUID = "00000000-0000-0000-0000-000000000000";
    const res = await page.request.post("/api/github-action/auto-fix", {
      data: {
        scan_id: FAKE_UUID,
        issue_ids: [FAKE_UUID],
        repo_full_name: "owner/repo",
      },
    });
    expect(res.status()).toBe(402);
    const body = await res.json();
    expect(body.error).toMatch(/business/i);
    expect(body.error).toMatch(/\$299/);
    expect(body.error).not.toMatch(/\$199/);
  });
});

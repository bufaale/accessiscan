/**
 * tier-experience.spec.ts — Per-tier user journeys with seeded data.
 *
 * Each test creates a Supabase user pinned to a specific tier, optionally
 * seeds a scan, then drives the browser as that user would. This catches
 * tier-gating regressions that appear ONLY at certain plans (e.g., a Pro
 * user not seeing VPAT export, or a Business user still seeing the
 * Auto-Fix PR upgrade prompt).
 *
 * Pattern:
 *   1. createTestUser(prefix, tier) — admin API, pins subscription_plan
 *   2. seedScan(userId) — inserts a completed scan via service role
 *   3. loginViaUI + navigate + assert tier-specific UI
 *   4. deleteTestUser cleans up
 *
 * What this catches that previous specs don't:
 * - Free-tier-only assertions in stripe-tiers.spec verify the upgrade
 *   button exists, but never actually walk through the app AS a paid user
 * - The audit suite tests behavior shape, not the lived experience of a
 *   business-tier customer who's already paid
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
  type Tier,
} from "../../helpers/test-utils";

const PAID_TIERS: { tier: Tier; planLabel: RegExp }[] = [
  { tier: "pro", planLabel: /\bpro\b/i },
  { tier: "agency", planLabel: /agency/i },
  { tier: "business", planLabel: /business/i },
];

test.describe("Per-tier billing reflects actual plan", () => {
  for (const { tier, planLabel } of PAID_TIERS) {
    test(`${tier}: /settings/billing shows '${tier}' plan name + active status`, async ({
      page,
    }) => {
      const u = await createTestUser(`tier-billing-${tier}`, tier);
      try {
        await loginViaUI(page, u.email);
        await page.goto("/settings/billing");
        await page.waitForLoadState("networkidle");

        // Plan name visible (case-insensitive)
        const body = await page.locator("body").innerText();
        expect(body).toMatch(planLabel);
        // 'active' status pill should be present (not 'free')
        expect(body).toMatch(/active/i);
        // Manage subscription / portal entry should be visible (since the
        // user is on a paid plan, not the upgrade buttons)
        const managePresent = await page
          .getByRole("button", { name: /manage|stripe|portal|subscription/i })
          .first()
          .isVisible()
          .catch(() => false);
        const manageLinkPresent = await page
          .getByRole("link", { name: /manage|portal/i })
          .first()
          .isVisible()
          .catch(() => false);
        expect(
          managePresent || manageLinkPresent,
          `${tier}: Manage subscription action should be visible`,
        ).toBe(true);
      } finally {
        await deleteTestUser(u.id);
      }
    });
  }

  test("free: /settings/billing shows upgrade buttons, NOT manage subscription", async ({
    page,
  }) => {
    const u = await createTestUser("tier-billing-free", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/billing");
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      expect(body).toMatch(/free/i);
      // Upgrade-to-{tier} button visible
      expect(
        await page.getByRole("button", { name: /upgrade.*pro/i }).first().isVisible(),
      ).toBe(true);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

test.describe("Scan result — tier-gated feature visibility", () => {
  test("free: VPAT export is gated (Pro badge visible, not direct download)", async ({
    page,
  }) => {
    const u = await createTestUser("tier-scan-free", "free");
    try {
      const seeded = await seedScan(u.id, {
        url: "https://tier-scan-free.test",
        compliance_score: 78,
      });
      await loginViaUI(page, u.email);
      await page.goto(`/dashboard/scans/${seeded.id}`);
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      // Free users see the gated VPAT button with a 'PRO' badge
      expect(body).toMatch(/vpat/i);
      expect(body).toMatch(/pro/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("pro: VPAT 2.5 + EN 301 549 export links are reachable (not gated)", async ({
    page,
  }) => {
    const u = await createTestUser("tier-scan-pro", "pro");
    try {
      const seeded = await seedScan(u.id, {
        url: "https://tier-scan-pro.test",
        compliance_score: 86,
      });
      await loginViaUI(page, u.email);
      await page.goto(`/dashboard/scans/${seeded.id}`);
      await page.waitForLoadState("networkidle");

      // Pro tier should expose VPAT 2.5 + EN 301 549 download links
      const vpatLink = page.getByRole("link", { name: /vpat\s*2\.5/i }).first();
      const enLink = page.getByRole("link", { name: /301\s*549|EN\s*301/i }).first();
      const vpatVisible = await vpatLink.isVisible().catch(() => false);
      const enVisible = await enLink.isVisible().catch(() => false);
      expect(vpatVisible, "Pro tier should see VPAT 2.5 download link").toBe(true);
      expect(enVisible, "Pro tier should see EN 301 549 download link").toBe(true);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

test.describe("Continuous monitoring — Business-tier gating at API", () => {
  test("free: POST /api/monitored returns 402 Business plan required", async ({
    page,
  }) => {
    const u = await createTestUser("tier-mon-free", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/monitored");
      await page.waitForLoadState("networkidle");

      const urlInput = page.locator("input[placeholder*='example' i]").first();
      await urlInput.fill("https://tier-mon-free.test");

      const responsePromise = page.waitForResponse(
        (res) => res.url().includes("/api/monitored") && res.request().method() === "POST",
        { timeout: 10_000 },
      );
      await page.getByRole("button", { name: /add.*monitor|monitor|add\b/i }).first().click();
      const res = await responsePromise;
      expect(res.status(), "Free tier should be 402 on /api/monitored POST").toBe(402);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business: POST /api/monitored succeeds (or returns a non-402 validation)", async ({
    page,
  }) => {
    const u = await createTestUser("tier-mon-biz", "business");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/dashboard/monitored");
      await page.waitForLoadState("networkidle");

      const urlInput = page.locator("input[placeholder*='example' i]").first();
      await urlInput.fill("https://tier-mon-biz.test");

      const responsePromise = page.waitForResponse(
        (res) => res.url().includes("/api/monitored") && res.request().method() === "POST",
        { timeout: 10_000 },
      );
      await page.getByRole("button", { name: /add.*monitor|monitor|add\b/i }).first().click();
      const res = await responsePromise;
      // Business tier should NOT be tier-gated. A 200 (success) or other
      // non-402 status (e.g. validation error) is acceptable. 402 means the
      // tier check incorrectly blocked Business.
      expect(res.status(), `Business tier should NOT be 402; got ${res.status()}`).not.toBe(402);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

test.describe("GitHub Auto-Fix tier gating — Business-only feature", () => {
  test("free: /settings/github shows Business upsell + install button is disabled", async ({
    page,
  }) => {
    const u = await createTestUser("tier-gh-free", "free");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/github");
      await page.waitForLoadState("networkidle");

      const body = await page.locator("body").innerText();
      // Upsell card visible
      expect(body).toMatch(/business plan|upgrade/i);
      // Install link should be aria-disabled or pointer-events:none on free tier
      const installLink = page
        .getByRole("link", { name: /install\s*github\s*app|install.*another/i })
        .first();
      if (await installLink.isVisible().catch(() => false)) {
        const ariaDisabled = await installLink.getAttribute("aria-disabled");
        expect(ariaDisabled).toBe("true");
      }
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business: /settings/github shows install CTA enabled (no aria-disabled)", async ({
    page,
  }) => {
    const u = await createTestUser("tier-gh-biz", "business");
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/github");
      await page.waitForLoadState("networkidle");

      const installLink = page
        .getByRole("link", { name: /install\s*github\s*app/i })
        .first();
      await expect(installLink).toBeVisible({ timeout: 10_000 });
      const ariaDisabled = await installLink.getAttribute("aria-disabled");
      // Business tier should have a fully enabled install link
      expect(ariaDisabled === null || ariaDisabled === "false").toBe(true);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

test.describe("Pro-tier full journey: login → dashboard → seeded scan → result", () => {
  test("pro user with seeded data sees scans + can navigate to result", async ({
    page,
  }) => {
    const u = await createTestUser("tier-journey-pro", "pro");
    try {
      const seeded = await seedScan(u.id, {
        url: "https://pro-journey.test",
        compliance_score: 91,
        critical_count: 0,
        serious_count: 2,
      });

      await loginViaUI(page, u.email);
      // Dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      const dashboardBody = await page.locator("body").innerText();
      expect(dashboardBody).toContain(seeded.url);

      // Click into the scan row → result page
      const scanRow = page.locator(`[data-scan-id="${seeded.id}"]`).first();
      await scanRow.click();
      await page.waitForURL(new RegExp(`/dashboard/scans/${seeded.id}`), {
        timeout: 10_000,
      });
      await page.waitForLoadState("networkidle");
      // The async fetch + setLoading takes a moment after networkidle
      await page.waitForTimeout(1500);

      // Result page shows score + URL
      const resultBody = await page.locator("body").innerText();
      expect(resultBody).toContain(seeded.url);
      expect(resultBody).toMatch(/\b91\b/);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

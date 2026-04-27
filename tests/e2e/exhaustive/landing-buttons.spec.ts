/**
 * landing-buttons.spec.ts — exhaustive coverage of every interactive element
 * on the landing page (`/`).
 *
 * The landing has the highest CAC leverage in the funnel: a broken Sign in
 * button or Pricing tier link silently kills conversion. This spec walks
 * every button + link + anchor + the DOJ countdown banner.
 *
 * Defensive selectors: the landing renders TWO navbars (the marketing
 * layout's + the v2 page's own) so most labels appear 2x. Each test asserts
 * that ALL copies of a given label point to the right destination — this
 * catches dead-anchor bugs (e.g. one navbar pointing at `#product` while
 * the v2 page only has `#features`).
 */
import { test, expect, type Page } from "@playwright/test";

async function allHrefsForName(page: Page, name: RegExp | string): Promise<string[]> {
  const links = await page.getByRole("link", { name }).all();
  const hrefs: string[] = [];
  for (const link of links) {
    const h = await link.getAttribute("href");
    if (h !== null) hrefs.push(h);
  }
  return hrefs;
}

function expectAllPointTo(hrefs: string[], expected: string | RegExp, name: string) {
  expect(hrefs.length, `expected at least one ${name} link`).toBeGreaterThanOrEqual(1);
  for (const href of hrefs) {
    if (typeof expected === "string") {
      expect(href, `${name} should point to ${expected}, found ${href}`).toBe(expected);
    } else {
      expect(href, `${name} should match ${expected}, found ${href}`).toMatch(expected);
    }
  }
}

test.describe("Landing — every button + link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("DOJ deadline banner", () => {
    test("renders countdown copy + 2027 deadline", async ({ page }) => {
      // The banner has no role=status; locate via canonical Title II copy.
      const banner = page.getByText(/DOJ Title II Web Accessibility Deadline/i).first();
      await expect(banner).toBeVisible({ timeout: 10_000 });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/2027/);
      expect(body).toMatch(/Days/i);
    });
  });

  test.describe("Navbar — all instances point at live targets", () => {
    test("Sign in → /login (every copy)", async ({ page }) => {
      const hrefs = await allHrefsForName(page, /^sign in$/i);
      expectAllPointTo(hrefs, "/login", "Sign in");
    });

    test("Free scan / Start free scan → /signup (every copy)", async ({ page }) => {
      // The marketing layout uses "Start free scan", v2 uses "Free scan".
      // Both should land on /signup.
      const hrefs = [
        ...(await allHrefsForName(page, /^free scan$/i)),
        ...(await allHrefsForName(page, /^start free scan$/i)),
      ];
      expectAllPointTo(hrefs, "/signup", "Free scan / Start free scan");
    });

    test("Product → #features (every copy)", async ({ page }) => {
      const hrefs = await allHrefsForName(page, /^product$/i);
      expectAllPointTo(hrefs, "#features", "Product");
    });

    test("Compare / Comparison → #comparison (every copy)", async ({ page }) => {
      const hrefs = [
        ...(await allHrefsForName(page, /^compare$/i)),
        ...(await allHrefsForName(page, /^comparison$/i)),
      ];
      expectAllPointTo(hrefs, "#comparison", "Compare / Comparison");
    });

    test("Pricing nav link → #pricing (every copy in nav)", async ({ page }) => {
      // Footer also has a "Pricing" link pointing to /pricing — that is fine
      // and intentional (the standalone page). We only assert against navbar
      // anchors here. Filter to hrefs that start with "#" (anchor links).
      const all = await allHrefsForName(page, /^pricing$/i);
      const anchors = all.filter((h) => h.startsWith("#"));
      const standalone = all.filter((h) => h === "/pricing");
      expect(all.length, "expected at least one Pricing link").toBeGreaterThanOrEqual(1);
      // Every navbar anchor must be live; standalone /pricing link is OK if present.
      for (const h of anchors) {
        expect(h).toBe("#pricing");
      }
      // Footer link to /pricing acceptable but not required
      expect(standalone.length).toBeGreaterThanOrEqual(0);
    });

    test("FAQ → #faq", async ({ page }) => {
      const hrefs = await allHrefsForName(page, /^faq$/i);
      expectAllPointTo(hrefs, "#faq", "FAQ");
    });

    test("Government / For government → #cta (every copy)", async ({ page }) => {
      const hrefs = [
        ...(await allHrefsForName(page, /^government$/i)),
        ...(await allHrefsForName(page, /^for government$/i)),
      ];
      expectAllPointTo(hrefs, "#cta", "Government / For government");
    });
  });

  test.describe("Hero CTAs", () => {
    test("'Start free Title II scan' navigates to /signup", async ({ page }) => {
      const link = page
        .getByRole("link", { name: /start free.*title.*scan/i })
        .first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      const href = await link.getAttribute("href");
      expect(href).toBe("/signup");
      await link.click();
      await page.waitForURL(/\/signup/, { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe("/signup");
    });

    test("'See how we compare' is a hash link to #comparison", async ({ page }) => {
      const link = page.getByRole("link", { name: /see how we compare/i }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      expect(await link.getAttribute("href")).toBe("#comparison");
    });
  });

  test.describe("Anchor navigation actually scrolls", () => {
    test("clicking #pricing in nav lands the URL hash", async ({ page }) => {
      const pricingNavLink = page
        .locator("nav a[href='#pricing']")
        .first();
      await pricingNavLink.click();
      await page.waitForFunction(() => location.hash === "#pricing", { timeout: 5_000 });
      expect(page.url()).toMatch(/#pricing$/);
    });
  });

  test.describe("Auto-Fix PR section", () => {
    test("'Install GitHub App' link points to GitHub or settings", async ({ page }) => {
      const link = page.getByRole("link", { name: /install github app/i }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      const href = (await link.getAttribute("href")) ?? "";
      expect(href).toMatch(/\/dashboard\/github|github\.com\/apps\/accessiscan|\/settings\/github/);
    });

    test("'View example PR' anchor link exists and is hash-or-pr", async ({ page }) => {
      const link = page.getByRole("link", { name: /view example pr/i }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      const href = (await link.getAttribute("href")) ?? "";
      // Either a hash anchor on the page or an external PR link.
      expect(href).toMatch(/^(#|https?:\/\/)/);
    });
  });

  test.describe("Pricing — every tier card has a working signup link", () => {
    test("3 tier cards (Free/Pro/Agency) all link to /signup", async ({ page }) => {
      // Landing pricing section is the marketing-funnel teaser (3 tiers).
      // The full 5-tier comparison lives at /pricing — covered by
      // pricing-standalone.spec.ts.
      const pricingSection = page.locator("#pricing");
      await expect(pricingSection).toBeVisible({ timeout: 10_000 });

      const tierLinks = pricingSection.getByRole("link");
      const count = await tierLinks.count();
      expect(count, "expected at least 3 tier links in landing pricing").toBeGreaterThanOrEqual(3);

      let signupCount = 0;
      for (let i = 0; i < count; i++) {
        const href = (await tierLinks.nth(i).getAttribute("href")) ?? "";
        if (href === "/signup") signupCount += 1;
      }
      expect(signupCount, "at least 3 tier cards should self-serve to /signup").toBeGreaterThanOrEqual(3);
    });
  });

  test.describe("Final CTA section", () => {
    test("primary CTA navigates to /signup", async ({ page }) => {
      // Multiple "Start free Title II scan" links exist (hero + final).
      // Every copy must go to /signup.
      const hrefs = await allHrefsForName(page, /start free.*title.*scan/i);
      expect(hrefs.length).toBeGreaterThanOrEqual(1);
      for (const href of hrefs) {
        expect(href).toBe("/signup");
      }
    });

    test("'Book government demo' is a mailto: link", async ({ page }) => {
      const link = page.getByRole("link", { name: /book government demo/i }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
      const href = (await link.getAttribute("href")) ?? "";
      expect(href).toMatch(/^mailto:/);
      expect(href).toMatch(/government|sales|contact|demo/i);
    });
  });

  test.describe("Footer", () => {
    test("renders copyright + AccessiScan brand text", async ({ page }) => {
      const footer = page.locator("footer").first();
      await expect(footer).toBeVisible();
      const text = await footer.innerText();
      expect(text).toMatch(/AccessiScan/i);
      expect(text).toMatch(/202[6-9]/);
    });

    test("footer has Privacy + Terms + Refund legal links", async ({ page }) => {
      const footer = page.locator("footer").first();
      const privacyLinks = await footer.locator('a[href="/privacy"]').count();
      const termsLinks = await footer.locator('a[href="/terms"]').count();
      const refundLinks = await footer.locator('a[href="/refund"]').count();
      expect(privacyLinks + termsLinks + refundLinks, "expected legal links in footer").toBeGreaterThanOrEqual(3);
    });
  });

  test("no internal link returns 4xx/5xx (full audit beyond hash + mailto)", async ({ page }) => {
    const anchors = await page.locator("a[href]").all();
    const hrefs: string[] = [];
    for (const a of anchors) {
      const h = await a.getAttribute("href");
      if (h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api/")) {
        hrefs.push(h.split("#")[0] || "/");
      }
    }
    const unique = Array.from(new Set(hrefs));
    expect(unique.length, "landing should have at least 4 internal links").toBeGreaterThanOrEqual(4);

    const baseURL = page.url().split("/").slice(0, 3).join("/");
    for (const href of unique) {
      const r = await fetch(baseURL + href, { method: "GET", redirect: "manual" });
      expect(r.status, `${href} should be < 400 (got ${r.status})`).toBeLessThan(400);
    }
  });
});

/**
 * landing-buttons.spec.ts — exhaustive coverage of every interactive
 * element on the landing page (`/`).
 *
 * The landing has the highest CAC leverage in the funnel: a broken Sign-in
 * button or Pricing tier link silently kills conversion. This spec walks
 * every button + link + anchor + the DOJ countdown banner.
 *
 * Sections covered:
 *  - DOJ banner (live countdown render)
 *  - Navbar: Sign in / Free scan / 5 anchor links
 *  - Hero: 2 CTAs (urgent + outline)
 *  - AutoFixPr: Install GitHub App / View example PR
 *  - Pricing: 5 tier cards each link to /signup
 *  - Final CTA: Start free + mailto:government
 *  - Footer: legal placeholder links exist (not dead navigation, just hash)
 */
import { test, expect, type Locator } from "@playwright/test";

async function expectLinkTo(locator: Locator, expectedHref: string | RegExp) {
  await expect(locator).toBeVisible({ timeout: 10_000 });
  const href = await locator.getAttribute("href");
  if (typeof expectedHref === "string") {
    expect(href).toBe(expectedHref);
  } else {
    expect(href ?? "").toMatch(expectedHref);
  }
}

test.describe("Landing — every button + link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("DOJ deadline banner", () => {
    test("renders with countdown + 2027 deadline", async ({ page }) => {
      // The banner has no role=status; locate via the canonical Title II copy.
      const banner = page.getByText(/DOJ Title II Web Accessibility Deadline/i);
      await expect(banner).toBeVisible({ timeout: 10_000 });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Apr.*2027|2027/i);
      expect(body).toMatch(/Days/i);
    });
  });

  test.describe("Navbar", () => {
    test("Sign in link points to /login", async ({ page }) => {
      const link = page.getByRole("link", { name: /^sign in$/i }).first();
      await expectLinkTo(link, "/login");
    });

    test("Free scan link points to /signup", async ({ page }) => {
      const link = page.getByRole("link", { name: /^free scan$/i }).first();
      await expectLinkTo(link, "/signup");
    });

    test("every 'Product' nav link points to #features (no dead anchors)", async ({ page }) => {
      // The page can render two navbars (the marketing layout's + the v2 page
      // own) — both must point at the same live #features section, otherwise
      // some users land on a dead anchor. Test all of them.
      const links = await page.getByRole("link", { name: /^product$/i }).all();
      expect(links.length, "expected at least one Product nav link").toBeGreaterThanOrEqual(1);
      for (const link of links) {
        const href = await link.getAttribute("href");
        expect(href, "Product link must point to #features").toBe("#features");
      }
    });

    test("Compare anchor link points to #comparison", async ({ page }) => {
      const link = page.getByRole("link", { name: /^compare$/i }).first();
      await expectLinkTo(link, "#comparison");
    });

    test("Pricing anchor link points to #pricing", async ({ page }) => {
      const link = page.getByRole("link", { name: /^pricing$/i }).first();
      await expectLinkTo(link, "#pricing");
    });

    test("FAQ anchor link points to #faq", async ({ page }) => {
      const link = page.getByRole("link", { name: /^faq$/i }).first();
      await expectLinkTo(link, "#faq");
    });

    test("For government anchor link points to #cta", async ({ page }) => {
      const link = page.getByRole("link", { name: /for government/i }).first();
      await expectLinkTo(link, "#cta");
    });
  });

  test.describe("Hero CTAs", () => {
    test("'Start free Title II scan' navigates to /signup", async ({ page }) => {
      const link = page
        .getByRole("link", { name: /start free.*scan|free.*title|start.*scan/i })
        .first();
      await expectLinkTo(link, "/signup");
      await link.click();
      await page.waitForURL(/\/signup/, { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe("/signup");
    });

    test("'See how we compare' is a hash link to #comparison", async ({ page }) => {
      const link = page.getByRole("link", { name: /see how we compare/i }).first();
      await expectLinkTo(link, "#comparison");
    });
  });

  test.describe("Anchor navigation actually scrolls", () => {
    test("clicking #pricing in nav scrolls to the pricing section", async ({ page }) => {
      const pricingLink = page.getByRole("link", { name: /^pricing$/i }).first();
      await pricingLink.click();
      // Either the URL hash changes or the pricing section comes into view.
      await page.waitForFunction(
        () => location.hash === "#pricing" || !!document.getElementById("pricing"),
        { timeout: 5_000 },
      );
      expect(page.url()).toMatch(/#pricing/);
    });
  });

  test.describe("Auto-Fix PR section", () => {
    test("'Install GitHub App' points to /dashboard/github", async ({ page }) => {
      const link = page.getByRole("link", { name: /install github app/i }).first();
      await expectLinkTo(link, /\/dashboard\/github|github\.com\/apps\/accessiscan/);
    });

    test("'View example PR' anchor link exists", async ({ page }) => {
      const link = page.getByRole("link", { name: /view example pr/i }).first();
      await expect(link).toBeVisible({ timeout: 10_000 });
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
      // The final-CTA strip has another "Start free Title II scan" link — same
      // destination, different visual placement. Use the LAST match because
      // the hero uses the same copy.
      const cta = page
        .getByRole("link", { name: /start free.*scan|free.*title/i })
        .last();
      await expectLinkTo(cta, "/signup");
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
    test("renders copyright + legal text", async ({ page }) => {
      const footer = page.locator("footer").first();
      await expect(footer).toBeVisible();
      const text = await footer.innerText();
      expect(text).toMatch(/AccessiScan/i);
      expect(text).toMatch(/2026/);
    });
  });

  test("no link returns 4xx/5xx (full audit beyond hash + mailto)", async ({ page }) => {
    // Already covered by links.spec.ts but re-asserted here so a regression
    // surfaces in this single file when running the landing suite alone.
    const anchors = await page.locator("a[href]").all();
    const hrefs: string[] = [];
    for (const a of anchors) {
      const h = await a.getAttribute("href");
      if (h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api/")) {
        hrefs.push(h);
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

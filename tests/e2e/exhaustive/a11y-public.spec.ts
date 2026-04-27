/**
 * a11y-public.spec.ts — runs axe-core (the same engine our scanner uses) against
 * EVERY public route to verify AccessiScan eats its own dog food.
 *
 * Sells the product. We market WCAG 2.1 AA compliance. If our marketing site
 * fails axe-core, the demo screenshot a prospect takes shows that.
 *
 * Tag scope: 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa' — matches the
 * AA-level claim the scanner makes against customer sites.
 *
 * Severity gate: assertion fails on `critical` and `serious` violations.
 * `moderate` and `minor` are reported but not blocking — those are stylistic
 * fixes that should not block prod deploys for the marketing site.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/refund",
  "/why-not-overlays",
  "/overlay-detector",
  "/free/wcag-scanner",
  "/blog",
];

const A11Y_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("AccessiScan eats its own dog food — axe-core on every public route", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} — zero critical or serious WCAG 2.1 AA violations`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(A11Y_TAGS)
        // Disable rules we cannot reasonably fix on third-party widgets:
        // - color-contrast on Stripe-injected elements (they own those styles)
        // We still keep contrast checks on OUR markup.
        .disableRules([])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      if (blocking.length > 0) {
        const summary = blocking
          .map(
            (v) =>
              `  - [${v.impact}] ${v.id} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}): ${v.help}\n    selector: ${v.nodes[0]?.target.join(", ") ?? "?"}`,
          )
          .join("\n");
        // Surface the full list in the test failure output, not just the count.
        expect(
          blocking.length,
          `${route} has ${blocking.length} critical/serious WCAG violations:\n${summary}`,
        ).toBe(0);
      }

      // Always log moderate/minor counts so we have visibility without
      // blocking. Test still passes on these.
      const moderate = results.violations.filter((v) => v.impact === "moderate").length;
      const minor = results.violations.filter((v) => v.impact === "minor").length;
      if (moderate > 0 || minor > 0) {
        // eslint-disable-next-line no-console
        console.log(`[a11y] ${route}: ${moderate} moderate, ${minor} minor (non-blocking)`);
      }
    });
  }
});

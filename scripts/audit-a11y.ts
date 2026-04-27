/**
 * audit-a11y.ts — one-shot diagnostic that runs axe-core against every public
 * route and dumps a per-violation breakdown so we can prioritise fixes.
 *
 * Usage:  npx tsx scripts/audit-a11y.ts > a11y-report.txt
 */
import { chromium, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.TEST_BASE_URL ?? "https://app-04-ada-scanner.vercel.app";
const ROUTES = [
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

async function audit(page: Page, route: string) {
  await page.goto(BASE + route);
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return r.violations;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  console.log(`\n=== AccessiScan a11y audit — ${BASE} ===\n`);

  const byRule = new Map<string, { impact: string; help: string; count: number; routes: Set<string> }>();
  for (const route of ROUTES) {
    try {
      const violations = await audit(page, route);
      const blocking = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      console.log(`${route.padEnd(28)} ${blocking.length} blocking, ${violations.length - blocking.length} non-blocking`);
      for (const v of violations) {
        if (v.impact !== "critical" && v.impact !== "serious") continue;
        const cur = byRule.get(v.id) ?? { impact: v.impact ?? "?", help: v.help, count: 0, routes: new Set() };
        cur.count += v.nodes.length;
        cur.routes.add(route);
        byRule.set(v.id, cur);
      }
    } catch (e) {
      console.log(`${route.padEnd(28)} [error] ${(e as Error).message}`);
    }
  }

  console.log(`\n=== Top blocking violations across all routes ===\n`);
  const sorted = Array.from(byRule.entries()).sort((a, b) => b[1].count - a[1].count);
  for (const [rule, info] of sorted) {
    console.log(`[${info.impact}] ${rule}: ${info.count} nodes across ${info.routes.size} routes`);
    console.log(`  ${info.help}`);
    console.log(`  routes: ${Array.from(info.routes).join(", ")}\n`);
  }

  await browser.close();
})();

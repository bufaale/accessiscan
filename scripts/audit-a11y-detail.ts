import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  // A11Y_PATH is intentionally without leading slash to dodge Git Bash's
  // path mangling on Windows. We add the slash here.
  const path = process.env.A11Y_PATH ?? "";
  await page.goto("https://app-04-ada-scanner.vercel.app/" + path.replace(/^\//, ""));
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze();
  for (const v of r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")) {
    console.log(`\n[${v.impact}] ${v.id}: ${v.nodes.length} nodes`);
    for (const node of v.nodes.slice(0, 5)) {
      console.log(`  selector: ${node.target.join(", ")}`);
      console.log(`  html: ${node.html.slice(0, 200)}`);
      console.log(`  failure: ${node.failureSummary?.split("\n").slice(0, 3).join(" | ")}`);
    }
    if (v.nodes.length > 5) console.log(`  ... ${v.nodes.length - 5} more`);
  }
  await browser.close();
})();

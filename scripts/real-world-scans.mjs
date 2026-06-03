/**
 * Phase 4: Real-world WCAG scans against actual public-sector sites.
 * Verifies the scanner doesn't time out, doesn't crash, returns
 * realistic violations on sites that have real accessibility debt.
 *
 * Targets the IH post audience: US city .gov + state .gov + .edu + federal.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "https://accessiscan.piposlab.com";
const OUT = "c:/Projects/apps-portfolio/fotos-verificar/accessiscan-real-world-scans";
mkdirSync(OUT, { recursive: true });

const TARGETS = [
  { url: "https://www.boston.gov", label: "city-boston-gov", category: "US city .gov (Title II target)" },
  { url: "https://www.mass.gov", label: "state-mass-gov", category: "US state .gov" },
  { url: "https://www.mit.edu", label: "edu-mit", category: "US private university .edu" },
  { url: "https://www.berkeley.edu", label: "edu-berkeley", category: "US public university .edu (Title II target)" },
  { url: "https://www.nih.gov", label: "federal-nih-gov", category: "US federal .gov" },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const results = [];

for (const t of TARGETS) {
  console.log(`\n=== ${t.label} (${t.category}) ===`);
  console.log(`  URL: ${t.url}`);
  const t0 = Date.now();
  let outcome = { label: t.label, url: t.url, category: t.category, status: "?" };

  try {
    await page.goto(`${BASE}/free/wcag-scanner`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    const urlInput = page.getByPlaceholder(/example\.com|https:|enter URL/i).first();
    await urlInput.fill(t.url);

    const scanBtn = page.getByRole("button", { name: /scan|start/i }).first();
    await scanBtn.click();

    // Wait for scan completion — the result page shows a score number 0-100
    // and a "violations" / "issues" / "criteria" word. Cap at 60s (Vercel
    // function timeout). Accept either the new full-result page or
    // "scan complete" inline state.
    let success = false;
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      // Look for any score or "complete" indicator
      const hasScore = await page
        .locator(":text-matches('\\\\d+\\\\s*/\\\\s*100|Score:|score:|complete|completed')")
        .count()
        .catch(() => 0);
      if (hasScore > 0) {
        success = true;
        break;
      }
      await page.waitForTimeout(1500);
    }

    const elapsed = Date.now() - t0;
    outcome.elapsed_ms = elapsed;
    outcome.success = success;
    outcome.status = success ? "OK" : "TIMEOUT";
    outcome.final_url = page.url();

    if (success) {
      // Pull the score and violation count from the page
      const scoreText = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      const scoreMatch = scoreText.match(/(\d+)\s*\/\s*100/);
      outcome.score = scoreMatch ? parseInt(scoreMatch[1]) : null;

      // Count violation cards (rough — just look for WCAG criterion patterns)
      const wcagMatches = scoreText.match(/\b\d\.\d\.\d+\b/g);
      outcome.wcag_criteria_mentioned = wcagMatches ? new Set(wcagMatches).size : 0;
      console.log(`  ✓ ${elapsed}ms · score=${outcome.score}/100 · ${outcome.wcag_criteria_mentioned} WCAG criteria mentioned`);
    } else {
      console.log(`  ✗ TIMEOUT after ${elapsed}ms`);
    }

    await page.screenshot({ path: `${OUT}/${t.label}.png`, fullPage: true });
  } catch (err) {
    outcome.status = "ERROR";
    outcome.error = err.message.slice(0, 250);
    console.log(`  ✗ ${err.message.slice(0, 100)}`);
    await page.screenshot({ path: `${OUT}/${t.label}-FAIL.png`, fullPage: true }).catch(() => {});
  }

  results.push(outcome);
}

await browser.close();
writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));

const ok = results.filter((r) => r.status === "OK").length;
console.log(`\n=== Summary: ${ok}/${results.length} scans OK ===`);
for (const r of results) {
  console.log(`  ${r.status === "OK" ? "✓" : "✗"} ${r.label.padEnd(20)} ${r.status}${r.score !== undefined ? ` · score=${r.score}` : ""}${r.error ? ` · ${r.error.slice(0, 60)}` : ""}`);
}

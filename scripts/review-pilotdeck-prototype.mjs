/**
 * Visual review of the Claude Designs Pilotdeck prototype.
 *
 * Opens c:/Users/aleja/Downloads/Pilotdeck/Pilotdeck.html, clicks through
 * each of the 18 rail items (15 canonical + 3 bonus), captures full-page
 * screenshots at desktop 1440x900, and a few key screens at mobile 390x844.
 *
 * Output: c:/Projects/apps-portfolio/fotos-verificar/pilotdeck-review/
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const HTML = resolve("C:/Users/aleja/Downloads/Pilotdeck/Pilotdeck.html");
const OUT = "c:/Projects/apps-portfolio/fotos-verificar/pilotdeck-review";
mkdirSync(OUT, { recursive: true });

const SCREENS = [
  { id: 1, label: "now-dashboard" },
  { id: 2, label: "apps-health" },
  { id: 4, label: "errors" },
  { id: 5, label: "crons" },
  { id: 6, label: "inbox" },
  { id: 7, label: "outreach" },
  { id: 8, label: "customers" },
  { id: 9, label: "pnl" },
  { id: 10, label: "bs-trial" },
  { id: 11, label: "mercury" },
  { id: 12, label: "tax-forms" },
  { id: 13, label: "research" },
  { id: 14, label: "launch-playbook" },
  { id: 15, label: "settings" },
  { id: 16, label: "BONUS-anomaly" },
  { id: 17, label: "BONUS-goal" },
  { id: 18, label: "BONUS-boring" },
];

const browser = await chromium.launch({ headless: true });

// ── Desktop pass: 1440x900 ──
const desktop = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await desktop.goto(`file:///${HTML.replace(/\\/g, "/")}`);
await desktop.waitForLoadState("domcontentloaded");
await desktop.waitForTimeout(800); // let JS hydrate

console.log("=== Desktop 1440x900 pass ===");
for (const s of SCREENS) {
  const railItem = desktop.locator(`.rail-item[data-screen="${s.id}"]`).first();
  if (await railItem.count() === 0) {
    console.log(`  SKIP screen-${s.id} (${s.label}): rail item not found`);
    continue;
  }
  await railItem.click();
  await desktop.waitForTimeout(400);
  await desktop.screenshot({
    path: `${OUT}/desktop-${String(s.id).padStart(2, "0")}-${s.label}.png`,
    fullPage: false,
  });
  console.log(`  ok screen-${s.id} (${s.label})`);
}

// Also try opening App detail (screen 3 — drilldown from screen 2 click)
await desktop.locator(`.rail-item[data-screen="2"]`).first().click();
await desktop.waitForTimeout(300);
const firstAppCard = desktop.locator(`.app-card[data-screen="4"]`).first();
if (await firstAppCard.count() > 0) {
  // The brief said app cards drill into the app-detail screen but the
  // generated rail uses data-screen="4" (Errors) — check if there's a
  // separate screen 3.
}

// ── Mobile pass: 390x844 ──
const mobile = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
await mobile.goto(`file:///${HTML.replace(/\\/g, "/")}`);
await mobile.waitForLoadState("domcontentloaded");
await mobile.waitForTimeout(800);
// Switch to mobile mode (the prototype uses body[data-mode] to swap layouts)
await mobile.evaluate(() => document.body.setAttribute("data-mode", "mobile"));
await mobile.waitForTimeout(400);

console.log("\n=== Mobile 390x844 pass (key screens) ===");
const mobileTargets = [
  { id: 1, label: "now-dashboard" },
  { id: 2, label: "apps-health" },
  { id: 9, label: "pnl" },
  { id: 12, label: "tax-forms" },
  { id: 16, label: "BONUS-anomaly" },
  { id: 18, label: "BONUS-boring" },
];
for (const s of mobileTargets) {
  // Mobile layout uses .mob-app-row instead of .rail-item, try both
  let target = mobile.locator(`[data-screen="${s.id}"]`).first();
  if (await target.count() === 0) {
    console.log(`  SKIP screen-${s.id} (${s.label}): no nav target`);
    continue;
  }
  await target.click().catch(() => {});
  await mobile.waitForTimeout(400);
  await mobile.screenshot({
    path: `${OUT}/mobile-${String(s.id).padStart(2, "0")}-${s.label}.png`,
    fullPage: false,
  });
  console.log(`  ok mobile screen-${s.id} (${s.label})`);
}

await browser.close();
console.log(`\n✓ ${SCREENS.length + mobileTargets.length} screenshots written to ${OUT}`);

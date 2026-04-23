#!/usr/bin/env node
// Capture Product Hunt gallery screenshots for the 3 launch apps.
// Usage: node .shared/capture_gallery.mjs
// Outputs to .shared/launch/gallery/{app}/{NN-name}.png

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(__dirname, "..", "..", ".shared", "launch", "gallery");

const VIEWPORT = { width: 1440, height: 900 };

const targets = {
  accessiscan: {
    base: "https://app-04-ada-scanner.vercel.app",
    shots: [
      { file: "01-hero", path: "/", anchor: null },
      { file: "02-product", path: "/", anchor: "#product" },
      { file: "03-government", path: "/", anchor: "#government" },
      { file: "04-pricing", path: "/", anchor: "#pricing" },
      { file: "05-overlay-detector", path: "/overlay-detector", anchor: null },
    ],
  },
  callspark: {
    base: "https://app-02-voice-agent.vercel.app",
    shots: [
      { file: "01-hero", path: "/", anchor: null },
      { file: "02-features", path: "/", anchor: "#features" },
      { file: "03-comparison", path: "/", anchor: "#comparison" },
      { file: "04-pricing", path: "/", anchor: "#pricing" },
    ],
  },
  aicomply: {
    base: "https://app-16-aicomply.vercel.app",
    shots: [
      { file: "01-hero", path: "/", anchor: null },
      { file: "02-features", path: "/", anchor: "#features" },
      { file: "03-fria-generator", path: "/fria-generator", anchor: null },
      { file: "04-pricing", path: "/", anchor: "#pricing" },
      { file: "05-dpia-generator", path: "/dpia-generator", anchor: null },
    ],
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function captureApp(page, appName, cfg) {
  const outDir = join(OUT_ROOT, appName);
  await mkdir(outDir, { recursive: true });
  console.log(`\n=== ${appName} ===`);

  for (const shot of cfg.shots) {
    const url = cfg.base + shot.path;
    process.stdout.write(`  ${shot.file} <- ${url}${shot.anchor ?? ""} ... `);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      await sleep(1200);

      if (shot.anchor) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.scrollIntoView({ behavior: "instant", block: "start" });
            window.scrollBy(0, -20);
          }
        }, shot.anchor);
        await sleep(900);
      }

      const outFile = join(outDir, `${shot.file}.png`);
      await page.screenshot({
        path: outFile,
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      });
      console.log("ok");
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
    }
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const [name, cfg] of Object.entries(targets)) {
    await captureApp(page, name, cfg);
  }

  await browser.close();
  console.log(`\nDone. Gallery: ${OUT_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

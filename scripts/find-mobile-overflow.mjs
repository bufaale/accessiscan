/**
 * Identify which DOM element is causing horizontal overflow on mobile (390px).
 * Walks the body subtree, flags any element wider than the viewport.
 */
import { chromium } from "@playwright/test";

const URLS = [
  "https://accessiscan.piposlab.com/",
  "https://accessiscan.piposlab.com/pricing",
  "https://accessiscan.piposlab.com/free/wcag-scanner",
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();

for (const url of URLS) {
  console.log(`\n=== ${url} ===`);
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);

  const offenders = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Only flag elements whose RIGHT edge exceeds viewport width by more than 1px
      if (rect.right > w + 1) {
        // Skip elements whose offset is intentionally outside viewport (off-canvas drawer etc.)
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" && cs.transform !== "none") return;
        out.push({
          tag: el.tagName,
          id: el.id,
          classes: el.className?.toString().slice(0, 100) ?? "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflow_by: Math.round(rect.right - w),
          text_preview: (el.textContent ?? "").slice(0, 60).replace(/\s+/g, " ").trim(),
        });
      }
    });
    return { viewport_width: w, scroll_width: document.documentElement.scrollWidth, count: out.length, top10: out.slice(0, 10), worst: out.sort((a, b) => b.overflow_by - a.overflow_by)[0] };
  });

  console.log(`viewport=${offenders.viewport_width} scrollWidth=${offenders.scroll_width} offenders=${offenders.count}`);
  if (offenders.worst) {
    console.log(`WORST: ${offenders.worst.tag}.${offenders.worst.classes.slice(0, 60)}`);
    console.log(`  width=${offenders.worst.width} right=${offenders.worst.right} overflow_by=${offenders.worst.overflow_by}px`);
    console.log(`  text: "${offenders.worst.text_preview}"`);
  }
  console.log(`Top 5 offenders:`);
  for (const o of offenders.top10.slice(0, 5)) {
    console.log(`  ${o.tag}.${o.classes.slice(0, 50)} → +${o.overflow_by}px ("${o.text_preview.slice(0, 30)}")`);
  }
}

await browser.close();

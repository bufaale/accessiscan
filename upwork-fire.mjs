#!/usr/bin/env node
/**
 * upwork-fire.mjs — fire ONE Upwork proposal end-to-end via the logged-in CDP
 * browser (port 9222). Run FROM app-04-ada-scanner (playwright resolves there).
 * Usage: node upwork-fire.mjs <jobId ~0220...> <proposalFile> <bid>
 * Prints JSON: { ok, url, type, connects, flag, err }
 *
 * Hard-won gotchas baked in:
 *  - submit button text is sometimes "Submit proposal", sometimes "Send for N Connects"
 *  - the fixed-price "3 things" modal checkbox must be toggled by clicking its LABEL
 *    ("Yes, I understand."), not the <input> (React onChange)
 *  - rate-increase dropdown (hourly): select "Never" via type-ahead, verify, retry
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";

const [, , jobId, proposalFile, bidArg] = process.argv;
const bid = String(bidArg || "").replace(/[^0-9.]/g, "");
const proposal = readFileSync(proposalFile, "utf8").trim();

const b = await chromium.connectOverCDP("http://127.0.0.1:9222");
const ctx = b.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes("upwork.com")) || ctx.pages()[0];
await page.bringToFront();

const submitBtn = () => page.getByRole("button", { name: /Submit proposal|Send for/i }).first();

const out = { ok: false, type: "?" };
try {
  await page.goto(`https://www.upwork.com/nx/proposals/job/${jobId}/apply/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const pre = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      cf: /Just a moment|Cloudflare Ray/i.test(t),
      flag: /do not meet all the client.s preferred/i.test(t),
      hourly: !!document.querySelector("#step-rate"),
      connects: (t.match(/requires\s+(\d+)\s+Connects/i) || [])[1] || "?",
    };
  });
  out.connects = pre.connects;
  if (pre.cf) { out.err = "CF_BLOCKED"; console.log(JSON.stringify(out)); await b.close(); process.exit(0); }
  if (pre.flag) { out.err = "QUALIFICATION_FLAG"; console.log(JSON.stringify(out)); await b.close(); process.exit(0); }
  out.type = pre.hourly ? "hourly" : "fixed";

  if (pre.hourly) {
    const rate = page.locator("#step-rate");
    await rate.click(); await rate.fill(bid);
    const ta = page.locator("textarea").first();
    await ta.scrollIntoViewIfNeeded(); await ta.click(); await page.keyboard.type(proposal, { delay: 2 });
    const freq = page.locator("div[role=combobox]").filter({ hasText: /frequency|Never|Select a frequency/i }).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await freq.scrollIntoViewIfNeeded(); await freq.click(); await page.waitForTimeout(600);
      await page.keyboard.type("Never"); await page.waitForTimeout(300); await page.keyboard.press("Enter"); await page.waitForTimeout(500);
      const ok = await page.evaluate(() => [...document.querySelectorAll("div[role=combobox]")].some((c) => /^Never$/i.test(c.innerText.trim())));
      if (ok) break;
      await freq.click(); await page.waitForTimeout(400); await page.keyboard.press("ArrowUp"); await page.waitForTimeout(150); await page.keyboard.press("Enter"); await page.waitForTimeout(400);
    }
  } else {
    await page.locator("text=By project").first().click().catch(() => {});
    await page.waitForTimeout(800);
    const amt = page.locator("#charged-amount-id, #milestone-amount-1").first();
    await amt.click(); await amt.fill(bid);
    const dur = page.locator("div[role=combobox]").filter({ hasText: /duration|month/i }).first();
    await dur.scrollIntoViewIfNeeded(); await dur.click(); await page.waitForTimeout(700);
    await page.keyboard.press("ArrowDown"); await page.waitForTimeout(250); await page.keyboard.press("Enter"); await page.waitForTimeout(600);
    const ta = page.locator("textarea").first();
    await ta.scrollIntoViewIfNeeded(); await ta.click(); await page.keyboard.type(proposal, { delay: 2 });
  }
  await page.waitForTimeout(800);

  // Submit
  await submitBtn().scrollIntoViewIfNeeded().catch(() => {});
  await submitBtn().click({ timeout: 15000 }).catch((e) => { out.err = "submit:" + e.message.slice(0, 40); });
  await page.waitForTimeout(3000);

  // fixed-price "3 things you need to know" modal: tick the LABEL, then Continue
  const modal = await page.evaluate(() => !![...document.querySelectorAll('[role=dialog]')].find((e) => e.offsetParent !== null));
  if (modal) {
    await page.locator('[role=dialog] label').filter({ hasText: /Yes, I understand/i }).first().click().catch(() => {});
    await page.waitForTimeout(700);
    await page.locator('[role=dialog]').getByRole("button", { name: /Continue/i }).first().click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(5000);
  }
  // retry once if stale rate-increase error blocked an hourly submit
  const r1 = await page.evaluate(() => ({ ok: /\?success/.test(location.href), err: [...new Set([...document.querySelectorAll('.air3-form-message,[class*=error]')].map((x) => x.innerText.trim()).filter(Boolean))].slice(0, 3) }));
  if (!r1.ok && r1.err.some((e) => /frequency/i.test(e))) {
    const freq = page.locator("div[role=combobox]").filter({ hasText: /Never|frequency/i }).first();
    await freq.click(); await page.waitForTimeout(500); await page.keyboard.type("Never"); await page.waitForTimeout(300); await page.keyboard.press("Enter"); await page.waitForTimeout(500);
    await submitBtn().click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(5000);
  }
  const fin = await page.evaluate(() => ({ url: location.href, ok: /\?success/.test(location.href) || /proposal was submitted/i.test(document.body.innerText) }));
  out.ok = fin.ok; out.url = fin.url;
} catch (e) {
  out.err = (out.err ? out.err + " | " : "") + e.message.slice(0, 60);
}
console.log(JSON.stringify(out));
await b.close();

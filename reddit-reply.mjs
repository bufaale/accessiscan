#!/usr/bin/env node
/**
 * Reply to a SPECIFIC comment on an existing Reddit thread, via CDP attach to
 * the operator's logged-in Chrome (chrome-piposlab-debug.bat on :9222).
 *
 * Reuses the tab already open on the thread (does NOT open a new tab/browser).
 * Targets a comment by author + a snippet of its text, clicks that comment's
 * Reply, fills the inline composer, submits.
 *
 * Usage:
 *   node reddit-reply-to-comment.mjs --author <user> --match "<text snippet>" --body-file <path> [--dry]
 *
 * --dry fills the inline composer but does NOT submit (operator eyeballs it).
 */
import fs from "node:fs";
import { chromium } from "playwright";

const CDP = "http://127.0.0.1:9222";
const args = process.argv.slice(2);
const arg = (k) => args[args.indexOf(k) + 1];
const author = arg("--author");
const match = arg("--match");
const bodyFile = arg("--body-file");
const DRY = args.includes("--dry");
if (!author || !match || !bodyFile) {
  console.error('need --author, --match, --body-file');
  process.exit(2);
}
const body = fs.readFileSync(bodyFile, "utf8").trim();

async function probe() {
  try { const r = await fetch(`${CDP}/json/version`, { signal: AbortSignal.timeout(2500) }); return r.ok; }
  catch { return false; }
}

async function main() {
  if (!(await probe())) { console.error("CDP down — run chrome-piposlab-debug.bat"); process.exit(2); }
  const browser = await chromium.connectOverCDP(CDP);
  try {
    const ctx = browser.contexts()[0];
    if (!ctx) { console.error("no browser context on 9222"); process.exit(2); }
    // Reuse the tab already on this thread; do NOT open a new one.
    const pages = ctx.pages();
    let page = pages.find((p) => /reddit\.com\/r\/.*comments/i.test(p.url()));
    if (!page) { console.error("no open tab on a reddit thread; aborting (won't open a new browser)"); process.exit(2); }
    await page.bringToFront().catch(() => {});
    console.error(`using existing tab: ${page.url()}`);

    // login + lock checks
    const state = await page.evaluate(() => {
      const txt = document.body.innerText || "";
      return {
        loggedIn: /piposLab/i.test(txt) || !!document.querySelector('a[href*="/user/piposLab" i]'),
        archived: /archived|comments have been locked|no longer accept/i.test(txt),
      };
    });
    if (state.archived) { console.error("THREAD ARCHIVED/LOCKED"); process.exit(3); }
    if (!state.loggedIn) { console.error("NOT logged in as piposLab in this tab"); process.exit(3); }

    // If an inline "Reply to u/<author>" box is already open (e.g. from a prior
    // --dry run), reuse it instead of re-clicking Reply (which would toggle it).
    const already = page
      .locator(`div[contenteditable="true"][name="body"][aria-placeholder="Reply to u/${author}" i]`)
      .first();
    const alreadyOpen = await already.isVisible({ timeout: 1500 }).catch(() => false);

    // Click Reply on the target comment (shadow-piercing via evaluate).
    const clicked = alreadyOpen ? "ok" : await page.evaluate(({ author, match }) => {
      let target = null;
      const find = (root) => {
        for (const c of root.querySelectorAll("shreddit-comment")) {
          if (c.getAttribute("author") === author && (c.textContent || "").includes(match)) { target = c; return; }
        }
        for (const e of root.querySelectorAll("*")) if (e.shadowRoot) { find(e.shadowRoot); if (target) return; }
      };
      find(document);
      if (!target) return "comment-not-found";
      target.scrollIntoView({ block: "center" });
      let btn = null;
      const w = (r) => {
        for (const b of r.querySelectorAll('button,[role="button"]')) {
          if (/^reply$/i.test((b.textContent || "").trim())) { btn = b; return; }
        }
        for (const e of r.querySelectorAll("*")) if (e.shadowRoot) { w(e.shadowRoot); if (btn) return; }
      };
      w(target); if (!btn && target.shadowRoot) w(target.shadowRoot);
      if (!btn) return "reply-btn-not-found";
      btn.click();
      return "ok";
    }, { author, match });
    if (clicked !== "ok") { console.error(`could not open reply composer: ${clicked}`); process.exit(4); }
    await page.waitForTimeout(1500);

    // Fill the inline composer's contenteditable body. The inline REPLY box is
    // the one whose placeholder is "Reply to u/<author>" (the other visible
    // contenteditable is the top-level "Join the conversation" box).
    const editor = page
      .locator('div[contenteditable="true"][name="body"][aria-placeholder^="Reply to" i]')
      .first();
    if (!(await editor.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.error("inline reply composer (Reply to u/...) not visible after Reply click");
      process.exit(4);
    }
    await editor.scrollIntoViewIfNeeded().catch(() => {});
    const existing = ((await editor.textContent().catch(() => "")) || "").trim();
    const firstChunk = body.slice(0, 30);
    if (existing.includes(firstChunk)) {
      console.error(`reply already filled (${existing.length} chars) — not re-typing`);
    } else {
      await editor.click().catch(() => {});
      await page.waitForTimeout(300);
      await page.keyboard.insertText(body);
      await page.waitForTimeout(500);
      const got = ((await editor.textContent().catch(() => "")) || "").trim();
      if (got.length < 20) { console.error(`text didn't land (editor has ${got.length})`); process.exit(4); }
      console.error(`reply filled (${body.length} chars, editor has ${got.length})`);
    }

    if (DRY) { console.log("DRY: filled inline reply, NOT submitted"); return; }

    // Submit: the composer's primary button. Scope to the comment-composer that
    // contains our inline editor so we don't hit the top-level box's button.
    const composer = page.locator('comment-composer, shreddit-composer').filter({ has: editor }).first();
    let submit = composer.getByRole("button", { name: /^Comment$|^Reply$|^Post$/ }).last();
    if (!(await submit.count())) {
      submit = page.getByRole("button", { name: /^Comment$|^Reply$|^Post$/ }).last();
    }
    if (!(await submit.isEnabled({ timeout: 4000 }).catch(() => false))) {
      console.error("submit not enabled");
      process.exit(5);
    }
    await submit.click();
    await page.waitForTimeout(5000);
    console.log("REPLY_POSTED");
  } finally {
    // Do NOT close the browser — it's the operator's session.
    await browser.close().catch(() => {});
  }
}
main().catch((e) => { console.error("fatal:", e.message); process.exit(1); });

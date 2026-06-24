// Send ONE scan-first founder DM via X, using the logged-in CDP Chrome (@PiposLab).
// Usage: node x-dm.mjs <handle>            -> dry check (is Message button present?)
//        node x-dm.mjs <handle> --send     -> actually send
// Screenshots before+after for verification. Stops gracefully if DMs are closed.
import { chromium } from "playwright";

const MESSAGES = {
  derrickreimer:
    "Hey Derrick. I run scheduling tools through ChatGPT, Gemini, and Claude to see which ones get recommended, and I tried 18 different ways of asking for the best meeting scheduler. SavvyCal came up once. Calendly came up in all 18. The product is clearly better, so it surprised me how invisible it is to the models. I pulled the full breakdown of where the gaps are if you want it.",
  JackEllis:
    "Hey Jack. Not a pitch, just thought you'd find this interesting. I asked ChatGPT, Gemini, and Claude for privacy-friendly analytics 18 different ways to see who they name. Fathom showed up in 14, which is strong. Plausible edged it at 17. The one narrow spot where you dropped off was a specific cluster of prompts, and I'd happily send you exactly which ones if you're curious how the models are framing it.",
  mdausinger:
    "Hey Moritz. I've been checking which survey tools the AI models actually recommend, since more people start there now instead of Google. I asked ChatGPT, Gemini, and Claude for in-app survey software 18 different ways. Refiner came up in 4. Typeform in 12. Refiner is the more focused product for in-app, so the gap felt off. Happy to send you the per-prompt breakdown if it's useful.",
};

const handle = process.argv[2];
const doSend = process.argv.includes("--send");
const msg = MESSAGES[handle];
if (!msg) { console.log("Unknown handle. Use: derrickreimer | JackEllis | mdausinger"); process.exit(1); }

const b = await chromium.connectOverCDP("http://localhost:9222");
const ctx = b.contexts()[0];
const page = await ctx.newPage();
const shot = (n) => page.screenshot({ path: `C:/Projects/apps-portfolio/app-04-ada-scanner/xdm-${handle}-${n}.png` });

try {
  await page.goto(`https://x.com/${handle}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(4500);

  // confirm we're logged in (no login wall)
  if (await page.locator('a[href="/login"], a[href="/i/flow/login"]').count()) {
    console.log("NOT LOGGED IN to X — aborting."); await shot("nologin"); throw new Error("not logged in");
  }

  // Find the profile Message button
  const msgBtn = page.locator(
    '[data-testid="sendDMFromProfile"], [aria-label^="Message @"], [aria-label="Message"]'
  ).first();
  if (!(await msgBtn.count())) {
    console.log(`MESSAGE BUTTON NOT FOUND for @${handle} — DMs likely closed to non-followers.`);
    await shot("no-msg-btn");
    throw new Error("no message button");
  }
  console.log(`Message button found for @${handle}. DMs are open.`);
  if (!doSend) { await shot("dryrun"); console.log("DRY RUN — not sending. Re-run with --send."); throw new Error("dry"); }

  await msgBtn.click();
  await page.waitForTimeout(3000);

  // The DM composer text input (contenteditable)
  const input = page.locator('[data-testid="dmComposerTextInput"], [data-testid="dmComposerTextInput"] div[contenteditable="true"], div[aria-label="Text message"][contenteditable="true"]').first();
  await input.waitFor({ state: "visible", timeout: 15000 });
  await input.click();
  await page.waitForTimeout(500);
  await page.keyboard.type(msg, { delay: 8 });
  await page.waitForTimeout(800);
  await shot("typed");
  console.log("Typed message. Screenshot saved (xdm-" + handle + "-typed.png). Verify text, then it sends.");

  // Send
  const sendBtn = page.locator('[data-testid="dmComposerSendButton"]').first();
  if (await sendBtn.count() && await sendBtn.isEnabled()) {
    await sendBtn.click();
  } else {
    await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(3500);
  await shot("sent");

  // Verify the sent bubble contains a snippet of our message
  const snippet = msg.slice(0, 40);
  const bodyText = await page.locator("body").innerText();
  const ok = bodyText.includes(snippet);
  console.log(ok ? `SENT ✓ — verified message appears in conversation for @${handle}` : `SENT? — could not verify snippet for @${handle}, check xdm-${handle}-sent.png`);
} catch (e) {
  console.log("RESULT:", e.message.slice(0, 160));
} finally {
  await page.close();
  await b.close();
}

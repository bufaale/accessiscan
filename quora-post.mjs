import { chromium } from "playwright";
import { readFileSync } from "fs";
const url = process.argv[2];
const txtFile = process.argv[3];
const doPost = process.argv.includes("--post");
let text = readFileSync(txtFile, "utf-8").replace(/\r\n/g,"\n").trim();
const paras = text.split(/\n{2,}/).map(p=>p.replace(/\n/g," ").trim()).filter(Boolean);
const b = await chromium.connectOverCDP("http://localhost:9222");
const ctx = b.contexts()[0];
const page = await ctx.newPage();
const shot=(n)=>page.screenshot({path:`C:/Projects/apps-portfolio/app-04-ada-scanner/qp-${n}.png`});
try {
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:50000});
  await page.waitForTimeout(6000);
  const ansBtn = page.locator('button:has-text("Edit draft"), div[role="button"]:has-text("Edit draft"), button:has-text("Answer"), div[role="button"]:has-text("Answer")').filter({hasNotText:"Answer requests"}).first();
  if(!(await ansBtn.count())){ await shot("noans"); throw new Error("no Answer button"); }
  await ansBtn.click();
  await page.waitForTimeout(3500);
  const ed = page.locator('[contenteditable="true"]').last();
  await ed.click(); await page.waitForTimeout(400);
  // clear any auto-saved draft
  await page.keyboard.press("Control+A"); await page.keyboard.press("Delete"); await page.waitForTimeout(300);
  for(let i=0;i<paras.length;i++){
    await page.keyboard.type(paras[i], {delay:1});
    if(i<paras.length-1) await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(1000);
  await shot("typed");
  console.log("typed", paras.length, "paragraphs,", text.length, "chars");
  if(!doPost){ console.log("DRY — review qp-typed.png"); throw new Error("dry"); }
  const postBtn = page.locator('button:has-text("Post"):visible, div[role="button"]:has-text("Post"):visible').last();
  await postBtn.click();
  await page.waitForTimeout(5000);
  await shot("posted");
  console.log("POSTED. url:", page.url());
} catch(e){ console.log("RESULT:", e.message.slice(0,150)); }
finally { await page.close(); await b.close(); }

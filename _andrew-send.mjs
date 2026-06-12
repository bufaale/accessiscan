import { chromium } from 'playwright';
const MSG=`Quick follow-up, Andrew. Attaching the full pull so you can see it at scale: 208 Sonoco roles after the Tier-1 filter (title, location, posted date, apply URL), the exact shape that would feed your WP Job Manager. To de-risk it for you, I'd suggest a first paid milestone covering just the Workday + Greenhouse/Lever companies on your list (that's most of the ~100). You'd see the daily feed running into your site before we touch the few non-standard pages. Whenever you send the offer I can start right away.`;
const CSV='C:/Projects/apps-portfolio/.shared/launch/upwork-proofs-2026-06-07/sonoco-pull-full.csv';
async function check(port){ try{ const b=await chromium.connectOverCDP('http://127.0.0.1:'+port); const ctx=b.contexts()[0]; const page=ctx.pages()[0]||await ctx.newPage(); await page.goto('https://www.upwork.com/ab/messages/',{waitUntil:'domcontentloaded',timeout:40000}).catch(()=>{}); await page.waitForTimeout(5000); return {b,page,li:!/login|account-security/i.test(page.url())}; }catch(e){return {err:e.message};} }
let s=await check(9222); if(s.err||!s.li){ if(s.b)await s.b.close(); s=await check(9223); }
if(s.err||!s.li){ console.log('not logged in'); process.exit(0); }
const {page}=s;
try{ await page.locator('text=/Andrew/i').first().click({timeout:8000}); await page.waitForTimeout(3500); }catch(e){console.log('thread err');}
// attach CSV via file input
let attached=false;
try{ const fi=page.locator('input[type=file]').last(); await fi.setInputFiles(CSV); console.log('file set'); await page.waitForTimeout(6000); attached=true; }catch(e){ console.log('attach err',e.message.slice(0,60)); }
// type message
try{ const ta=page.locator('div[contenteditable="true"], textarea').last(); await ta.click({timeout:5000}); await page.keyboard.type(MSG,{delay:2}); console.log('typed'); }catch(e){ console.log('type err',e.message.slice(0,50)); }
await page.waitForTimeout(1000);
await page.screenshot({path:'C:/Projects/apps-portfolio/.shared/launch/upwork-proofs-2026-06-07/andrew-pre-send.png',fullPage:true}).catch(()=>{});
// send
let sent=false;
for(const sel of ['button[data-test="send-message"]','button:has-text("Send")']){ try{ const b2=page.locator(sel).last(); if(await b2.isEnabled({timeout:2000})){ await b2.click({timeout:3000}); sent=true; console.log('sent via',sel); break; } }catch(e){} }
if(!sent){ try{ await page.keyboard.press('Enter'); sent=true; console.log('sent via Enter'); }catch(e){} }
await page.waitForTimeout(5000);
const tail=await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(-350));
console.log('attached:',attached,'| TAIL:',tail);
await page.screenshot({path:'C:/Projects/apps-portfolio/.shared/launch/upwork-proofs-2026-06-07/andrew-sent.png',fullPage:true}).catch(()=>{});
await s.b.close();

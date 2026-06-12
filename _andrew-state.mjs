import { chromium } from 'playwright';
async function check(port){ try{ const b=await chromium.connectOverCDP('http://127.0.0.1:'+port); const ctx=b.contexts()[0]; const page=ctx.pages()[0]||await ctx.newPage(); await page.goto('https://www.upwork.com/ab/messages/',{waitUntil:'domcontentloaded',timeout:40000}).catch(()=>{}); await page.waitForTimeout(5000); const li=!/login|account-security/i.test(page.url()); return {b,page,li,u:page.url()}; }catch(e){ return {err:e.message}; } }
let s=await check(9222); if(s.err||!s.li){ if(s.b)await s.b.close(); s=await check(9223); }
if(s.err||!s.li){ console.log('NOT_LOGGED_IN', s.u||s.err); if(s.b)await s.b.close(); process.exit(0); }
const {page}=s;
if(/verify you are human|just a moment/i.test(await page.content())){console.log('CLOUDFLARE');await s.b.close();process.exit(0);}
console.log('LOGGED_IN');
try{ await page.locator('text=/Andrew/i').first().click({timeout:8000}); await page.waitForTimeout(4000); }catch(e){console.log('thread err',e.message.slice(0,40));}
const conv=await page.evaluate(()=>{const bt=document.body.innerText.replace(/\s+/g,' ');const i=bt.lastIndexOf('Andrew');return bt.slice(Math.max(0,i-200), i+250);});
console.log('TAIL:',conv);
await s.b.close();

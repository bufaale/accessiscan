import { chromium } from 'playwright';
const s=await(async()=>{ for(const port of [9222,9223]){ try{ const b=await chromium.connectOverCDP('http://127.0.0.1:'+port); for(const ctx of b.contexts()){ for(const pg of ctx.pages()){ if(/upwork\.com\/nx\/search\/jobs/.test(pg.url())) return {b,pg}; } } await b.close(); }catch(e){} } return null; })();
if(!s){console.log('no tab');process.exit(0);}
const {pg}=s;
try{ await pg.locator('a:has-text("Python automation developer")').first().click({timeout:7000}); }catch(e){ console.log('click err',e.message.slice(0,30)); }
await pg.waitForTimeout(5500);
const cf=/verify you are human|just a moment/i.test(await pg.content());
const r=await pg.evaluate(()=>{
  const bt=document.body.innerText.replace(/\s+/g,' ');
  const ci=bt.indexOf('About the client');
  // job desc usually between the job title area and "About the client"; grab a window ending at client block
  const conn=(bt.match(/Send a proposal for:\s*(\d+)/i)||['',''])[1];
  const budget=(bt.match(/\$[\d,]+\.00\s*(Fixed-price|Project Budget)/i)||bt.match(/(Fixed price|Hourly)[^.]{0,40}\$[\d,]+/i)||[''])[0];
  const descWin = ci>800 ? bt.slice(ci-1200, ci) : bt.slice(0,1200);
  const client = ci>-1 ? bt.slice(ci, ci+300) : '';
  return {conn, budget, descWin, client};
});
console.log('cf:',cf,'| connects:',r.conn,'| budgetHint:',r.budget);
console.log('--- DESC WINDOW ---'); console.log(r.descWin);
console.log('--- CLIENT ---'); console.log(r.client);
await s.b.close();

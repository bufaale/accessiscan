import { chromium } from 'playwright';
function getPage(){ return (async()=>{ for(const port of [9222,9223]){ try{ const b=await chromium.connectOverCDP('http://127.0.0.1:'+port); for(const ctx of b.contexts()){ for(const pg of ctx.pages()){ if(/upwork\.com\/nx\/search\/jobs/.test(pg.url())) return {b,pg}; } } await b.close(); }catch(e){} } return null; })(); }
const s=await getPage(); if(!s){console.log('no open search tab');process.exit(0);}
const {pg}=s;
// click the CV screening job tile (in-app nav)
let clicked=false;
for(const t of ['Urgent Python Automation for CV Screening','Python automation developer']){
  try{ const link=pg.locator(`a:has-text("${t}")`).first(); if(await link.count()){ await link.click({timeout:6000}); clicked=t; break; } }catch(e){}
}
console.log('clicked:',clicked);
await pg.waitForTimeout(6000);
const cf=/verify you are human|just a moment/i.test(await pg.content());
console.log('after click cloudflare:',cf,'| url:',pg.url());
if(!cf){
  const d=await pg.evaluate(()=>{const T=s=>{const e=document.querySelector(s);return e?e.innerText.replace(/\s+/g,' ').trim():'';};const bt=document.body.innerText;return {conn:(bt.match(/Send a proposal for:\s*(\d+)/i)||['',''])[1],props:(bt.match(/Proposals[:\s]*([<\d +-]+)/i)||['',''])[1].trim(),client:T('[data-test="AboutClientUser"],[data-test="about-client-container"]').slice(0,300),descr:T('[data-test="Description"],[data-test="job-description"]').replace(/\s+/g,' ').slice(0,1100)};});
  console.log('CLIENT:',d.client);
  console.log('connects:',d.conn,'| proposals:',d.props);
  console.log('DESC:',d.descr);
}
await s.b.close();

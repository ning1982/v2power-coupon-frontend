import { chromium } from "playwright";
const BASE="https://v2power.io/Voucher";
const TOKEN="V2P-GZ4MFT1A";
async function run(){
 const browser=await chromium.launch({headless:true, channel:"chrome", args:["--ignore-certificate-errors"]});
 const ctx=await browser.newContext({ignoreHTTPSErrors:true});
 const page=await ctx.newPage();
 console.log("[SMOKE] start real DNS");
 await page.goto(BASE+"/?t="+TOKEN+"&amt=100",{waitUntil:"domcontentloaded", timeout:15000});
 await page.waitForTimeout(1500);
 console.log("[SMOKE] url",page.url(), "title",await page.title());
 let hasVoucher=false; try{ hasVoucher=(await page.locator("text=V2P-GZ4MFT1A").count())>0; }catch{}
 console.log("[SMOKE] prefill",hasVoucher);
 await page.screenshot({path:"docs/UAT/SMOKE-01_prefill_real.png",fullPage:true});
 // validation smoke
 await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
 await page.click("button[type=submit]"); await page.waitForTimeout(800);
 await page.screenshot({path:"docs/UAT/SMOKE-04_validation_real.png",fullPage:true});
 console.log("[SMOKE] validation done");
 // Help
 await page.goto(BASE+"/help",{waitUntil:"domcontentloaded"}); await page.waitForTimeout(800);
 await page.screenshot({path:"docs/UAT/SMOKE-19_help_real.png",fullPage:true});
 console.log("[SMOKE] help done",page.url());
 // success privacy
 await page.goto(BASE+"/success",{waitUntil:"domcontentloaded"}); await page.waitForTimeout(800);
 await page.screenshot({path:"docs/UAT/SMOKE-18_privacy_real.png",fullPage:true});
 console.log("[SMOKE] privacy",await page.locator("text=Voucher session expired").count());
 await browser.close();
 console.log("SMOKE REAL DONE");
}
run().catch(e=>{console.error(e);process.exit(1)});

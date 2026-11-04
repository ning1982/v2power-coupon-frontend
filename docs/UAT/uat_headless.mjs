import { chromium } from "playwright";
const BASE="https://v2power.io/Voucher"; const EMAIL="zhilin.zhang@v2power.io"; const TOKEN="V2P-N00XPCFA"; const FAKE="V2P-FAKE123456"; const HOST="MAP v2power.io 3.10.154.251";
async function run(){
 const browser=await chromium.launch({headless:true, channel:"chrome", args:["--host-resolver-rules="+HOST,"--ignore-certificate-errors"]});
 const ctx=await browser.newContext({ignoreHTTPSErrors:true});
 const page=await ctx.newPage();
 // UAT-02 empty token
 console.log("[UAT-02] empty");
 await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
 await page.waitForTimeout(800);
 await page.screenshot({path:"docs/UAT/UAT-02_empty.png",fullPage:true});
 // UAT-01 prefill check already done
 // UAT-04-08 validation: try submit empty
 await page.fill("#email",""); await page.fill("#confirmedEmail","");
 try{ await page.click("button[type=submit]"); await page.waitForTimeout(500); console.log("[UAT-04] empty submit done"); }catch(e){}
 await page.screenshot({path:"docs/UAT/UAT-04_validation.png",fullPage:true});
 // UAT-14 fake without captcha -> should get E101 or E004
 console.log("[UAT-14] fake");
 await page.goto(BASE+"/?t="+FAKE,{waitUntil:"domcontentloaded"});
 await page.fill("#email",EMAIL); await page.fill("#confirmedEmail",EMAIL);
 try{ await page.check("#consent");}catch{}
 await page.click("button[type=submit]"); await page.waitForTimeout(2000);
 let t14=""; try{ t14=await page.locator("[role=alert]").textContent({timeout:3000}); }catch{}
 console.log("[UAT-14 alert]",t14);
 await page.screenshot({path:"docs/UAT/UAT-14_E101.png",fullPage:true});
 // UAT-13 duplicate
 console.log("[UAT-13] duplicate");
 await page.goto(BASE+"/?t="+TOKEN,{waitUntil:"domcontentloaded"});
 await page.fill("#email",EMAIL); await page.fill("#confirmedEmail",EMAIL);
 try{ await page.check("#consent");}catch{}
 await page.click("button[type=submit]"); await page.waitForTimeout(2000);
 let t13=""; try{ t13=await page.locator("[role=alert]").textContent({timeout:3000}); }catch{}
 console.log("[UAT-13 alert]",t13);
 await page.screenshot({path:"docs/UAT/UAT-13_E102.png",fullPage:true});
 // UAT-19 Help/Privacy
 await page.goto(BASE+"/help",{waitUntil:"domcontentloaded"}).catch(()=>page.goto(BASE+"/privacy"));
 await page.waitForTimeout(500);
 await page.screenshot({path:"docs/UAT/UAT-19_help.png",fullPage:true});
 // UAT-18 URL privacy check: success page should not have email in URL
 await page.goto(BASE+"/success",{waitUntil:"domcontentloaded"});
 console.log("[UAT-18] url",page.url());
 await page.screenshot({path:"docs/UAT/UAT-18_privacy.png",fullPage:true});
 await browser.close();
 console.log("headless done");
}
run().catch(e=>{console.error(e); process.exit(1)});

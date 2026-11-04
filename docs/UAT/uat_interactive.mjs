import { chromium } from "playwright";
import * as fs from "fs";
import * as readline from "readline";

const BASE = "https://v2power.io/Voucher";
const EMAIL = "zhilin.zhang@v2power.io";
const FAKE = "V2P-FAKE123456";
const HOST_RULE = "MAP v2power.io 3.10.154.251";
const TOKENS_FILE = "docs/UAT/.tokens.local.txt";

function loadTokens(){ try{ if(fs.existsSync(TOKENS_FILE)) return fs.readFileSync(TOKENS_FILE,"utf8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);}catch{} return ["V2P-N00XPCFA","V2P-GZ4MFT1A"];}
function ask(q){ return new Promise(res=>{ const rl=readline.createInterface({input:process.stdin,output:process.stdout}); rl.question(q, a=>{rl.close(); res(a);});});}

async function main(){
  const tokens = loadTokens();
  const token = tokens[0];
  console.log("[UAT] tokens", tokens.length, "main", token, "email", EMAIL);
  const browser = await chromium.launch({ headless:false, channel:"chrome", args:["--host-resolver-rules="+HOST_RULE, "--ignore-certificate-errors", "--disable-blink-features=AutomationControlled", "--disable-infobars"], ignoreHTTPSErrors:true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors:true });
  const page = await ctx.newPage();

  // UAT-01 prefill
  console.log("[UAT-01] goto", BASE+"/?t="+token+"&amt=100");
  await page.goto(BASE+"/?t="+token+"&amt=100", { waitUntil:"domcontentloaded", timeout:30000});
  await page.waitForTimeout(1500);
  await page.screenshot({ path:"docs/UAT/UAT-01_prefill.png", fullPage:true });
  console.log("[UAT-01] screenshot saved");
  // fill email / consent
  const emailSel = "#email"; const cEmailSel = "#confirmedEmail"; const consentSel = "#consent"; const submitSel = "button[type=submit]";
  try{ await page.fill(emailSel, EMAIL); await page.fill(cEmailSel, EMAIL); console.log("[fill] emails");}catch(e){ console.log("fill error", e.message)}
  try{ const checked = await page.isChecked(consentSel); if(!checked) await page.check(consentSel); console.log("[consent] checked");}catch(e){ console.log("consent err", e.message)}
  await page.screenshot({ path:"docs/UAT/UAT-01_filled.png", fullPage:true });
  console.log("[UAT] form filled, PLEASE complete reCAPTCHA in the popped Chrome window");
  await ask("\n>>> 请在弹出的 Chrome 窗口完成人机验证（勾选 我不是机器人 / 完成验证），完成后回到此终端按回车继续提交 >>> ");
  // submit UAT-12
  console.log("[UAT-12] submitting");
  await page.click(submitSel);
  let success=false;
  try{ await page.waitForURL("**/success", { timeout:15000}); success=true; console.log("[UAT-12] success navigation"); }catch{ console.log("[UAT-12] no success, check alert");}
  await page.waitForTimeout(1500);
  await page.screenshot({ path: success ? "docs/UAT/UAT-12_success.png" : "docs/UAT/UAT-12_failed.png", fullPage:true });
  if(success){
    const body = await page.content();
    const hasMasked = body.includes("z***g") || body.includes("***");
    const has30s = body.includes("30") || body.includes("Arrives");
    console.log("[UAT-12] masked", hasMasked, "30s", has30s, "url", page.url());
    console.log("请检查邮箱 "+EMAIL+" 是否收到邮件（包括垃圾箱），收到后告知");
  } else {
    try{ const alert = await page.locator("[role=alert]").textContent({timeout:3000}); console.log("[alert]", alert);}catch{}
  }
  // UAT-13 duplicate
  console.log("[UAT-13] duplicate test same token");
  await page.goto(BASE+"/?t="+token, { waitUntil:"domcontentloaded"});
  await page.fill("#email", EMAIL); await page.fill("#confirmedEmail", EMAIL);
  try{ if(!(await page.isChecked("#consent"))) await page.check("#consent");}catch{}
  await ask("[UAT-13] 请再次完成人机验证（如需要）后按回车提交重复测试 >>> ");
  await page.click("button[type=submit]");
  await page.waitForTimeout(2000);
  try{ const alert13 = await page.locator("[role=alert]").textContent({timeout:5000}); console.log("[UAT-13 alert]", alert13); console.log(alert13 && alert13.includes("already been redeemed") ? "UAT-13 E102 PASS" : "UAT-13 unexpected");}catch(e){ console.log("UAT-13 no alert", e.message)}
  await page.screenshot({ path:"docs/UAT/UAT-13_E102.png", fullPage:true });
  // UAT-14 fake
  console.log("[UAT-14] fake token", FAKE);
  await page.goto(BASE+"/?t="+FAKE, { waitUntil:"domcontentloaded"});
  await page.fill("#email", EMAIL); await page.fill("#confirmedEmail", EMAIL);
  try{ if(!(await page.isChecked("#consent"))) await page.check("#consent");}catch{}
  await ask("[UAT-14] 请完成人机验证后按回车提交伪造测试 >>> ");
  await page.click("button[type=submit]");
  await page.waitForTimeout(2000);
  try{ const alert14 = await page.locator("[role=alert]").textContent({timeout:5000}); console.log("[UAT-14 alert]", alert14); console.log(alert14 && alert14.includes("Invalid Token") ? "UAT-14 E101 PASS" : "UAT-14 unexpected");}catch(e){ console.log("UAT-14 no alert", e.message)}
  await page.screenshot({ path:"docs/UAT/UAT-14_E101.png", fullPage:true });
  console.log("[UAT] all done, keep browser 10s");
  await page.waitForTimeout(10000);
  await browser.close();
}
main().catch(e=>{ console.error(e); process.exit(1)});

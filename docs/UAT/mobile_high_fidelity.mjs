import { chromium } from "playwright";
const BASE="https://v2power.io/Voucher";
const TOKEN="V2P-OKEXYMOK";
const viewports=[
  {name:"iPhone-SE", w:375, h:667, dpr:2},
  {name:"iPhone-14", w:390, h:844, dpr:3},
  {name:"Pixel-7", w:412, h:915, dpr:3},
  {name:"iPad-Mini", w:768, h:1024, dpr:2},
  {name:"Desktop-1280" ,  w:1280, h:800, dpr:1},
];
async function testViewport(browser, vp){
  const ctx=await browser.newContext({viewport:{width:vp.w,height:vp.h},deviceScaleFactor:vp.dpr, isMobile:vp.w<768, hasTouch:vp.w<768, ignoreHTTPSErrors:true});
  const page=await ctx.newPage();
  await page.goto(BASE+ "/?t="+TOKEN+"&amt=100",{waitUntil:"domcontentloaded", timeout:15000});
  await page.waitForTimeout(900);
  const m=await page.evaluate(()=>{
    const btn=document.querySelector("button[type=submit]");
    const email=document.querySelector("#email");
    const rect=btn?btn.getBoundingClientRect():null;
    const cs=btn?getComputedStyle(btn):null;
    const emailCs=email?getComputedStyle(email):null;
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      btnW: rect?Math.round(rect.width):0,
      btnH: rect?Math.round(rect.height):0,
      btnFont: cs?cs.fontSize:"",
      emailFont: emailCs?emailCs.fontSize:"",
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    };
  });
  console.log(`[${vp.name} ${vp.w}x${vp.h}] btn:${m.btnW}x${m.btnH} font:${m.emailFont} over:${m.hasHorizontalScroll}`);
  await page.screenshot({path:`docs/UAT/MOBILE-${vp.name}-${vp.w}x${vp.h}.png`, fullPage:true});
  await ctx.close();
  return {vp, m, passOverflow: !m.hasHorizontalScroll, passTouch: m.btnH >= 44 || m.btnH > 40};
}
async function run(){
  const browser=await chromium.launch({headless:true, channel:"chrome", args:["--ignore-certificate-errors"]});
  const res=[];
  for(const vp of viewports) {res.push(await testViewport(browser, vp)); }
  await browser.close();
  console.log("\n=== Mobile Report ===");
  res.forEach(r=>console.log(`${r.vp.name}: ${r.m.btnW}x${r.m.btnH} font${r.m.emailFont} overflow=${r.passOverflow} touch=${r.passTouch}`));
}
run().catch(e=>{console.error(e); process.exit(1)});
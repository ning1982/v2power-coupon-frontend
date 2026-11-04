import { chromium } from 'playwright';
import * as fs2 from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';
const BASE = 'http://192.168.33.163/couponAdmin/admin/import';
const OUT = 'docs/UAT/screenshots_admin_20260831';
fs2.mkdirSync(OUT, { recursive: true });
function makeXlsx(filePath, rows){
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
}
function makeFiles(){
  makeXlsx(path.join(OUT,'_tmp_valid3.xlsx'), [['voucher_code'],['UAT-ADMIN-100'],['UAT-ADMIN-101'],['UAT-ADMIN-102']]);
  makeXlsx(path.join(OUT,'_tmp_flyer2.xlsx'), [['voucher_code'],['UAT-FLYER-A'],['UAT-FLYER-B']]);
  makeXlsx(path.join(OUT,'_tmp_large20.xlsx'), [['voucher_code'], ...Array.from({length:20},(_,i)=>['UAT-BULK-'+String(i).padStart(3,'0')]) ]);
  fs2.writeFileSync(path.join(OUT,'_tmp_invalid.txt'), 'not excel');
  fs2.writeFileSync(path.join(OUT,'_tmp_empty.xlsx'), '');
}
async function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }
async function main(){
  makeFiles();
  console.log('[UAT] files prepared');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors:true });
  const page = await ctx.newPage();
  console.log('[01] initial load');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(1500);
  await page.screenshot({ path: path.join(OUT, '01_initial_load.png'), fullPage: true });
  const amountInput = page.locator('#amount');
  await amountInput.fill('');
  await delay(300);
  await page.screenshot({ path: path.join(OUT, '02_amount_empty.png'), fullPage: true });
  console.log('[03] no file');
  const importBtn = page.locator('button').filter({ hasText: /Import/i }).first();
  await importBtn.click();
  await delay(800);
  await page.screenshot({ path: path.join(OUT, '03_no_file_error.png'), fullPage: true });
  await amountInput.fill('10');
  await delay(200);
  await amountInput.fill('0');
  await importBtn.click();
  await delay(500);
  await page.screenshot({ path: path.join(OUT, '04_amount_zero_error.png'), fullPage: true });
  await amountInput.fill('10');
  console.log('[05] invalid file');
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles(path.join(OUT, '_tmp_invalid.txt'));
  await delay(800);
  await page.screenshot({ path: path.join(OUT, '05_invalid_filetype_error.png'), fullPage: true });
  console.log('[06] valid file');
  await fileInput.setInputFiles(path.join(OUT, '_tmp_valid3.xlsx'));
  await delay(800);
  await page.screenshot({ path: path.join(OUT, '06_file_selected.png'), fullPage: true });
  console.log('[07] submit');
  await importBtn.click();
  await delay(3500);
  let retries=0;
  while(retries<10){
    const hasResult = await page.locator('text=Imported:').count();
    if(hasResult>0) break;
    await delay(1000); retries++;
  }
  await page.screenshot({ path: path.join(OUT, '07_import_success.png'), fullPage: true });
  console.log('[08] preview');
  const previewGrid = page.locator('#preview-grid');
  if(await previewGrid.count()>0){
    await previewGrid.scrollIntoViewIfNeeded();
    await delay(1000);
    await page.screenshot({ path: path.join(OUT, '08_qr_preview_grid.png'), fullPage: true });
    try{ await previewGrid.screenshot({ path: path.join(OUT, '08b_qr_grid_only.png') }); }catch(e){ console.log(e.message)}
  }
  console.log('[09] history');
  const historyPanel = page.locator('aside').first();
  await page.screenshot({ path: path.join(OUT, '09_history_after_import.png'), fullPage: true });
  try{ await historyPanel.screenshot({ path: path.join(OUT, '09b_history_panel.png') })}catch{}
  let batchId = null;
  try{
    const mono = await page.locator('.font-mono').first().textContent();
    const t = mono.trim();
    if(/^[a-f0-9]{32}$/.test(t)) batchId=t;
  }catch{}
  if(!batchId){
    try{ const histMono = await page.locator('aside .font-mono').first().textContent(); const t=histMono.trim(); if(/^[a-f0-9]{32}$/.test(t)) batchId=t; }catch{}
  }
  console.log('batchId:', batchId);
  if(batchId){
    const zipRes = await page.request.get('http://192.168.33.163/coupon_api/admin/batch/'+batchId+'/qrs');
    console.log('ZIP status:', zipRes.status(), 'size:', (await zipRes.body()).length);
    const zipBody = await zipRes.body();
    fs2.writeFileSync(path.join(OUT, '_check.zip'), zipBody);
  }
  console.log('[11] flyer');
  if(batchId){
    await page.goto('http://192.168.33.163/couponAdmin/admin/flyer/'+batchId, { waitUntil: 'domcontentloaded'});
    await delay(2500);
    await page.screenshot({ path: path.join(OUT, '11_flyer_initial.png'), fullPage: true });
    const amtOverride = page.locator('input[placeholder=\ 10\]').first();
    if(await amtOverride.count()>0){
      await amtOverride.fill('25');
      await delay(500);
      await page.screenshot({ path: path.join(OUT, '11b_flyer_amount_override.png'), fullPage: true });
    }
  }
  console.log('[12] not found');
  await page.goto('http://192.168.33.163/couponAdmin/admin/flyer/00000000000000000000000000000000', { waitUntil:'domcontentloaded'});
  await delay(1000);
  await page.screenshot({ path: path.join(OUT, '12_flyer_not_found.png'), fullPage: true });
  console.log('[13] duplicate');
  await page.goto(BASE, { waitUntil:'domcontentloaded'});
  await delay(1000);
  await page.locator('#amount').fill('10');
  await page.locator('input[type=file]').setInputFiles(path.join(OUT, '_tmp_valid3.xlsx'));
  await delay(800);
  await page.locator('button').filter({hasText:/Import/i}).first().click();
  await delay(3000);
  await page.screenshot({ path: path.join(OUT, '13_duplicate_import.png'), fullPage: true });
  console.log('[14] bulk20');
  await page.locator('input[type=file]').setInputFiles(path.join(OUT, '_tmp_large20.xlsx'));
  await delay(800);
  await page.locator('#amount').fill('50');
  await page.locator('button').filter({hasText:/Import/i}).first().click();
  await delay(4000);
  await page.screenshot({ path: path.join(OUT, '14_bulk20_success.png'), fullPage: true });
  console.log('[15] mobile');
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors:true });
  const mPage = await mobileCtx.newPage();
  await mPage.goto(BASE, { waitUntil:'domcontentloaded'});
  await delay(1500);
  await mPage.screenshot({ path: path.join(OUT, '15_mobile_375.png'), fullPage:true });
  if(batchId){
    await mPage.goto('http://192.168.33.163/couponAdmin/admin/flyer/'+batchId, { waitUntil:'domcontentloaded'});
    await delay(1500);
    await mPage.screenshot({ path: path.join(OUT, '15b_mobile_flyer.png'), fullPage:true });
  }
  await mobileCtx.close();
  await page.goto(BASE, { waitUntil:'domcontentloaded'});
  await delay(1000);
  await page.screenshot({ path: path.join(OUT, '16_final_overview.png'), fullPage:true });
  console.log('[17] expiry empty');
  await page.locator('input[type=date]').first().fill('');
  await page.locator('input[type=file]').setInputFiles(path.join(OUT, '_tmp_flyer2.xlsx'));
  await delay(300);
  await page.locator('button').filter({hasText:/Import/i}).first().click();
  await delay(800);
  await page.screenshot({ path: path.join(OUT, '17_expiry_empty_error.png'), fullPage:true });
  await page.goto(BASE, { waitUntil:'domcontentloaded'});
  await delay(1000);
  await page.screenshot({ path: path.join(OUT, '18_drag_zone.png'), fullPage:true });
  console.log('[DONE]');
  await browser.close();
}
main().catch(e=>{ console.error(e); process.exit(1); });

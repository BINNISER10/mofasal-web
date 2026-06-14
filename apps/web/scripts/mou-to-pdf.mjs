import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/investor/MOFASAL-MOU.pdf');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/mouContent.json'), 'utf8'));

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function prepareImages() {
  const tmpDir = path.join(ROOT, 'public/investor/_pdf-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const files = [
    ['screenshots/01-home.png', 'home.jpg'],
    ['screenshots/05-admin-dashboard.png', 'admin.jpg'],
    ['screenshots/09-customer-order-wizard.png', 'wizard.jpg'],
  ];
  for (const [src, dest] of files) {
    await sharp(path.join(ROOT, 'public/investor', src))
      .resize({ width: 720, withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toFile(path.join(tmpDir, dest));
  }
  return tmpDir;
}

function buildHtml(tmpDir) {
  const parties = DATA.parties
    .map(
      (p) => `
      <div class="party">
        <p class="party-name">الأستاذ/ ${esc(p.name)} — ${esc(p.role)}</p>
        <p class="party-meta">${esc(p.idLabel)}: (................)</p>
        <p class="party-sign">التوقيع: ____________________</p>
      </div>`,
    )
    .join('');

  const sections = DATA.sections
    .map(
      (s) => `
      <article class="section">
        <h3>${esc(s.title)}</h3>
        <ul>${s.body.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </article>`,
    )
    .join('');

  const sigGrid = DATA.parties
    .map(
      (p) => `
      <div class="sig-card">
        <p class="sig-name">${esc(p.name)}</p>
        <p class="sig-role">${esc(p.role)}</p>
        <p class="sig-line">التوقيع: _______________</p>
      </div>`,
    )
    .join('');

  const shots = [
    { src: `${tmpDir}/home.jpg`.replace(/\\/g, '/'), alt: 'الصفحة الرئيسية' },
    { src: `${tmpDir}/admin.jpg`.replace(/\\/g, '/'), alt: 'لوحة الإدارة' },
    { src: `${tmpDir}/wizard.jpg`.replace(/\\/g, '/'), alt: 'معالج الطلب' },
  ];
  const shotGrid = shots
    .map((s) => `<div class="shot"><img src="${s.src}" alt="${esc(s.alt)}"/><p>${esc(s.alt)}</p></div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans Arabic', Tahoma, sans-serif; color: #1A1A1A; background: #F2E8D4; line-height: 1.7; }
  .cover { min-height: 100vh; background: #00373E; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 24px; page-break-after: always; }
  .cover img { width: 120px; height: 120px; border-radius: 16px; margin-bottom: 32px; }
  .gold { color: #D4A017; }
  .cover h1 { font-size: 42px; font-weight: 700; margin: 16px 0; }
  .cover p { max-width: 560px; opacity: 0.85; font-size: 18px; }
  .cover .meta { margin-top: 40px; font-size: 13px; opacity: 0.6; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 32px 24px 48px; }
  .preview { page-break-after: always; }
  .preview h2 { color: #00373E; font-size: 24px; margin-bottom: 8px; }
  .preview .sub { color: #735B4D; font-size: 13px; margin-bottom: 24px; }
  .shots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .shot { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,55,62,0.1); }
  .shot img { width: 100%; height: auto; display: block; }
  .shot p { text-align: center; font-size: 11px; padding: 8px; color: #735B4D; }
  .parties-box { background: #fff; border-radius: 20px; padding: 28px; margin: 24px 0; border: 1px solid rgba(0,55,62,0.1); page-break-after: always; }
  .parties-box h2 { color: #00373E; border-bottom: 2px solid #D4A017; padding-bottom: 12px; margin-bottom: 20px; }
  .party { background: #F5F5F5; border-right: 4px solid #00373E; padding: 16px; border-radius: 10px; margin-bottom: 12px; }
  .party-name { font-weight: 700; color: #00373E; }
  .party-meta, .party-sign { font-size: 13px; color: #735B4D; margin-top: 6px; }
  .section { background: #fff; border-radius: 14px; padding: 20px; margin-bottom: 16px; border: 1px solid rgba(0,55,62,0.06); page-break-inside: avoid; }
  .section h3 { color: #00373E; font-size: 17px; margin-bottom: 10px; }
  .section li { font-size: 13px; color: #4D3B32; margin-bottom: 6px; }
  .sign-block { background: #00373E; color: #fff; border-radius: 16px; padding: 32px; page-break-before: always; }
  .sign-block h3 { text-align: center; font-size: 22px; margin-bottom: 24px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .sig-card { border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 16px; min-height: 110px; }
  .sig-name { font-weight: 700; }
  .sig-role { font-size: 12px; opacity: 0.7; margin-top: 4px; }
  .sig-line { margin-top: 40px; font-size: 12px; opacity: 0.5; }
  .date { text-align: center; margin-top: 24px; font-size: 13px; opacity: 0.6; }
</style>
</head>
<body>
  <section class="cover">
    <img src="../images/logo.png" alt="مفصل"/>
    <p class="gold">MUFASAL — ${esc(DATA.meta.company)}</p>
    <h1>${esc(DATA.meta.title)}</h1>
    <p>منصة الخياطة الذكية للرجال والأطفال في المملكة العربية السعودية</p>
    <div class="meta">mofasal.netlify.app • وثيقة شراكة — سري • نسخة PDF رسمية</div>
  </section>

  <div class="wrap preview">
    <h2>نظرة على المنصة</h2>
    <p class="sub">لقطات حية من النسخة التشغيلية</p>
    <div class="shots">${shotGrid}</div>
  </div>

  <div class="wrap parties-box">
    <h2>أطراف المذكرة</h2>
    <p style="font-size:13px;color:#735B4D;margin-bottom:16px;">فقد تم الاتفاق بين كل من (ويشار إليهم مجتمعين بـ «الشركاء» أو «الأطراف»):</p>
    ${parties}
  </div>

  <div class="wrap">${sections}</div>

  <div class="wrap sign-block">
    <h3>التوقيع والاعتماد</h3>
    <div class="sig-grid">${sigGrid}</div>
    <p class="date">التاريخ: ${esc(DATA.meta.datePlaceholder)}</p>
  </div>
</body>
</html>`;
}

async function main() {
  const tmpDir = await prepareImages();
  const tmpHtml = path.join(ROOT, 'public/investor/_mou-print-tmp.html');
  fs.writeFileSync(tmpHtml, buildHtml(tmpDir), 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => document.body.innerText.length > 800, { timeout: 30000 });
  await page.waitForTimeout(2500);

  const textLen = await page.evaluate(() => document.body.innerText.length);
  console.log(`Content: ${textLen} chars`);

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' },
  });

  await browser.close();
  fs.unlinkSync(tmpHtml);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.writeFileSync(OUT, pdf);
  console.log(`OK: ${OUT} (${(pdf.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

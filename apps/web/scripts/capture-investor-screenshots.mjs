import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SCREENSHOT_URL || 'https://mofasal.netlify.app';
const OUT = process.env.SCREENSHOT_OUT || path.resolve(__dirname, '../../../AUTOCORE SYSTEM FILES/investor-screenshots');

const PUBLIC_PAGES = [
  { file: '01-home', path: '/', wait: 2500 },
  { file: '02-marketplace', path: '/marketplace', wait: 2500 },
  { file: '03-shops', path: '/shops', wait: 2500 },
  { file: '04-login', path: '/login', wait: 1500 },
];

const DASHBOARDS = [
  { file: '05-admin-dashboard', token: 'demo-token-admin', path: '/dashboard/admin', wait: 3000 },
  { file: '06-tailor-dashboard', token: 'demo-token-tailor', path: '/dashboard/tailor', wait: 3000 },
  { file: '07-merchant-dashboard', token: 'demo-token-merchant', path: '/dashboard/merchant', wait: 3000 },
  { file: '08-customer-dashboard', token: 'demo-token-customer', path: '/dashboard/customer', wait: 3000 },
  { file: '09-customer-order-wizard', token: 'demo-token-customer', path: '/dashboard/customer/orders/new', wait: 3500 },
  { file: '10-admin-orders', token: 'demo-token-admin', path: '/dashboard/admin/orders', wait: 2500 },
];

async function waitForContent(page, minLen = 150) {
  const start = Date.now();
  while (Date.now() - start < 20000) {
    const len = await page.evaluate(() => (document.body?.innerText || '').length);
    const loading = await page.evaluate(() => /^جاري التحميل|^Loading/i.test((document.body?.innerText || '').trim().slice(0, 30)));
    if (len > minLen && !loading) return true;
    await page.waitForTimeout(600);
  }
  return false;
}

async function setDemoAuth(page, token) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.evaluate((tok) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('refreshToken', tok.replace('token', 'refresh'));
  }, token);
}

async function capture(page, { file, path: urlPath, wait }) {
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForContent(page);
  if (wait) await page.waitForTimeout(wait);
  const outPath = path.join(OUT, `${file}.png`);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`✓ ${file}.png`);
  return outPath;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA',
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Capturing investor screenshots from ${BASE}`);
  console.log(`Output: ${OUT}\n`);

  for (const p of PUBLIC_PAGES) {
    await capture(page, p);
  }

  for (const d of DASHBOARDS) {
    await setDemoAuth(page, d.token);
    await capture(page, d);
  }

  await browser.close();
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.png'));
  console.log(`\nDone: ${files.length} screenshots`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { chromium } from 'playwright';

const BASE = process.env.TEST_URL || 'https://mofasal.netlify.app';

async function clickNav(page, label) {
  const before = page.url();
  await page.locator(`nav a:has-text("${label}")`).first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  const after = page.url();
  return { before, after, changed: before !== after };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'demo-token-tailor');
    localStorage.setItem('refreshToken', 'demo-refresh-tailor');
  });
  await page.goto(`${BASE}/dashboard/tailor`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const tests = [
    { label: 'الطلبات', expect: '/dashboard/tailor/orders' },
    { label: 'طلب جديد', expect: '/dashboard/tailor/orders/new' },
    { label: 'الإعدادات', expect: '/dashboard/tailor/settings' },
  ];

  let passed = 0;
  for (const t of tests) {
    await page.goto(`${BASE}/dashboard/tailor`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const r = await clickNav(page, t.label);
    const ok = r.after.includes(t.expect);
    console.log(`${ok ? 'PASS' : 'FAIL'} click "${t.label}" -> ${r.after}`);
    if (ok) passed++;
  }

  console.log(`\nNavigation clicks: ${passed}/${tests.length}`);
  await browser.close();
  process.exit(passed === tests.length ? 0 : 1);
}

main();

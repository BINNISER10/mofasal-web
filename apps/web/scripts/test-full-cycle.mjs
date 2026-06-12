import { chromium } from 'playwright';

const BASE = process.env.TEST_URL || 'https://mofasal.netlify.app';

const FLOWS = [
  {
    role: 'tailor',
    token: 'demo-token-tailor',
    steps: [
      { path: '/dashboard/tailor', markers: ['لوحة الخياط', 'Tailor Dashboard', 'طلبات اليوم'] },
      { path: '/dashboard/tailor/orders', markers: ['الطلبات', 'Orders'] },
      { path: '/dashboard/tailor/orders/new', markers: ['طلب', 'Order', 'جديد', 'New'] },
      { path: '/dashboard/tailor/settings', markers: ['إعدادات', 'Settings', 'الملف'] },
      { path: '/dashboard/tailor/staff', markers: ['الموظف', 'Staff', 'موظف'] },
    ],
  },
  {
    role: 'merchant',
    token: 'demo-token-merchant',
    steps: [
      { path: '/dashboard/merchant', markers: ['التاجر', 'Merchant', 'لوحة'] },
      { path: '/dashboard/merchant/products', markers: ['المنتجات', 'Products'] },
      { path: '/dashboard/merchant/inventory', markers: ['المخزون', 'Inventory', 'مخزون'] },
      { path: '/dashboard/merchant/orders', markers: ['الطلبات', 'Orders'] },
    ],
  },
  {
    role: 'customer',
    token: 'demo-token-customer',
    steps: [
      { path: '/dashboard/customer', markers: ['حسابي', 'My Account', 'طلب'] },
      { path: '/dashboard/customer/orders/new', markers: ['طلب', 'Order', 'خياط', 'ثوب'] },
      { path: '/dashboard/customer/orders', markers: ['طلباتي', 'Orders', 'طلب'] },
      { path: '/dashboard/customer/profile', markers: ['الملف', 'Profile', 'أحمد'] },
    ],
  },
];

async function checkPage(page, step) {
  await page.goto(`${BASE}${step.path}`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  const start = Date.now();
  while (Date.now() - start < 15000) {
    const state = await page.evaluate(
      ({ path, markers }) => {
        const text = document.body?.innerText || '';
        const hit = markers.some((m) => text.includes(m));
        const loadingOnly = /^جاري التحميل\.{0,3}$|^Loading\.{0,3}$/m.test(text.trim());
        const hasError = text.includes('Application error') || text.includes('حدث خطأ');
        return {
          path: window.location.pathname,
          hit,
          loadingOnly,
          hasError,
          len: text.length,
          preview: text.replace(/\s+/g, ' ').trim().slice(0, 120),
        };
      },
      { path: step.path, markers: step.markers }
    );

    if (state.hasError) return { ok: false, reason: 'app error', ...state };
    if (state.path === '/login') return { ok: false, reason: 'redirect login', ...state };
    if (state.hit && state.len > 80) return { ok: true, ...state };
    if (!state.loadingOnly && state.len > 200) return { ok: true, ...state };
    await page.waitForTimeout(700);
  }
  const final = await page.evaluate(() => ({
    path: window.location.pathname,
    preview: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 150),
    len: (document.body?.innerText || '').length,
  }));
  return { ok: false, reason: 'timeout', ...final };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  console.log(`Full cycle test: ${BASE}\n`);
  let passed = 0;
  let failed = 0;
  const issues = [];

  for (const flow of FLOWS) {
    console.log(`=== ${flow.role.toUpperCase()} ===`);
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
      localStorage.setItem('refreshToken', tok.replace('token', 'refresh'));
    }, flow.token);

    for (const step of flow.steps) {
      const r = await checkPage(page, step);
      if (r.ok) {
        passed++;
        console.log(`  PASS ${step.path}`);
      } else {
        failed++;
        console.log(`  FAIL ${step.path} — ${r.reason}`);
        console.log(`       ${r.preview || ''}`);
        issues.push({ role: flow.role, path: step.path, reason: r.reason, preview: r.preview });
      }
    }
    console.log('');
  }

  // Customer order flow: try clicking next/submit buttons
  console.log('=== CUSTOMER ORDER FLOW ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'demo-token-customer');
    localStorage.setItem('refreshToken', 'demo-refresh-customer');
  });
  await page.goto(`${BASE}/dashboard/customer/orders/new`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  const start = Date.now();
  let orderOk = false;
  while (Date.now() - start < 12000) {
    const orderState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
        text: b.textContent?.trim(),
        disabled: b.disabled,
      }));
      const next = buttons.find((b) => b.text?.includes('التالي') || b.text?.includes('Next'));
      return { nextDisabled: next?.disabled ?? true, hasNext: !!next };
    });
    if (orderState.hasNext && !orderState.nextDisabled) {
      orderOk = true;
      break;
    }
    await page.waitForTimeout(800);
  }
  if (orderOk) {
    passed++;
    console.log('  PASS order wizard — زر التالي مفعّل');
  } else if (orderState.hasNext && orderState.nextDisabled) {
    failed++;
    issues.push({ role: 'customer', path: '/orders/new', reason: 'next button disabled', preview: JSON.stringify(orderState.buttons) });
    console.log('  FAIL order wizard — زر التالي معطّل');
  } else {
    console.log(`  WARN order wizard — ${JSON.stringify(orderState)}`);
  }

  console.log('\n--- SUMMARY ---');
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  if (issues.length) {
    console.log('Issues:');
    issues.forEach((i) => console.log(`  • [${i.role}] ${i.path}: ${i.reason}`));
  }
  if (errors.length) {
    const uniq = [...new Set(errors)];
    console.log(`JS errors: ${uniq.length}`);
    uniq.slice(0, 2).forEach((e) => console.log(`  • ${e.slice(0, 100)}`));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});

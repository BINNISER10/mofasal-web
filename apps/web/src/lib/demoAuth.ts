import type { User } from '@/lib/stores/authStore';

/** دخول تجريبي بدون API — للعرض على الشريك عند تعطل الخادم */
const DEMO_USERS: Record<string, { user: User; token: string }> = {
  admin: {
    token: 'demo-token-admin',
    user: {
      id: 'demo-admin',
      name: 'مدير النظام',
      email: 'admin@mufasal.com',
      phone: '966500000000',
      role: 'admin',
      shopId: 'demo-shop',
    },
  },
  tailor: {
    token: 'demo-token-tailor',
    user: {
      id: 'demo-tailor',
      name: 'خالد الخياط',
      email: 'tailor@mufasal.com',
      phone: '966533333333',
      role: 'tailor',
      shopId: 'demo-shop',
    },
  },
  merchant: {
    token: 'demo-token-merchant',
    user: {
      id: 'demo-merchant',
      name: 'سعد التاجر',
      email: 'merchant@mufasal.com',
      phone: '966544444444',
      role: 'merchant',
      shopId: 'demo-shop',
    },
  },
  rep: {
    token: 'demo-token-rep',
    user: {
      id: 'demo-rep',
      name: 'ماجد الشمري',
      email: 'rep@mufasal.com',
      phone: '966522222222',
      role: 'rep',
      shopId: 'demo-shop',
    },
  },
  customer: {
    token: 'demo-token-customer',
    user: {
      id: 'demo-customer',
      name: 'أحمد العميل',
      email: 'customer@mufasal.com',
      phone: '966511111111',
      role: 'customer',
      shopId: 'demo-shop',
    },
  },
};

export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function getDemoSession(role: keyof typeof DEMO_USERS) {
  return DEMO_USERS[role] ?? DEMO_USERS.customer;
}

export const DEMO_CREDENTIALS: Record<string, { phone: string; password: string; route: string }> = {
  admin: { phone: '966500000000', password: 'admin123', route: '/dashboard/admin' },
  tailor: { phone: '966533333333', password: 'admin123', route: '/dashboard/tailor' },
  merchant: { phone: '966544444444', password: 'admin123', route: '/dashboard/merchant' },
  rep: { phone: '966522222222', password: 'admin123', route: '/dashboard/rep' },
  customer: { phone: '966511111111', password: 'admin123', route: '/dashboard/customer' },
};

import type { User } from '@/lib/stores/authStore';

/** دخول تجريبي بدون API — للعرض على الشريك عند تعطل الخادم */
const baseUser = (overrides: Partial<User> & Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role'>): User => ({
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const DEMO_USERS: Record<string, { user: User; token: string }> = {
  admin: {
    token: 'demo-token-admin',
    user: baseUser({
      id: 'demo-admin',
      name: 'مدير النظام',
      email: 'admin@mufasal.com',
      phone: '966500000000',
      role: 'admin',
    }),
  },
  tailor: {
    token: 'demo-token-tailor',
    user: baseUser({
      id: 'demo-tailor',
      name: 'خالد الخياط',
      email: 'tailor@mufasal.com',
      phone: '966533333333',
      role: 'tailor',
      shopId: 'shop-riyadh-1',
    }),
  },
  merchant: {
    token: 'demo-token-merchant',
    user: baseUser({
      id: 'demo-merchant',
      name: 'سعد التاجر',
      email: 'merchant@mufasal.com',
      phone: '966544444444',
      role: 'merchant',
      merchantId: 'demo-merchant',
    }),
  },
  rep: {
    token: 'demo-token-rep',
    user: baseUser({
      id: 'demo-rep',
      name: 'ماجد الشمري',
      email: 'rep@mufasal.com',
      phone: '966522222222',
      role: 'rep',
    }),
  },
  customer: {
    token: 'demo-token-customer',
    user: baseUser({
      id: 'demo-customer',
      name: 'أحمد العميل',
      email: 'customer@mufasal.com',
      phone: '966511111111',
      role: 'customer',
    }),
  },
};

export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function isDemoToken(token: string | null | undefined): boolean {
  return !!token?.startsWith('demo-token');
}

export function getDemoSession(role: keyof typeof DEMO_USERS) {
  return DEMO_USERS[role] ?? DEMO_USERS.customer;
}

/** استرجاع مستخدم العرض من التوكن المحفوظ (بعد تحديث الصفحة) */
export function getDemoUserFromToken(token: string | null | undefined) {
  if (!token?.startsWith('demo-token-')) return null;
  const role = token.replace('demo-token-', '') as keyof typeof DEMO_USERS;
  return DEMO_USERS[role]?.user ?? null;
}

export const DEMO_CREDENTIALS: Record<string, { phone: string; password: string; route: string }> = {
  admin: { phone: '966500000000', password: 'admin123', route: '/dashboard/admin' },
  tailor: { phone: '966533333333', password: 'admin123', route: '/dashboard/tailor' },
  merchant: { phone: '966544444444', password: 'admin123', route: '/dashboard/merchant' },
  rep: { phone: '966522222222', password: 'admin123', route: '/dashboard/rep' },
  customer: { phone: '966511111111', password: 'admin123', route: '/dashboard/customer' },
};

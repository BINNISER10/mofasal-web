/** يحوّل أسماء الأدوار من قاعدة البيانات إلى أدوار الواجهة */
export function normalizeRole(role: string): string {
  const key = role.toUpperCase();
  const map: Record<string, string> = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'admin',
    TAILOR: 'tailor',
    TAILOR_SHOP: 'tailor',
    MERCHANT: 'merchant',
    CUSTOMER: 'customer',
    REPRESENTATIVE: 'rep',
    REP: 'rep',
  };
  return map[key] || role.toLowerCase();
}

import { SystemSetting } from '../types/admin';

export const TOGGLE_DEPENDENCIES: Record<string, string[]> = {
  tailoring_module: ['on_site_measurement', 'measurement_service', 'order_tracking', 'tailor_dashboard'],
  on_site_measurement: ['shop_vehicle_delivery', 'uber_delivery', 'careen_delivery', 'jeeny_delivery', 'staff_on_way_tracking'],
  delivery_service: ['shop_vehicle_delivery', 'uber_delivery', 'careen_delivery', 'jeeny_delivery', 'smsa_delivery', 'aramex_delivery', 'real_time_tracking'],
  payment_gateway: ['cod', 'bnpl', 'stc_pay', 'tamara', 'tabby'],
  fabric_marketplace: ['merchant_dashboard', 'product_reviews', 'inventory_tracking'],
  review_system: ['dimensional_ratings', 'review_moderation'],
  confirmation_links: ['whatsapp_notifications', 'sms_notifications'],
  multi_language: [],
  staff_management: ['staff_scheduling', 'performance_tracking', 'commission_calculation'],
  zatca_integration: ['tax_invoice_generation', 'qr_code_generation'],
  customer_notifications: ['push_notifications', 'email_notifications', 'sms_notifications'],
};

export const AFFECTED_TOGGLES: Record<string, string[]> = {};

for (const [parent, children] of Object.entries(TOGGLE_DEPENDENCIES)) {
  for (const child of children) {
    if (!AFFECTED_TOGGLES[child]) {
      AFFECTED_TOGGLES[child] = [];
    }
    AFFECTED_TOGGLES[child].push(parent);
  }
}

function getCascadeKeys(
  toggleKey: string,
  newValue: boolean,
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(toggleKey)) return [];
  visited.add(toggleKey);

  const result: string[] = [];

  if (newValue === false) {
    const children = TOGGLE_DEPENDENCIES[toggleKey] ?? [];
    for (const child of children) {
      if (!visited.has(child)) {
        result.push(child);
        result.push(...getCascadeKeys(child, false, visited));
      }
    }
  } else {
    const parents = AFFECTED_TOGGLES[toggleKey] ?? [];
    for (const parent of parents) {
      if (!visited.has(parent)) {
        result.push(parent);
        result.push(...getCascadeKeys(parent, true, visited));
      }
    }
  }

  return result;
}

export function getCascadingChanges(
  toggleKey: string,
  newValue: boolean,
  currentConfig: SystemSetting[]
): SystemSetting[] {
  const configMap = new Map<string, SystemSetting>();
  for (const setting of currentConfig) {
    configMap.set(setting.key, { ...setting });
  }

  const cascadeKeys = getCascadeKeys(toggleKey, newValue);

  for (const key of cascadeKeys) {
    const existing = configMap.get(key);
    if (existing) {
      existing.value = newValue === false ? 'false' : 'true';
      configMap.set(key, existing);
    }
  }

  const target = configMap.get(toggleKey);
  if (target) {
    target.value = newValue ? 'true' : 'false';
    configMap.set(toggleKey, target);
  }

  return Array.from(configMap.values());
}

export function validateToggleChange(
  toggleKey: string,
  newValue: boolean,
  currentConfig: SystemSetting[]
): {
  valid: boolean;
  conflicts: string[];
  cascadingChanges: SystemSetting[];
} {
  const conflicts: string[] = [];
  const configMap = new Map<string, SystemSetting>();
  for (const s of currentConfig) {
    configMap.set(s.key, s);
  }

  if (newValue === true) {
    const parents = AFFECTED_TOGGLES[toggleKey] ?? [];
    for (const parent of parents) {
      const p = configMap.get(parent);
      if (p && p.value === 'false') {
        conflicts.push(`"${toggleKey}" requires "${parent}" to be enabled`);
      }
    }
  }

  const cascadingChanges = getCascadingChanges(toggleKey, newValue, currentConfig);

  return {
    valid: conflicts.length === 0,
    conflicts,
    cascadingChanges,
  };
}

const MODULE_GROUP_MAP: Record<string, string> = {
  tailoring_module: 'SERVICES',
  on_site_measurement: 'SERVICES',
  measurement_service: 'SERVICES',
  delivery_service: 'DELIVERY',
  shop_vehicle_delivery: 'DELIVERY',
  uber_delivery: 'DELIVERY',
  careen_delivery: 'DELIVERY',
  jeeny_delivery: 'DELIVERY',
  smsa_delivery: 'DELIVERY',
  aramex_delivery: 'DELIVERY',
  real_time_tracking: 'DELIVERY',
  payment_gateway: 'PAYMENT',
  cod: 'PAYMENT',
  bnpl: 'PAYMENT',
  stc_pay: 'PAYMENT',
  tamara: 'PAYMENT',
  tabby: 'PAYMENT',
  fabric_marketplace: 'FEATURES',
  review_system: 'FEATURES',
  dimensional_ratings: 'FEATURES',
  review_moderation: 'FEATURES',
  confirmation_links: 'FEATURES',
  multi_language: 'FEATURES',
  staff_management: 'FEATURES',
  staff_scheduling: 'FEATURES',
  performance_tracking: 'FEATURES',
  commission_calculation: 'FEATURES',
  merchant_dashboard: 'FEATURES',
  product_reviews: 'FEATURES',
  inventory_tracking: 'FEATURES',
  customer_notifications: 'FEATURES',
  push_notifications: 'FEATURES',
  email_notifications: 'FEATURES',
  sms_notifications: 'FEATURES',
  whatsapp_notifications: 'FEATURES',
  zatca_integration: 'INTEGRATIONS',
  tax_invoice_generation: 'INTEGRATIONS',
  qr_code_generation: 'INTEGRATIONS',
  tailor_dashboard: 'FEATURES',
  order_tracking: 'FEATURES',
  staff_on_way_tracking: 'FEATURES',
};

export function getModuleGroup(moduleKey: string): string {
  return MODULE_GROUP_MAP[moduleKey] ?? 'OTHER';
}

export function getModuleLabel(moduleKey: string, locale: 'ar' | 'en' = 'en'): string {
  const labels: Record<string, { en: string; ar: string }> = {
    tailoring_module: { en: 'Tailoring Module', ar: 'وحدة الخياطة' },
    on_site_measurement: { en: 'On-Site Measurement', ar: 'القياس في الموقع' },
    measurement_service: { en: 'Measurement Service', ar: 'خدمة القياس' },
    order_tracking: { en: 'Order Tracking', ar: 'تتبع الطلب' },
    delivery_service: { en: 'Delivery Service', ar: 'خدمة التوصيل' },
    payment_gateway: { en: 'Payment Gateway', ar: 'بوابة الدفع' },
    fabric_marketplace: { en: 'Fabric Marketplace', ar: 'سوق الأقمشة' },
    review_system: { en: 'Review System', ar: 'نظام التقييم' },
    confirmation_links: { en: 'Confirmation Links', ar: 'روابط التأكيد' },
    multi_language: { en: 'Multi Language', ar: 'لغات متعددة' },
    staff_management: { en: 'Staff Management', ar: 'إدارة الموظفين' },
    customer_notifications: { en: 'Customer Notifications', ar: 'إشعارات العملاء' },
    zatca_integration: { en: 'ZATCA Integration', ar: 'ربط زكاة وضريبة' },
    real_time_tracking: { en: 'Real-Time Tracking', ar: 'تتبع مباشر' },
  };
  const label = labels[moduleKey];
  if (!label) return moduleKey;
  return locale === 'ar' ? label.ar : label.en;
}

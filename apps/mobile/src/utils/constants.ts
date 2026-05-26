export const APP_NAME = 'مفصل';
export const APP_VERSION = '1.0.0';

export const API_CONFIG = {
  BASE_URL: 'https://api.mufasal.com/v1',
  TIMEOUT: 30000,
};

export const SAUDI_PHONE_PREFIX = '+966';
export const SAUDI_PHONE_LENGTH = 9;

export const VAT_PERCENTAGE = 0.15;

export const ORDER_STATUS = {
  RECEIVED: 'received',
  STAFF_ON_WAY: 'staff_on_way',
  TAKING_MEASUREMENTS: 'taking_measurements',
  CUTTING_FABRIC: 'cutting_fabric',
  SEWING_ASSEMBLY: 'sewing_assembly',
  IRONING_FINISHING: 'ironing_finishing',
  PACKING_WRAPPING: 'packing_wrapping',
  ON_WAY_TO_YOU: 'on_way_to_you',
  DELIVERED: 'delivered',
} as const;

export const ORDER_STATUS_AR = {
  received: 'استلمنا الطلب',
  staff_on_way: 'المندوب في الطريق',
  taking_measurements: 'أخذ المقاسات',
  cutting_fabric: 'قص القماش',
  sewing_assembly: 'الخياطة والتجميع',
  ironing_finishing: 'الكي والتشطيب',
  packing_wrapping: 'التغليف والتعبئة',
  on_way_to_you: 'الطلب في طريقه إليك',
  delivered: 'تم التوصيل بنجاح',
} as const;

export const DELIVERY_PROVIDERS = [
  'shop_vehicle',
  'uber',
  'careen',
  'jeeny',
  'smsa',
  'aramex',
] as const;

export const PAYMENT_METHODS = [
  'mada',
  'visa',
  'mastercard',
  'apple_pay',
  'google_pay',
  'stc_pay',
  'tamara',
  'tabby',
  'sadad',
  'bank_transfer',
  'cod',
] as const;

export const MEASUREMENT_CATEGORIES = {
  upper_body: {
    label: 'القياسات العلوية',
    fields: ['neck', 'shoulders', 'chest', 'waist', 'bicep', 'forearm', 'wrist', 'sleeve_length', 'shirt_length'],
  },
  lower_body: {
    label: 'القياسات السفلية',
    fields: ['waist_lower', 'hips', 'thigh', 'knee', 'calf', 'inseam', 'outseam', 'trouser_length'],
  },
} as const;

export const MEASUREMENT_LABELS: Record<string, string> = {
  neck: 'محيط الرقبة',
  shoulders: 'عرض الأكتاف',
  chest: 'محيط الصدر',
  waist: 'محيط الخصر',
  bicep: 'محيط الذراع',
  forearm: 'محيط الساعد',
  wrist: 'محيط المعصم',
  sleeve_length: 'طول الكم',
  shirt_length: 'طول القميص',
  waist_lower: 'محيط الخصر (سفلي)',
  hips: 'محيط الأرداف',
  thigh: 'محيط الفخذ',
  knee: 'محيط الركبة',
  calf: 'محيط الساق',
  inseam: 'طول الدرزة الداخلية',
  outseam: 'طول الدرزة الخارجية',
  trouser_length: 'طول البنطلون',
};

export const SERVICE_TYPES = [
  { id: 'on_site_measurement', label: 'القياس المنزلي', icon: 'home' },
  { id: 'in_shop_measurement', label: 'القياس في المحل', icon: 'store' },
  { id: 'tailoring', label: 'خياطة', icon: 'content-cut' },
  { id: 'alteration', label: 'تعديل', icon: 'tune' },
  { id: 'consultation', label: 'استشارة', icon: 'chat' },
] as const;

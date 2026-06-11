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

// ═══════════════════════════════════════════════════════════
//  نظام القياس الاحترافي (ذكور فقط — ثقافة الثوب السعودي)
// ═══════════════════════════════════════════════════════════

// الخطوة 1: نوع الزبون
export const CUSTOMER_TYPES = [
  { id: 'man', label: 'رجل', emoji: '🧔', needsAge: false },
  { id: 'boy', label: 'طفل', emoji: '👦', needsAge: true },
] as const;

// الخطوة 2: نوع القطعة (يحدد القياسات المطلوبة)
export const GARMENT_TYPES = [
  { id: 'thobe', label: 'ثوب', emoji: '🧣', primary: true },
  { id: 'bisht', label: 'بشت / مشلح', emoji: '🧥' },
  { id: 'sirwal', label: 'سروال', emoji: '👖' },
  { id: 'suit', label: 'بدلة', emoji: '👔' },
  { id: 'alteration', label: 'تعديل', emoji: '✂️' },
] as const;

// الخطوة 3: مناطق القياس الملوّنة (كل منطقة لون ثابت + حقولها)
export interface MeasurementField {
  key: string;
  label: string;
  hint: string;
  min: number;
  max: number;
}
export interface MeasurementZone {
  id: string;
  label: string;
  color: string;
  emoji: string;
  fields: MeasurementField[];
}

export const MEASUREMENT_ZONES: MeasurementZone[] = [
  {
    id: 'neck_shoulder',
    label: 'الرقبة والكتف',
    color: '#1A6470',
    emoji: '👔',
    fields: [
      { key: 'neck', label: 'محيط الرقبة', hint: 'قِس حول أعرض جزء من الرقبة', min: 25, max: 55 },
      { key: 'shoulders', label: 'عرض الأكتاف', hint: 'من طرف كتف لطرف الكتف الآخر', min: 30, max: 60 },
    ],
  },
  {
    id: 'chest_torso',
    label: 'الصدر والجذع',
    color: '#00373E',
    emoji: '🫁',
    fields: [
      { key: 'chest', label: 'محيط الصدر', hint: 'حول أعرض جزء من الصدر', min: 60, max: 150 },
      { key: 'length', label: 'طول القطعة', hint: 'من الكتف حتى نهاية الثوب', min: 80, max: 165 },
      { key: 'width', label: 'النص (عرض الأسفل)', hint: 'عرض الثوب عند الأسفل', min: 40, max: 90 },
    ],
  },
  {
    id: 'sleeves',
    label: 'الأكمام',
    color: '#D4AF37',
    emoji: '💪',
    fields: [
      { key: 'sleeve_length', label: 'طول الكم', hint: 'من الكتف حتى المعصم', min: 40, max: 75 },
      { key: 'bicep', label: 'محيط الذراع', hint: 'حول أعرض جزء من العضد', min: 20, max: 50 },
      { key: 'cuff', label: 'الزند / الكبك', hint: 'محيط نهاية الكم', min: 14, max: 30 },
    ],
  },
  {
    id: 'waist_hips',
    label: 'الخصر والأرداف',
    color: '#481719',
    emoji: '🩳',
    fields: [
      { key: 'waist', label: 'محيط الخصر', hint: 'حول الخصر الطبيعي', min: 50, max: 140 },
      { key: 'hips', label: 'محيط الأرداف', hint: 'حول أعرض جزء من الأرداف', min: 60, max: 150 },
      { key: 'thigh', label: 'محيط الفخذ', hint: 'حول أعرض جزء من الفخذ', min: 30, max: 80 },
    ],
  },
  {
    id: 'legs',
    label: 'الأرجل',
    color: '#735B4D',
    emoji: '🦵',
    fields: [
      { key: 'inseam', label: 'الدرزة الداخلية', hint: 'من أعلى الفخذ حتى الكاحل', min: 50, max: 100 },
      { key: 'trouser_length', label: 'طول السروال', hint: 'من الخصر حتى الكاحل', min: 70, max: 120 },
    ],
  },
];

// أي حقول قياس تنطبق على كل قطعة
export const GARMENT_FIELDS: Record<string, string[]> = {
  thobe: ['neck', 'shoulders', 'chest', 'length', 'width', 'sleeve_length', 'cuff', 'waist'],
  bisht: ['shoulders', 'length', 'sleeve_length', 'width'],
  sirwal: ['waist', 'hips', 'thigh', 'inseam', 'trouser_length'],
  suit: ['neck', 'shoulders', 'chest', 'length', 'sleeve_length', 'waist', 'hips', 'thigh', 'inseam', 'trouser_length'],
  alteration: [],
};

// مواصفات الثوب السعودي الاحترافية (تظهر عند اختيار "ثوب")
export const THOBE_SPECS = {
  season: {
    label: 'الموسم / القماش',
    options: [
      { id: 'summer', label: 'صيفي', hint: 'قطن، نياقة خفيف، سويسري' },
      { id: 'winter', label: 'شتوي', hint: 'صوف، نياقة ثقيل، كشمير' },
      { id: 'formal', label: 'رسمي / مناسبات', hint: 'دورمى، أقمشة فاخرة' },
    ],
  },
  collar: {
    label: 'نوع الياقة',
    options: [
      { id: 'classic', label: 'رسمية واقفة' },
      { id: 'buttoned', label: 'بأزرار' },
      { id: 'no_buttons', label: 'بدون أزرار' },
      { id: 'double', label: 'مكوّنة (دبل)' },
    ],
  },
  cuff: {
    label: 'نوع الكبك / الزند',
    options: [
      { id: 'french_cuff', label: 'كبك (French Cuff)' },
      { id: 'button', label: 'زر عادي' },
      { id: 'ironed', label: 'مكوى' },
    ],
  },
  cut: {
    label: 'القصّة / الموديل',
    options: [
      { id: 'saudi_classic', label: 'سعودي كلاسيكي' },
      { id: 'gulf_modern', label: 'خليجي معاصر' },
      { id: 'slim', label: 'مرني / ضيّق' },
    ],
  },
  embroidery: {
    label: 'التطريز',
    options: [
      { id: 'none', label: 'بدون' },
      { id: 'collar', label: 'الياقة' },
      { id: 'cuff', label: 'الكبك' },
      { id: 'collar_cuff', label: 'الياقة + الكبك' },
    ],
  },
} as const;

// الخطوة 4: مصدر القماش
export const FABRIC_SOURCES = [
  { id: 'physical', label: 'مع المندوب (على طبيعة)', emoji: '🧵', hint: 'اختر من عيّنات المندوب' },
  { id: 'catalog', label: 'من كتالوج التطبيق', emoji: '📱', hint: 'يُطلب من التاجر' },
] as const;

export enum MeasurementCategory {
  UPPER_BODY = 'UPPER_BODY',
  LOWER_BODY = 'LOWER_BODY',
  FULL_BODY = 'FULL_BODY',
}

export interface MeasurementType {
  key: string;
  labelEn: string;
  labelAr: string;
  unit: string;
  category: MeasurementCategory;
  min: number;
  max: number;
  step: number;
}

export const MEASUREMENT_TYPES: MeasurementType[] = [
  { key: 'neck', labelEn: 'Neck Circumference', labelAr: 'محيط الرقبة', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 20, max: 60, step: 0.5 },
  { key: 'shoulderWidth', labelEn: 'Shoulder Width', labelAr: 'عرض الكتف', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 30, max: 70, step: 0.5 },
  { key: 'chestWidth', labelEn: 'Chest Width', labelAr: 'عرض الصدر', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 60, max: 180, step: 0.5 },
  { key: 'waistWidth', labelEn: 'Waist Width', labelAr: 'عرض الخصر', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 50, max: 170, step: 0.5 },
  { key: 'hipWidth', labelEn: 'Hip Width', labelAr: 'عرض الأرداف', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 60, max: 180, step: 0.5 },
  { key: 'sleeveLength', labelEn: 'Sleeve Length', labelAr: 'طول الكم', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 40, max: 75, step: 0.5 },
  { key: 'bicepCircumference', labelEn: 'Bicep Circumference', labelAr: 'محيط العضد', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 15, max: 60, step: 0.5 },
  { key: 'wristCircumference', labelEn: 'Wrist Circumference', labelAr: 'محيط الرسغ', unit: 'cm', category: MeasurementCategory.UPPER_BODY, min: 10, max: 30, step: 0.5 },
  { key: 'shirtLength', labelEn: 'Shirt Length', labelAr: 'طول القميص', unit: 'cm', category: MeasurementCategory.FULL_BODY, min: 60, max: 120, step: 0.5 },
  { key: 'trouserWaist', labelEn: 'Trouser Waist', labelAr: 'خصر البنطال', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 50, max: 170, step: 0.5 },
  { key: 'trouserLength', labelEn: 'Trouser Length', labelAr: 'طول البنطال', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 70, max: 130, step: 0.5 },
  { key: 'inseam', labelEn: 'Inseam', labelAr: 'طول الدرز الداخلي', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 50, max: 100, step: 0.5 },
  { key: 'outseam', labelEn: 'Outseam', labelAr: 'طول الدرز الخارجي', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 70, max: 130, step: 0.5 },
  { key: 'thighCircumference', labelEn: 'Thigh Circumference', labelAr: 'محيط الفخذ', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 30, max: 90, step: 0.5 },
  { key: 'kneeCircumference', labelEn: 'Knee Circumference', labelAr: 'محيط الركبة', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 20, max: 60, step: 0.5 },
  { key: 'calfCircumference', labelEn: 'Calf Circumference', labelAr: 'محيط الساق', unit: 'cm', category: MeasurementCategory.LOWER_BODY, min: 20, max: 60, step: 0.5 },
  { key: 'jacketLength', labelEn: 'Jacket Length', labelAr: 'طول الجاكيت', unit: 'cm', category: MeasurementCategory.FULL_BODY, min: 50, max: 110, step: 0.5 },
  { key: 'vestLength', labelEn: 'Vest Length', labelAr: 'طول الصدرية', unit: 'cm', category: MeasurementCategory.FULL_BODY, min: 40, max: 80, step: 0.5 },
];

export const MEASUREMENT_CATEGORIES = {
  UPPER_BODY: {
    label: 'Upper Body',
    labelAr: 'الجزء العلوي',
    keys: ['neck', 'shoulderWidth', 'chestWidth', 'waistWidth', 'sleeveLength', 'bicepCircumference', 'wristCircumference', 'shirtLength'],
  },
  LOWER_BODY: {
    label: 'Lower Body',
    labelAr: 'الجزء السفلي',
    keys: ['hipWidth', 'trouserWaist', 'trouserLength', 'inseam', 'outseam', 'thighCircumference', 'kneeCircumference', 'calfCircumference'],
  },
  FULL_BODY: {
    label: 'Full Body',
    labelAr: 'كامل الجسم',
    keys: ['jacketLength', 'vestLength'],
  },
} as const;

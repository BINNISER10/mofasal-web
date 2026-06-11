/** تدفق العميل: اختر → أكد → تابع */

export const WIZARD_STEPS = [
  { id: 'choose', labelAr: 'اختر', labelEn: 'Choose', icon: 'store' },
  { id: 'confirm', labelAr: 'أكد', labelEn: 'Confirm', icon: 'check' },
  { id: 'track', labelAr: 'تابع', labelEn: 'Track', icon: 'truck' },
] as const;

/** 7 مراحل ظاهرة للعميل — المراحل التفصيلية في الـ backend مخفية خلف «قيد التصنيع» */
export const CUSTOMER_TRACKING_STAGES = [
  {
    id: 'received',
    labelAr: 'تم الاستلام',
    labelEn: 'Order received',
    statuses: ['PENDING'],
  },
  {
    id: 'confirmed',
    labelAr: 'تم التأكيد',
    labelEn: 'Confirmed',
    statuses: ['CONFIRMED'],
  },
  {
    id: 'measuring',
    labelAr: 'أخذ المقاسات',
    labelEn: 'Taking measurements',
    statuses: ['STAFF_ON_WAY', 'TAKING_MEASUREMENTS'],
  },
  {
    id: 'making',
    labelAr: 'قيد التصنيع',
    labelEn: 'In production',
    statuses: [
      'IN_PROGRESS',
      'CUTTING_FABRIC',
      'SEWING_ASSEMBLY',
      'IRONING_FINISHING',
      'PACKING_WRAPPING',
    ],
  },
  {
    id: 'ready',
    labelAr: 'جاهز للتوصيل',
    labelEn: 'Ready',
    statuses: ['READY_FOR_DELIVERY'],
  },
  {
    id: 'delivery',
    labelAr: 'في الطريق',
    labelEn: 'On the way',
    statuses: ['OUT_FOR_DELIVERY'],
  },
  {
    id: 'delivered',
    labelAr: 'تم التسليم',
    labelEn: 'Delivered',
    statuses: ['DELIVERED', 'COMPLETED'],
  },
] as const;

export const TERMINAL_ORDER_STATUSES = ['CANCELLED', 'RETURNED'] as const;

export function getCustomerTrackingIndex(status: string): number {
  if (TERMINAL_ORDER_STATUSES.includes(status as (typeof TERMINAL_ORDER_STATUSES)[number])) {
    return -1;
  }
  const idx = CUSTOMER_TRACKING_STAGES.findIndex((s) =>
    (s.statuses as readonly string[]).includes(status)
  );
  return idx >= 0 ? idx : 0;
}

export function getCustomerStageLabel(status: string, isRTL = true): string {
  const stage = CUSTOMER_TRACKING_STAGES.find((s) =>
    (s.statuses as readonly string[]).includes(status)
  );
  if (!stage) {
    if (status === 'CANCELLED') return isRTL ? 'ملغي' : 'Cancelled';
    if (status === 'RETURNED') return isRTL ? 'مرتجع' : 'Returned';
    return status;
  }
  return isRTL ? stage.labelAr : stage.labelEn;
}

const PAYMENT_MAP: Record<string, string> = {
  mada: 'MADA',
  applepay: 'APPLE_PAY',
  stcpay: 'STC_PAY',
  tamara: 'TAMARA',
  tabby: 'TABBY',
  cash: 'CASH',
  card: 'VISA_MASTERCARD',
  CASH: 'CASH',
  CARD: 'VISA_MASTERCARD',
  APPLE_PAY: 'APPLE_PAY',
  MOYASAR: 'MADA',
};

export function mapPaymentMethod(id: string): string {
  return PAYMENT_MAP[id] || id.toUpperCase();
}

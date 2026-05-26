export function formatCurrency(amount: number, locale: 'ar' | 'en' = 'en'): string {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: 'ar' | 'en' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `+966 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('966')) {
    const without966 = cleaned.slice(3);
    return `+966 ${without966.slice(0, 3)} ${without966.slice(3, 6)} ${without966.slice(6)}`;
  }
  return phone;
}

export function formatDistance(meters: number, locale: 'ar' | 'en' = 'en'): string {
  const km = meters / 1000;
  if (km < 1) {
    return locale === 'ar' ? `${Math.round(meters)} متر` : `${Math.round(meters)} m`;
  }
  const formatted = km.toFixed(1);
  return locale === 'ar' ? `${formatted} كم` : `${formatted} km`;
}

export function formatDuration(minutes: number, locale: 'ar' | 'en' = 'en'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === 'ar') {
    if (hours === 0) return `${mins} دقيقة`;
    if (mins === 0) return `${hours} ساعة`;
    return `${hours} ساعة ${mins} دقيقة`;
  }

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
}

export function formatRating(rating: number, locale: 'ar' | 'en' = 'en'): string {
  const formatted = rating.toFixed(1);
  if (locale === 'ar') {
    const arabicDigits = formatted.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    return arabicDigits;
  }
  return formatted;
}

export function getStatusLabel(status: string, locale: 'ar' | 'en' = 'en'): string {
  const labels: Record<string, { en: string; ar: string }> = {
    ORDER_RECEIVED: { en: 'Order Received', ar: 'تم استلام الطلب' },
    STAFF_ON_WAY: { en: 'Staff On Way', ar: 'الموظف في الطريق' },
    TAKING_MEASUREMENTS: { en: 'Taking Measurements', ar: 'أخذ المقاسات' },
    CUTTING_FABRIC: { en: 'Cutting Fabric', ar: 'قص القماش' },
    SEWING_ASSEMBLY: { en: 'Sewing & Assembly', ar: 'الخياطة والتجميع' },
    IRONING_FINISHING: { en: 'Ironing & Finishing', ar: 'الكي والتشطيب' },
    PACKING_WRAPPING: { en: 'Packing & Wrapping', ar: 'التغليف والتعبئة' },
    ON_WAY_TO_CUSTOMER: { en: 'On Way to Customer', ar: 'في الطريق إلى العميل' },
    DELIVERED: { en: 'Delivered', ar: 'تم التوصيل' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
    REFUNDED: { en: 'Refunded', ar: 'تم الاسترداد' },
    PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
    ACCEPTED: { en: 'Accepted', ar: 'مقبول' },
    IN_PROGRESS: { en: 'In Progress', ar: 'قيد التنفيذ' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل' },
    ACTIVE: { en: 'Active', ar: 'نشط' },
    SUSPENDED: { en: 'Suspended', ar: 'موقوف' },
    BANNED: { en: 'Banned', ar: 'محظور' },
  };

  const label = labels[status];
  if (!label) return status;
  return locale === 'ar' ? label.ar : label.en;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatISODate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('966')) {
    return `+966 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('05')) {
    return `+966 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function getRelativeTime(date: string | Date, locale: string = 'ar'): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (locale === 'ar') {
    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHour < 24) return `منذ ${diffHour} ساعة`;
    if (diffDay < 7) return `منذ ${diffDay} يوم`;
    return formatDate(d, 'ar');
  }

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour ago`;
  if (diffDay < 7) return `${diffDay} day ago`;
  return formatDate(d, 'en');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'badge-gold',
    CONFIRMED: 'badge-blue',
    TAKING_MEASUREMENTS: 'badge-blue',
    CUTTING_FABRIC: 'badge-gold',
    SEWING_ASSEMBLY: 'badge-gold',
    IRONING_FINISHING: 'badge-gold',
    PACKING_WRAPPING: 'badge-gold',
    ON_WAY_TO_CUSTOMER: 'badge-blue',
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red',
    RETURNED: 'badge-red',
    ACTIVE: 'badge-green',
    INACTIVE: 'badge-gray',
    SUSPENDED: 'badge-red',
    BANNED: 'badge-red',
    APPROVED: 'badge-green',
    REJECTED: 'badge-red',
    PENDING_VERIFICATION: 'badge-gold',
    LOW_STOCK: 'badge-red',
    IN_STOCK: 'badge-green',
    OUT_OF_STOCK: 'badge-gray',
    PAID: 'badge-green',
    UNPAID: 'badge-gold',
    REFUNDED: 'badge-blue',
    FAILED: 'badge-red',
  };
  return colors[status] || 'badge-gray';
}

export function getStatusLabel(status: string, locale: string = 'ar'): string {
  const labels: Record<string, Record<string, string>> = {
    PENDING: { ar: 'قيد الانتظار', en: 'Pending' },
    CONFIRMED: { ar: 'تم التأكيد', en: 'Confirmed' },
    TAKING_MEASUREMENTS: { ar: 'أخذ المقاسات', en: 'Taking Measurements' },
    STAFF_ON_WAY: { ar: 'الموظف في الطريق', en: 'Staff on Way' },
    CUTTING_FABRIC: { ar: 'قص القماش', en: 'Cutting Fabric' },
    SEWING_ASSEMBLY: { ar: 'الخياطة والتجميع', en: 'Sewing & Assembly' },
    IRONING_FINISHING: { ar: 'الكوي والتشطيب', en: 'Ironing & Finishing' },
    PACKING_WRAPPING: { ar: 'التغليف', en: 'Packing & Wrapping' },
    ON_WAY_TO_CUSTOMER: { ar: 'في الطريق إليك', en: 'On Way to You' },
    DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
    CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
    RETURNED: { ar: 'مرتجع', en: 'Returned' },
    ACTIVE: { ar: 'نشط', en: 'Active' },
    INACTIVE: { ar: 'غير نشط', en: 'Inactive' },
    SUSPENDED: { ar: 'موقوف', en: 'Suspended' },
    BANNED: { ar: 'محظور', en: 'Banned' },
  };
  return labels[status]?.[locale] || status;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

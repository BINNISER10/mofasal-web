let orderCounter = 0;

export function generateOrderNumber(): string {
  orderCounter = (orderCounter + 1) % 9999;
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const seq = orderCounter.toString().padStart(4, '0');
  return `MUF-${y}${m}${d}-${seq}`;
}

export function resetOrderCounter(): void {
  orderCounter = 0;
}

import { randomBytes } from 'crypto';

export function generateConfirmationToken(): string {
  return randomBytes(32).toString('hex');
}

const EARTH_RADIUS_KM = 6371;

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 100) / 100;
}

export function calculateVAT(amount: number): number {
  return Math.round(amount * 0.15 * 100) / 100;
}

export function calculateGrandTotal(subtotal: number, vat: number, deliveryFee: number): number {
  return Math.round((subtotal + vat + deliveryFee) * 100) / 100;
}

export function calculateDeliveryFee(distanceKm: number, baseFee: number, perKmRate: number): number {
  return Math.round((baseFee + distanceKm * perKmRate) * 100) / 100;
}

export function generateQRCodePayload(invoice: {
  sellerName: string;
  taxNumber: string;
  invoiceDate: string;
  totalVat: number;
  totalAmount: number;
}): string {
  const tags = [
    { tag: 1, value: invoice.sellerName },
    { tag: 2, value: invoice.taxNumber },
    { tag: 3, value: invoice.invoiceDate },
    { tag: 4, value: invoice.totalVat.toFixed(2) },
    { tag: 5, value: invoice.totalAmount.toFixed(2) },
  ];

  const tlvBuffer = tags.map(({ tag, value }) => {
    const valueBytes = Buffer.from(value, 'utf-8');
    const tagBytes = Buffer.from([tag]);
    const lengthBytes = Buffer.from([valueBytes.length]);
    return Buffer.concat([tagBytes, lengthBytes, valueBytes]);
  });

  return Buffer.concat(tlvBuffer).toString('base64');
}

export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('966') && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith('05') && cleaned.length === 10) return '966' + cleaned.slice(1);
  if (cleaned.startsWith('5') && cleaned.length === 9) return '966' + cleaned;
  return cleaned;
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local] = parts;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(0, local.length - 2))}@${parts[1]}`;
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return phone;
  return cleaned.slice(0, 2) + '****' + cleaned.slice(-2);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function parseAddressComponents(address: string): {
  street?: string;
  district?: string;
  city?: string;
  region?: string;
} {
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 4) {
    return { street: parts[0], district: parts[1], city: parts[2], region: parts[3] };
  }
  if (parts.length === 3) {
    return { street: parts[0], city: parts[1], region: parts[2] };
  }
  return { street: parts[0] };
}

export function getTimeAgo(date: Date | string, locale: 'ar' | 'en' = 'en'): string {
  const now = Date.now();
  const d = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (locale === 'ar') {
    if (seconds < 60) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    if (weeks < 5) return `منذ ${weeks} أسبوع`;
    if (months < 12) return `منذ ${months} شهر`;
    return `منذ ${years} سنة`;
  }

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateOTP(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(05\d{8}|9665\d{8}|5\d{8})$/.test(cleaned);
}

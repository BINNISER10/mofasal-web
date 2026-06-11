export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('966')) return `+${cleaned}`;
  if (cleaned.startsWith('05')) return `+966${cleaned.slice(1)}`;
  if (cleaned.startsWith('5')) return `+966${cleaned}`;
  return `+966${cleaned}`;
};

export const isValidSaudiPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]/g, '');
  const patterns = [
    /^05\d{8}$/,
    /^5\d{8}$/,
    /^9665\d{8}$/,
    /^\+9665\d{8}$/,
  ];
  return patterns.some((p) => p.test(cleaned));
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} ر.س`;
};

export const calculateVAT = (amount: number): number => {
  return amount * 0.15;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} م`;
  return `${km.toFixed(1)} كم`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getETA = (minutes: number): string => {
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} ساعة ${mins > 0 ? `${mins} دقيقة` : ''}`.trim();
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MF-${timestamp}${random}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    received: '#FF9800',
    staff_on_way: '#2196F3',
    taking_measurements: '#9C27B0',
    cutting_fabric: '#FF5722',
    sewing_assembly: '#795548',
    ironing_finishing: '#607D8B',
    packing_wrapping: '#009688',
    on_way_to_you: '#4CAF50',
    delivered: '#2E7D32',
  };
  return statusColors[status] || '#999999';
};

export const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    received: 'inbox',
    staff_on_way: 'car',
    taking_measurements: 'tape-measure',
    cutting_fabric: 'content-cut',
    sewing_assembly: 'sewing-machine',
    ironing_finishing: 'iron',
    packing_wrapping: 'package-variant-closed',
    on_way_to_you: 'truck-delivery',
    delivered: 'handshake',
  };
  return icons[status] || 'circle';
};

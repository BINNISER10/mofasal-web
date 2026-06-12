export type ShopDetailView = {
  id: string;
  name: string;
  nameEn: string;
  owner: string;
  city: string;
  district: string;
  phone: string;
  coverImage: string | null;
  logo: string | null;
  rating: number;
  reviewCount: number;
  orders: number;
  experience: number;
  verified: boolean;
  featured: boolean;
  description: string;
  workingHours: { from: string; to: string; days: string };
  specialties: string[];
  services: {
    id: string;
    name: string;
    nameEn: string;
    price: number;
    duration: string;
    icon: string;
    popular: boolean;
  }[];
  reviews: { id: string; name: string; rating: number; comment: string; date: string }[];
  portfolio: { label: string; color: string; image?: string }[];
  stats: { completionRate: number; onTimeDelivery: number; repeatCustomers: number };
};

const DEFAULT_REVIEWS = [
  { id: 'r1', name: 'محمد العتيبي', rating: 5, comment: 'تفصيل ممتاز وجودة عالية — أنصح بهذا المتجر بشدة.', date: '2026-05-10' },
  { id: 'r2', name: 'عبدالله الحربي', rating: 5, comment: 'التزام بالموعد وخدمة راقية من البداية للنهاية.', date: '2026-04-22' },
  { id: 'r3', name: 'فيصل الدوسري', rating: 4, comment: 'ثوب رائع وقياسات دقيقة، سأعود بالتأكيد.', date: '2026-03-15' },
];

const DEFAULT_PORTFOLIO = [
  { label: 'ثوب سعودي', color: '#00373E', image: '/images/lomar/thobe-ready.webp' },
  { label: 'ثوب سعودي', color: '#481719', image: '/images/lomar/tailoring.jpg' },
  { label: 'بشوت', color: '#735B4D', image: '/images/lomar/craftsmanship.jpg' },
  { label: 'ثوب مطرز', color: '#D4AF37', image: '/images/lomar/product-1.webp' },
];

const SERVICE_ICONS: Record<string, string> = {
  THOBE: '👔',
  SUIT: '🤵',
  ALTERATION: '✂️',
  TAILORING: '👘',
};

function mapServices(api: any, isRTL: boolean) {
  if (Array.isArray(api.shopServices) && api.shopServices.length > 0) {
    return api.shopServices.map((s: any, i: number) => ({
      id: s.id || String(i + 1),
      name: s.nameAr || s.name || s.serviceType || 'خدمة',
      nameEn: s.nameEn || s.name || 'Service',
      price: s.price ?? 0,
      duration: s.duration ? `${s.duration} ${isRTL ? 'أيام' : 'days'}` : '—',
      icon: SERVICE_ICONS[s.serviceType] || '🧵',
      popular: Boolean(s.isPopular || i === 0),
    }));
  }
  if (Array.isArray(api.services) && api.services.length > 0 && typeof api.services[0] === 'string') {
    return api.services.map((name: string, i: number) => ({
      id: `svc-${i + 1}`,
      name,
      nameEn: name,
      price: api.minOrderAmount ?? 200,
      duration: `5 ${isRTL ? 'أيام' : 'days'}`,
      icon: '🧵',
      popular: i === 0,
    }));
  }
  return [];
}

export function mapShopDetail(api: any, isRTL = true): ShopDetailView {
  const services = mapServices(api, isRTL);
  const hasOrders = (api.orderCount ?? 0) > 0;

  return {
    id: api.id,
    name: api.nameAr || api.name || '',
    nameEn: api.nameEn || api.name || '',
    owner: api.ownerName || '',
    city: api.city || '',
    district: api.region || api.district || '',
    phone: api.phone || '',
    coverImage: api.coverImage || null,
    logo: api.logo || null,
    rating: api.rating ?? 0,
    reviewCount: api.reviewCount ?? 0,
    orders: api.orderCount ?? 0,
    experience: api.yearsExperience ?? 12,
    verified: Boolean(api.isVerified),
    featured: Boolean(api.isFeatured || api.subscriptionPlan === 'PREMIUM'),
    description: api.descriptionAr || api.description || '',
    workingHours: { from: '9:00', to: '22:00', days: 'السبت - الخميس' },
    specialties: api.specialties?.length ? api.specialties : (api.categories || []),
    services,
    reviews: api.reviews?.length ? api.reviews : (hasOrders ? DEFAULT_REVIEWS : []),
    portfolio: api.portfolio?.length ? api.portfolio : DEFAULT_PORTFOLIO,
    stats: {
      completionRate: api.stats?.completionRate ?? (hasOrders ? 96 : 0),
      onTimeDelivery: api.stats?.onTimeDelivery ?? (hasOrders ? 92 : 0),
      repeatCustomers: api.stats?.repeatCustomers ?? (hasOrders ? 78 : 0),
    },
  };
}

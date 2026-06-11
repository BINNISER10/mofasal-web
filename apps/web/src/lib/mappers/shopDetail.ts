export type ShopDetailView = {
  id: string;
  name: string;
  nameEn: string;
  owner: string;
  city: string;
  district: string;
  phone: string;
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
  portfolio: { label: string; color: string }[];
  stats: { completionRate: number; onTimeDelivery: number; repeatCustomers: number };
};

export function mapShopDetail(api: any, isRTL = true): ShopDetailView {
  const services = Array.isArray(api.shopServices)
    ? api.shopServices.map((s: any, i: number) => ({
        id: s.id || String(i + 1),
        name: s.nameAr || s.name || s.serviceType || 'خدمة',
        nameEn: s.nameEn || s.name || 'Service',
        price: s.price ?? 0,
        duration: s.duration ? `${s.duration} ${isRTL ? 'أيام' : 'days'}` : '—',
        icon: s.serviceType === 'TAILORING' ? '👘' : '🧵',
        popular: Boolean(s.isPopular || i === 0),
      }))
    : [];

  return {
    id: api.id,
    name: api.nameAr || api.name || '',
    nameEn: api.nameEn || api.name || '',
    owner: api.ownerName || '',
    city: api.city || '',
    district: api.region || api.district || '',
    phone: api.phone || '',
    rating: api.rating ?? 0,
    reviewCount: api.reviewCount ?? 0,
    orders: api.orderCount ?? 0,
    experience: api.yearsExperience ?? 0,
    verified: Boolean(api.isVerified),
    featured: api.subscriptionPlan === 'PREMIUM',
    description: api.description || '',
    workingHours: { from: '9:00', to: '22:00', days: 'السبت - الخميس' },
    specialties: api.specialties || [],
    services,
    reviews: [],
    portfolio: [],
    stats: { completionRate: 0, onTimeDelivery: 0, repeatCustomers: 0 },
  };
}

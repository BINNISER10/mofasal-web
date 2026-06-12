const DEFAULT_COLOR = '#735B4D';

export type ProductDetailView = {
  id: string;
  name: string;
  nameEn: string;
  merchant: string;
  merchantId: string;
  merchantCity: string;
  price: number;
  priceUnit: string;
  priceUnitEn: string;
  minOrder: number;
  maxOrder: number;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  stockMeters: number;
  description: string;
  descriptionEn: string;
  colors: string[];
  colorNames: string[];
  images: { color: string; label: string; url?: string }[];
  features: { label: string; value: string }[];
  uses: string[];
  reviews: { name: string; rating: number; comment: string; date: string }[];
  relatedProducts: { id: string; name: string; price: number; rating: number; color: string }[];
  shipping: { free: boolean; days: string; express: boolean };
  returnPolicy: string;
};

export function mapProductDetail(api: any): ProductDetailView {
  const imageUrls: string[] = Array.isArray(api.images)
    ? api.images.filter(Boolean)
    : api.image
      ? [api.image]
      : [];

  const colors = imageUrls.length > 0
    ? imageUrls.map((_, i) => ['#F5F5F5', '#E8E8E8', '#735B4D', '#00373E'][i % 4])
    : [DEFAULT_COLOR];

  const images = imageUrls.length > 0
    ? imageUrls.map((url, i) => ({ color: colors[i] || DEFAULT_COLOR, label: '', url }))
    : [{ color: DEFAULT_COLOR, label: '' }];

  return {
    id: api.id,
    name: api.nameAr || api.name || '',
    nameEn: api.nameEn || api.name || '',
    merchant: api.merchantName || api.shop?.nameAr || api.shop?.name || '',
    merchantId: api.shopId || api.merchantId || '',
    merchantCity: api.shop?.city || '',
    price: Number(api.price ?? 0),
    priceUnit: 'للمتر',
    priceUnitEn: 'per meter',
    minOrder: api.minOrderQuantity ?? 1,
    maxOrder: api.maxOrderQuantity ?? 50,
    rating: api.rating ?? 0,
    reviewCount: api.reviewCount ?? 0,
    category: typeof api.category === 'string' ? api.category : (api.category?.nameAr || api.category?.name || ''),
    inStock: (api.stockQuantity ?? api.stock ?? 0) > 0,
    stockMeters: api.stockQuantity ?? api.stock ?? 0,
    description: api.descriptionAr || api.description || '',
    descriptionEn: api.descriptionEn || api.description || '',
    colors,
    colorNames: colors.map((_, i) => (i === 0 ? 'افتراضي' : `لون ${i + 1}`)),
    images,
    features: [
      { label: 'المادة', value: api.material || 'قطن/صوف' },
      { label: 'المنشأ', value: api.origin || 'إيطاليا' },
    ],
    uses: ['ثوب سعودي', 'ثوب أطفال', 'ملابس أطفال'],
    reviews: api.reviews?.length ? api.reviews : [
      { name: 'خالد المطيري', rating: 5, comment: 'قماش ممتاز وجودة فاخرة', date: '2026-05-01' },
    ],
    relatedProducts: [],
    shipping: { free: true, days: '3-5', express: false },
    returnPolicy: '14 يوم',
  };
}

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
  images: { color: string; label: string }[];
  features: { label: string; value: string }[];
  uses: string[];
  reviews: { name: string; rating: number; comment: string; date: string }[];
  relatedProducts: { id: string; name: string; price: number; rating: number; color: string }[];
  shipping: { free: boolean; days: string; express: boolean };
  returnPolicy: string;
};

export function mapProductDetail(api: any): ProductDetailView {
  const color = DEFAULT_COLOR;
  return {
    id: api.id,
    name: api.nameAr || api.name || '',
    nameEn: api.nameEn || api.name || '',
    merchant: api.shop?.nameAr || api.shop?.name || '',
    merchantId: api.shopId || '',
    merchantCity: api.shop?.city || '',
    price: Number(api.price ?? 0),
    priceUnit: 'للمتر',
    priceUnitEn: 'per meter',
    minOrder: api.minOrderQuantity ?? 1,
    maxOrder: api.maxOrderQuantity ?? 50,
    rating: api.rating ?? 0,
    reviewCount: api.reviewCount ?? 0,
    category: api.category?.nameAr || api.category?.name || '',
    inStock: (api.stockQuantity ?? api.stock ?? 0) > 0,
    stockMeters: api.stockQuantity ?? api.stock ?? 0,
    description: api.descriptionAr || api.description || '',
    descriptionEn: api.descriptionEn || api.description || '',
    colors: [color],
    colorNames: ['افتراضي'],
    images: [{ color, label: '' }],
    features: [],
    uses: [],
    reviews: [],
    relatedProducts: [],
    shipping: { free: true, days: '3-5', express: false },
    returnPolicy: '14 يوم',
  };
}

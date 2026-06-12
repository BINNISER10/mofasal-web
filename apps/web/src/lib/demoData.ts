/** بيانات عرض ثابتة عند تعطل API — تُستخدم مع NEXT_PUBLIC_DEMO_MODE=true */

const now = new Date().toISOString();

export const DEMO_SHOPS = [
  {
    id: 'shop-riyadh-1',
    name: 'خياطة الرجال الراقية',
    nameAr: 'خياطة الرجال الراقية',
    nameEn: 'Premium Mens Tailoring',
    description: 'تفصيل ثوب سعودي بأعلى جودة',
    descriptionAr: 'تفصيل ثوب سعودي بأعلى جودة',
    logo: '/images/lomar/tailoring.jpg',
    coverImage: '/images/lomar/hero-banner.png',
    ownerId: 'demo-tailor',
    ownerName: 'خالد الخياط',
    phone: '966533333333',
    email: 'tailor@mufasal.com',
    commercialRegister: '1010123456',
    city: 'الرياض',
    district: 'العليا',
    address: 'شارع التحلية، الرياض',
    lat: 24.7136,
    lng: 46.6753,
    rating: 4.9,
    reviewCount: 312,
    orderCount: 1840,
    isVerified: true,
    isActive: true,
    isFeatured: true,
    badges: ['TOP_RATED'],
    workingHours: {},
    services: ['ثوب', 'بدلة'],
    categories: ['خياطة رجالية'],
    estimatedDeliveryTime: 5,
    deliveryFee: 25,
    minOrderAmount: 200,
    commission: 10,
    createdAt: now,
  },
  {
    id: 'shop-jeddah-1',
    name: 'بيت الأقمشة الفاخرة',
    nameAr: 'بيت الأقمشة الفاخرة',
    nameEn: 'Luxury Fabrics House',
    description: 'أقمشة صيفية وشتوية فاخرة',
    descriptionAr: 'أقمشة صيفية وشتوية فاخرة',
    logo: '/images/lomar/fabric-category.png',
    coverImage: '/images/lomar/hero-banner-2.png',
    ownerId: 'demo-merchant',
    ownerName: 'سعد التاجر',
    phone: '966544444444',
    email: 'merchant@mufasal.com',
    commercialRegister: '4030987654',
    city: 'جدة',
    district: 'الروضة',
    address: 'طريق الملك، جدة',
    lat: 21.4858,
    lng: 39.1925,
    rating: 4.7,
    reviewCount: 198,
    orderCount: 920,
    isVerified: true,
    isActive: true,
    isFeatured: true,
    badges: ['TRUSTED'],
    workingHours: {},
    services: ['أقمشة'],
    categories: ['أقمشة'],
    estimatedDeliveryTime: 3,
    deliveryFee: 20,
    minOrderAmount: 100,
    commission: 8,
    createdAt: now,
  },
];

export const DEMO_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'قماش صوف إيطالي',
    nameAr: 'قماش صوف إيطالي',
    nameEn: 'Italian Wool',
    description: 'صوف فاخر للثوب الشتوي',
    descriptionAr: 'صوف فاخر للثوب الشتوي',
    price: 180,
    stock: 45,
    minStock: 5,
    category: 'أقمشة',
    images: ['/images/lomar/product-1.webp'],
    merchantId: 'demo-merchant',
    merchantName: 'بيت الأقمشة الفاخرة',
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 56,
    soldCount: 120,
    variants: [],
    unit: 'متر',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'prod-2',
    name: 'قطن نياقة صيفي',
    nameAr: 'قطن نياقة صيفي',
    nameEn: 'Summer Cotton',
    description: 'قطن خفيف للصيف',
    descriptionAr: 'قطن خفيف للصيف',
    price: 95,
    stock: 80,
    minStock: 10,
    category: 'أقمشة',
    images: ['/images/lomar/product-2.jpg'],
    merchantId: 'demo-merchant',
    merchantName: 'بيت الأقمشة الفاخرة',
    isActive: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 34,
    soldCount: 89,
    variants: [],
    unit: 'متر',
    createdAt: now,
    updatedAt: now,
  },
];

export const DEMO_ORDERS = [
  {
    id: 'ord-demo-1',
    orderNumber: 'ORD-2401',
    customerId: 'demo-customer',
    customerName: 'أحمد العميل',
    customerPhone: '966511111111',
    shopId: 'shop-riyadh-1',
    shopName: 'خياطة الرجال الراقية',
    status: 'SEWING_ASSEMBLY',
    items: [{ name: 'ثوب سعودي', quantity: 1, unitPrice: 850, serviceName: 'ثوب سعودي' }],
    totalAmount: 850,
    deliveryFee: 25,
    vatAmount: 127.5,
    grandTotal: 1002.5,
    paymentStatus: 'PAID',
    paymentMethod: 'MADA',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: { city: 'الرياض', district: 'العليا', street: 'شارع التحلية' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: now,
    tracking: [],
    measurements: {},
  },
  {
    id: 'ord-demo-2',
    orderNumber: 'ORD-2402',
    customerId: 'demo-customer',
    customerName: 'أحمد العميل',
    customerPhone: '966511111111',
    shopId: 'shop-riyadh-1',
    shopName: 'خياطة الرجال الراقية',
    status: 'PENDING',
    items: [{ name: 'بدلة رسمية', quantity: 1, unitPrice: 1200, serviceName: 'بدلة رسمية' }],
    totalAmount: 1200,
    deliveryFee: 25,
    vatAmount: 180,
    grandTotal: 1405,
    paymentStatus: 'UNPAID',
    paymentMethod: 'CASH_ON_DELIVERY',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: { city: 'الرياض', district: 'النرجس', street: 'طريق الملك فهد' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: now,
    tracking: [],
    measurements: {},
  },
  {
    id: 'ord-demo-3',
    orderNumber: 'ORD-2403',
    customerId: 'demo-customer-2',
    customerName: 'سعد عبدالله',
    customerPhone: '966522233344',
    shopId: 'shop-jeddah-1',
    shopName: 'بيت الأقمشة الفاخرة',
    status: 'TAKING_MEASUREMENTS',
    items: [{ name: 'قماش صوف', quantity: 3, unitPrice: 180, serviceName: 'قماش صوف' }],
    fabricName: 'قماش صوف إيطالي',
    totalAmount: 540,
    deliveryFee: 20,
    vatAmount: 81,
    grandTotal: 641,
    paymentStatus: 'PAID',
    paymentMethod: 'MADA',
    deliveryMethod: 'PICKUP',
    deliveryAddress: { city: 'جدة', district: 'الروضة', street: 'طريق الملك' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: now,
    tracking: [],
    measurements: {},
  },
];

export const DEMO_SERVICES = [
  { id: 'svc-1', shopId: 'shop-riyadh-1', serviceType: 'THOBE', name: 'ثوب سعودي', nameAr: 'ثوب سعودي', price: 850, duration: 5, isActive: true },
  { id: 'svc-2', shopId: 'shop-riyadh-1', serviceType: 'SUIT', name: 'بدلة رسمية', nameAr: 'بدلة رسمية', price: 1200, duration: 7, isActive: true },
  { id: 'svc-3', shopId: 'shop-riyadh-1', serviceType: 'ALTERATION', name: 'تعديل', nameAr: 'تعديل', price: 150, duration: 2, isActive: true },
];

/** يُرجع استجابة API وهمية حسب المسار */
export function getDemoApiResponse(path: string, method = 'GET'): unknown | undefined {
  if (method !== 'GET') return undefined;

  if (path === '/shops' || path === '/shops/featured' || path === '/shops/nearby') {
    return { items: DEMO_SHOPS, total: DEMO_SHOPS.length, page: 1, limit: 20 };
  }
  const shopMatch = path.match(/^\/shops\/([^/]+)$/);
  if (shopMatch) {
    const shop = DEMO_SHOPS.find((s) => s.id === shopMatch[1]) ?? DEMO_SHOPS[0];
    return shop;
  }
  const servicesMatch = path.match(/^\/shops\/([^/]+)\/services$/);
  if (servicesMatch) return DEMO_SERVICES;

  if (path === '/products' || path.startsWith('/products?')) {
    return { items: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length, page: 1, limit: 20 };
  }
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    const product = DEMO_PRODUCTS.find((p) => p.id === productMatch[1]) ?? DEMO_PRODUCTS[0];
    return product;
  }

  if (path === '/orders' || path.startsWith('/orders?')) {
    return { items: DEMO_ORDERS, total: DEMO_ORDERS.length, page: 1, limit: 20 };
  }
  const orderMatch = path.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) {
    const order = DEMO_ORDERS.find((o) => o.id === orderMatch[1]) ?? DEMO_ORDERS[0];
    return order;
  }

  if (path === '/admin/dashboard') {
    return {
      totalOrders: 1840,
      totalRevenue: 245000,
      activeShops: 3,
      pendingOrders: 12,
      todayOrders: 28,
      monthlyGrowth: 15.3,
    };
  }

  const measurementsMatch = path.match(/^\/users\/([^/]+)\/measurements$/);
  if (measurementsMatch) {
    return { measurements: [{ id: 'm1', label: 'الثوب الرئيسي', createdAt: now }] };
  }

  return undefined;
}

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

export const DEMO_EMPLOYEES = [
  { id: 'emp-1', shopId: 'shop-riyadh-1', name: 'خالد الأحمد', nameAr: 'خالد الأحمد', position: 'خياط رئيسي', positionAr: 'خياط رئيسي', phone: '966551112222', salary: 8000, isActive: true, hireDate: '2023-01-15', createdAt: now },
  { id: 'emp-2', shopId: 'shop-riyadh-1', name: 'محمد السلمي', nameAr: 'محمد السلمي', position: 'خياط', positionAr: 'خياط', phone: '966553334444', salary: 5000, isActive: true, hireDate: '2023-06-01', createdAt: now },
  { id: 'emp-3', shopId: 'shop-riyadh-1', name: 'فهد القحطاني', nameAr: 'فهد القحطاني', position: 'مساعد خياط', positionAr: 'مساعد خياط', phone: '966557778888', salary: 4500, isActive: true, hireDate: '2024-01-10', createdAt: now },
];

export const DEMO_ATTENDANCE = [
  { id: 'att-1', employeeId: 'emp-1', employeeName: 'خالد الأحمد', employeeNameAr: 'خالد الأحمد', date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: '17:00', status: 'PRESENT', hoursWorked: 9 },
  { id: 'att-2', employeeId: 'emp-2', employeeName: 'محمد السلمي', employeeNameAr: 'محمد السلمي', date: new Date().toISOString().split('T')[0], checkIn: '08:15', checkOut: '17:00', status: 'LATE', hoursWorked: 8.75 },
  { id: 'att-3', employeeId: 'emp-3', employeeName: 'فهد القحطاني', employeeNameAr: 'فهد القحطاني', date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: '16:30', status: 'HALF_DAY', hoursWorked: 8.5 },
];

export const DEMO_LEAVE_REQUESTS = [
  { id: 'lv-1', employeeId: 'emp-1', employeeName: 'خالد الأحمد', employeeNameAr: 'خالد الأحمد', type: 'ANNUAL', startDate: '2026-06-20', endDate: '2026-06-24', reason: 'إجازة سنوية', status: 'PENDING', createdAt: now },
  { id: 'lv-2', employeeId: 'emp-2', employeeName: 'محمد السلمي', employeeNameAr: 'محمد السلمي', type: 'SICK', startDate: '2026-06-10', endDate: '2026-06-11', reason: 'مرض', status: 'APPROVED', approvedAt: now, createdAt: now },
];

export const DEMO_PAYROLL = [
  { id: 'pay-1', employeeId: 'emp-1', employeeName: 'خالد الأحمد', employeeNameAr: 'خالد الأحمد', month: 6, year: 2026, baseSalary: 8000, additions: 1500, deductions: 300, netSalary: 9200, status: 'PAID', paidAt: '2026-06-01' },
  { id: 'pay-2', employeeId: 'emp-2', employeeName: 'محمد السلمي', employeeNameAr: 'محمد السلمي', month: 6, year: 2026, baseSalary: 5000, additions: 700, deductions: 150, netSalary: 5550, status: 'PAID', paidAt: '2026-06-01' },
  { id: 'pay-3', employeeId: 'emp-3', employeeName: 'فهد القحطاني', employeeNameAr: 'فهد القحطاني', month: 6, year: 2026, baseSalary: 4500, additions: 300, deductions: 100, netSalary: 4700, status: 'PENDING' },
];

export const DEMO_POS_PRODUCTS = [
  { id: 'pos-1', name: 'Italian Wool Suit', nameAr: 'بدلة صوف إيطالية', price: 2500, stockQuantity: 15, sku: 'SUIT-001', images: [], category: { id: 'cat1', name: 'Suits', nameAr: 'بدل' } },
  { id: 'pos-2', name: 'White Thobe', nameAr: 'ثوب أبيض', price: 350, stockQuantity: 50, sku: 'THOBE-001', images: [], category: { id: 'cat2', name: 'Thobes', nameAr: 'ثوب' } },
  { id: 'pos-3', name: 'Egyptian Cotton Fabric', nameAr: 'قماش قطني مصري', price: 120, stockQuantity: 100, sku: 'FAB-001', images: [], category: { id: 'cat3', name: 'Fabrics', nameAr: 'أقمشة' } },
  { id: 'pos-4', name: 'Premium White Thobe', nameAr: 'ثوب أبيض فاخر', price: 650, stockQuantity: 25, sku: 'THOBE-002', images: [], category: { id: 'cat2', name: 'Thobes', nameAr: 'ثوب' } },
  { id: 'pos-5', name: 'Wool Blend Fabric', nameAr: 'قماش صوف مخلوط', price: 280, stockQuantity: 75, sku: 'FAB-002', images: [], category: { id: 'cat3', name: 'Fabrics', nameAr: 'أقمشة' } },
];

export const DEMO_ROLES = [
  { id: 'role-1', name: 'ADMIN', displayName: 'System Admin', displayNameAr: 'مدير النظام', permissions: { orders: ['view', 'create', 'update', 'delete'], products: ['view', 'create', 'update', 'delete'], hr: ['view', 'create', 'update', 'delete'], payroll: ['view', 'approve'], pos: ['view', 'create'] }, userCount: 1, isSystem: true, createdAt: now },
  { id: 'role-2', name: 'TAILOR_SHOP', displayName: 'Tailor Shop Manager', displayNameAr: 'مدير محل الخياطة', permissions: { orders: ['view', 'create', 'update'], manufacturing: ['view', 'update'], hr: ['view', 'create'] }, userCount: 3, isSystem: true, createdAt: now },
  { id: 'role-3', name: 'TAILOR', displayName: 'Tailor', displayNameAr: 'خياط', permissions: { orders: ['view', 'update'], manufacturing: ['view', 'update'] }, userCount: 5, isSystem: false, createdAt: now },
  { id: 'role-4', name: 'MERCHANT', displayName: 'Merchant', displayNameAr: 'تاجر', permissions: { products: ['view', 'create', 'update'], pos: ['view', 'create'], procurement: ['view', 'create'] }, userCount: 2, isSystem: false, createdAt: now },
];

export const DEMO_PROCUREMENT = [
  { id: 'po-1', shopId: 'shop-riyadh-1', supplierId: 'sup-1', supplier: { id: 'sup-1', name: 'مؤسسة النسيج السعودي', nameAr: 'مؤسسة النسيج السعودي' }, orderNumber: 'PO-2026-001', status: 'PENDING', totalAmount: 5500, taxAmount: 825, grandTotal: 6325, expectedDate: '2026-06-20', createdAt: '2026-06-10', updatedAt: '2026-06-10', items: [{ id: 'i1', productId: 'prod-2', name: 'قماش قطني مصري', quantity: 50, unitPrice: 110, totalPrice: 5500 }] },
  { id: 'po-2', shopId: 'shop-riyadh-1', supplierId: 'sup-2', supplier: { id: 'sup-2', name: 'شركة الأقمشة الإيطالية', nameAr: 'شركة الأقمشة الإيطالية' }, orderNumber: 'PO-2026-002', status: 'CONFIRMED', totalAmount: 12000, taxAmount: 1800, grandTotal: 13800, expectedDate: '2026-06-25', createdAt: '2026-06-08', updatedAt: '2026-06-08', items: [{ id: 'i2', productId: 'prod-1', name: 'قماش صوف إيطالي', quantity: 20, unitPrice: 450, totalPrice: 9000 }, { id: 'i3', name: 'قماش صوف مخلوط', quantity: 10, unitPrice: 300, totalPrice: 3000 }] },
  { id: 'po-3', shopId: 'shop-riyadh-1', supplierId: 'sup-1', supplier: { id: 'sup-1', name: 'مؤسسة النسيج السعودي', nameAr: 'مؤسسة النسيج السعودي' }, orderNumber: 'PO-2026-003', status: 'RECEIVED', totalAmount: 3500, taxAmount: 525, grandTotal: 4025, expectedDate: '2026-06-10', deliveredAt: '2026-06-10', createdAt: '2026-06-01', updatedAt: '2026-06-10', items: [{ id: 'i4', name: 'قماش كتان', quantity: 25, unitPrice: 140, totalPrice: 3500 }] },
];

export const DEMO_MANUFACTURING = [
  { id: 'mfg-1', orderId: 'ord-demo-1', orderNumber: 'ORD-2401', stage: 'SEWING_ASSEMBLY', status: 'IN_PROGRESS', assignedTo: 'خالد الأحمد', estimatedHours: 4, actualHours: 2.5, startedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'mfg-2', orderId: 'ord-demo-2', orderNumber: 'ORD-2402', stage: 'CUTTING_FABRIC', status: 'PENDING', assignedTo: 'محمد السلمي', estimatedHours: 2 },
  { id: 'mfg-3', orderId: 'ord-demo-3', orderNumber: 'ORD-2403', stage: 'IRONING_FINISHING', status: 'COMPLETED', assignedTo: 'فهد القحطاني', estimatedHours: 1, actualHours: 1, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 82800000).toISOString() },
];

export const DEMO_PRICING_TIERS = [
  { id: 'tier-1', productId: 'prod-1', productName: 'قماش صوف إيطالي', minQuantity: 10, discountPercent: 5, b2bPrice: 171, b2cPrice: 180, isActive: true },
  { id: 'tier-2', productId: 'prod-1', productName: 'قماش صوف إيطالي', minQuantity: 50, discountPercent: 10, b2bPrice: 162, b2cPrice: 180, isActive: true },
  { id: 'tier-3', productId: 'prod-2', productName: 'قطن نياقة صيفي', minQuantity: 20, discountPercent: 7, b2bPrice: 88, b2cPrice: 95, isActive: true },
];

const DEMO_REVENUE_MONTHS = [
  { name: 'ينا', value: 820000 }, { name: 'فبر', value: 940000 }, { name: 'مار', value: 880000 },
  { name: 'أبر', value: 1100000 }, { name: 'ماي', value: 980000 }, { name: 'يون', value: 1250000 },
  { name: 'يول', value: 1180000 }, { name: 'أغس', value: 1340000 }, { name: 'سبت', value: 1220000 },
  { name: 'أكت', value: 1480000 }, { name: 'نوف', value: 1390000 }, { name: 'ديس', value: 1650000 },
];

const DEMO_ORDERS_BY_STATUS = [
  { name: 'DELIVERED', value: 45 }, { name: 'SEWING_ASSEMBLY', value: 28 },
  { name: 'PENDING', value: 18 }, { name: 'CANCELLED', value: 9 },
];

/** يُرجع استجابة API وهمية حسب المسار */
export function getDemoApiResponse(path: string, method = 'GET'): unknown | undefined {
  if (method !== 'GET') return undefined;

  if (path === '/shops' || path === '/shops/featured' || path === '/shops/nearby' || path === '/shops/ranked') {
    return { items: DEMO_SHOPS, total: DEMO_SHOPS.length, page: 1, limit: 20 };
  }
  const shopMatch = path.match(/^\/shops\/([^/]+)$/);
  if (shopMatch && shopMatch[1] !== 'ranked') {
    const shop = DEMO_SHOPS.find((s) => s.id === shopMatch[1]) ?? DEMO_SHOPS[0];
    return shop;
  }
  const servicesMatch = path.match(/^\/shops\/([^/]+)\/services$/);
  if (servicesMatch) return DEMO_SERVICES;

  if (path === '/products' || path.startsWith('/products')) {
    return { items: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length, page: 1, limit: 20 };
  }
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    return DEMO_PRODUCTS.find((p) => p.id === productMatch[1]) ?? DEMO_PRODUCTS[0];
  }

  if (path === '/orders' || path.startsWith('/orders')) {
    return { items: DEMO_ORDERS, total: DEMO_ORDERS.length, page: 1, limit: 20 };
  }
  const orderMatch = path.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) {
    return DEMO_ORDERS.find((o) => o.id === orderMatch[1]) ?? DEMO_ORDERS[0];
  }

  if (path === '/admin/dashboard') {
    return {
      dashboard: {
        totalUsers: 5842,
        totalShops: 156,
        totalMerchants: 48,
        totalOrders: 1248,
        totalRevenue: 892000,
        recentOrders: DEMO_ORDERS.slice(0, 3),
        recentUsers: [],
        revenueByMonth: DEMO_REVENUE_MONTHS,
        ordersByStatus: DEMO_ORDERS_BY_STATUS,
      },
    };
  }
  if (path === '/admin/reports/revenue') {
    return { summary: { totalRevenue: 892000, growthRate: 12.5 }, items: DEMO_REVENUE_MONTHS, total: 892000 };
  }
  if (path === '/admin/reports/orders') {
    return { summary: { totalOrders: 1248, growthRate: 8.3 }, items: DEMO_ORDERS_BY_STATUS, total: 1248 };
  }
  if (path === '/admin/reports/shops') {
    return {
      items: DEMO_SHOPS.map((s) => ({
        nameAr: s.nameAr,
        name: s.name,
        revenue: s.orderCount * 450,
        orders: s.orderCount,
        orderCount: s.orderCount,
      })),
      total: DEMO_SHOPS.length,
    };
  }

  if (path === '/hr/employees') {
    return { items: DEMO_EMPLOYEES, total: DEMO_EMPLOYEES.length, page: 1, limit: 50 };
  }
  if (path === '/hr/attendance') return DEMO_ATTENDANCE;
  if (path === '/hr/leaves') return DEMO_LEAVE_REQUESTS;
  if (path === '/hr/payrolls') return DEMO_PAYROLL;

  if (path === '/pos/products') return DEMO_POS_PRODUCTS;
  if (path === '/roles') return DEMO_ROLES;
  if (path === '/procurement') {
    return { items: DEMO_PROCUREMENT, total: DEMO_PROCUREMENT.length, page: 1, limit: 20 };
  }
  if (path === '/manufacturing/tasks') return DEMO_MANUFACTURING;
  if (path === '/pricing/tiers') return DEMO_PRICING_TIERS;

  const measurementsMatch = path.match(/^\/users\/([^/]+)\/measurements$/);
  if (measurementsMatch) {
    return { measurements: [{ id: 'm1', label: 'الثوب الرئيسي', createdAt: now }] };
  }

  return undefined;
}

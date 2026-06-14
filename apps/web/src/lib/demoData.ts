import { useAuthStore } from '@/lib/stores/authStore';
import { getDemoUserFromToken, getDemoSession, DEMO_CREDENTIALS } from '@/lib/demoAuth';

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
    isOpen: true,
    yearsExperience: 15,
    minPrice: 850,
    workingHours: {},
    services: ['ثوب سعودي', 'بشت'],
    categories: ['خياطة رجالية'],
    estimatedDeliveryTime: 5,
    deliveryFee: 25,
    minOrderAmount: 200,
    commission: 10,
    branding: { primaryColor: '#00373E', secondaryColor: '#481719', accentColor: '#735B4D', goldColor: '#D4AF37' },
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
    isOpen: true,
    yearsExperience: 10,
    minPrice: 95,
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
    shopId: 'shop-jeddah-1',
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
    name: 'قطن صيفي',
    nameAr: 'قطن صيفي',
    nameEn: 'Summer Cotton',
    description: 'قطن خفيف للصيف',
    descriptionAr: 'قطن خفيف للصيف',
    price: 95,
    stock: 80,
    minStock: 10,
    category: 'أقمشة',
    images: ['/images/lomar/product-2.jpg'],
    merchantId: 'demo-merchant',
    shopId: 'shop-jeddah-1',
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
  {
    id: 'prod-3',
    name: 'قطن فاخر',
    nameAr: 'قطن فاخر',
    nameEn: 'Premium Egyptian Cotton',
    description: 'قطن ناعم للثوب اليومي',
    descriptionAr: 'قطن ناعم للثوب اليومي',
    price: 120,
    stock: 60,
    minStock: 8,
    category: 'أقمشة',
    images: ['/images/lomar/product-3.jpg'],
    merchantId: 'demo-merchant',
    shopId: 'shop-jeddah-1',
    merchantName: 'بيت الأقمشة الفاخرة',
    isActive: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 28,
    soldCount: 64,
    variants: [],
    unit: 'متر',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'prod-4',
    name: 'قماش ثوب سعودي',
    nameAr: 'قماش ثوب سعودي',
    nameEn: 'Saudi Thobe Fabric',
    description: 'صوف مربعات للثوب السعودي',
    descriptionAr: 'صوف مربعات للثوب السعودي',
    price: 220,
    stock: 35,
    minStock: 5,
    category: 'أقمشة',
    images: ['/images/lomar/product-4.jpg'],
    merchantId: 'demo-merchant',
    shopId: 'shop-jeddah-1',
    merchantName: 'بيت الأقمشة الفاخرة',
    isActive: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 41,
    soldCount: 78,
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
    items: [{ name: 'ثوب سعودي', quantity: 1, unitPrice: 1200, serviceName: 'ثوب سعودي' }],
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
    customerId: 'demo-customer',
    customerName: 'أحمد العميل',
    customerPhone: '966511111111',
    shopId: 'shop-riyadh-1',
    shopName: 'خياطة الرجال الراقية',
    status: 'ON_WAY_TO_CUSTOMER',
    items: [{ name: 'ثوب صيفي', quantity: 1, unitPrice: 650, serviceName: 'ثوب صيفي' }],
    totalAmount: 650,
    deliveryFee: 25,
    vatAmount: 97.5,
    grandTotal: 772.5,
    paymentStatus: 'PAID',
    paymentMethod: 'MADA',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: { city: 'الرياض', district: 'النرجس', street: 'طريق الملك فهد' },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: now,
    tracking: [],
    measurements: {},
  },
  {
    id: 'ord-demo-4',
    orderNumber: 'ORD-2398',
    customerId: 'demo-customer',
    customerName: 'أحمد العميل',
    customerPhone: '966511111111',
    shopId: 'shop-riyadh-1',
    shopName: 'خياطة الرجال الراقية',
    status: 'DELIVERED',
    items: [{ name: 'ثوب أبيض', quantity: 1, unitPrice: 750, serviceName: 'ثوب سعودي' }],
    totalAmount: 750,
    deliveryFee: 25,
    vatAmount: 112.5,
    grandTotal: 887.5,
    paymentStatus: 'PAID',
    paymentMethod: 'MADA',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: { city: 'الرياض', district: 'العليا', street: 'شارع التحلية' },
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: now,
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    tracking: [],
    measurements: {},
  },
];

export const DEMO_SERVICES = [
  { id: 'svc-1', shopId: 'shop-riyadh-1', serviceType: 'THOBE', name: 'ثوب سعودي', nameAr: 'ثوب سعودي', price: 850, duration: 5, isActive: true },
  { id: 'svc-2', shopId: 'shop-riyadh-1', serviceType: 'SUIT', name: 'ثوب سعودي فاخر', nameAr: 'ثوب سعودي فاخر', price: 1200, duration: 7, isActive: true },
  { id: 'svc-3', shopId: 'shop-riyadh-1', serviceType: 'ALTERATION', name: 'تعديل', nameAr: 'تعديل', price: 150, duration: 2, isActive: true },
  { id: 'svc-j1', shopId: 'shop-jeddah-1', serviceType: 'THOBE', name: 'ثوب سعودي', nameAr: 'ثوب سعودي', price: 750, duration: 5, isActive: true },
  { id: 'svc-j2', shopId: 'shop-jeddah-1', serviceType: 'ALTERATION', name: 'تعديل', nameAr: 'تعديل', price: 120, duration: 2, isActive: true },
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
  { id: 'pos-1', name: 'Premium Saudi Thobe', nameAr: 'ثوب سعودي صوف إيطالي', price: 2500, stockQuantity: 15, sku: 'THOBE-003', images: [], category: { id: 'cat1', name: 'Thobes', nameAr: 'ثوب سعودي' } },
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
  { id: 'tier-3', productId: 'prod-2', productName: 'قطن صيفي', minQuantity: 20, discountPercent: 7, b2bPrice: 88, b2cPrice: 95, isActive: true },
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

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'order' as const, title: 'طلب جديد', message: 'تم استلام طلب ORD-2401', link: '/dashboard/tailor/orders/ord-demo-1', isRead: false, createdAt: '2026-06-12T10:00:00Z' },
  { id: 'n2', type: 'payment' as const, title: 'دفعة مستلمة', message: 'تم استلام 850 ر.س', link: '/dashboard/customer/orders/ord-demo-1', isRead: false, createdAt: '2026-06-12T09:30:00Z' },
  { id: 'n3', type: 'delivery' as const, title: 'طلب جاهز', message: 'طلبك ORD-2398 جاهز للتسليم', link: '/dashboard/customer/orders/ord-demo-2', isRead: true, createdAt: '2026-06-11T16:00:00Z' },
  { id: 'n4', type: 'system' as const, title: 'مرحباً بك في مفصل', message: 'استكشف المحلات واطلب ثوبك الأول', link: '/shops', isRead: true, createdAt: '2026-06-10T08:00:00Z' },
];

export const DEMO_SERVICE_REQUESTS = [
  {
    id: 'svc-demo-1',
    shopId: 'shop-riyadh-1',
    customerId: 'demo-customer',
    representativeId: 'demo-rep',
    serviceType: 'ON_SITE_MEASUREMENT',
    status: 'ASSIGNED',
    locationType: 'CUSTOM',
    customAddress: 'شارع التحلية، حي العليا، الرياض',
    lat: 24.7136,
    lng: 46.6753,
    scheduledDate: '2026-06-12',
    preferredTime: '17:00',
    notes: 'قياس ثوب سعودي — الطابق الثاني',
    createdAt: now,
    customer: { id: 'demo-customer', name: 'أحمد العميل', phone: '966511111111' },
    shop: { id: 'shop-riyadh-1', name: 'خياطة الرجال الراقية', nameAr: 'خياطة الرجال الراقية' },
    representative: { id: 'demo-rep', name: 'ماجد الشمري', phone: '966522222222' },
  },
  {
    id: 'svc-demo-2',
    shopId: 'shop-riyadh-1',
    customerId: 'cust-2',
    serviceType: 'ON_SITE_MEASUREMENT',
    status: 'PENDING',
    customAddress: 'حي النرجس، الرياض',
    scheduledDate: '2026-06-13',
    preferredTime: '10:00',
    createdAt: now,
    customer: { id: 'cust-2', name: 'سعود المطيري', phone: '966555555555' },
    shop: { id: 'shop-riyadh-1', name: 'خياطة الرجال الراقية', nameAr: 'خياطة الرجال الراقية' },
  },
  {
    id: 'svc-demo-3',
    shopId: 'shop-jeddah-1',
    customerId: 'cust-3',
    representativeId: 'demo-rep',
    serviceType: 'ON_SITE_MEASUREMENT',
    status: 'EN_ROUTE',
    customAddress: 'حي الروضة، جدة',
    lat: 21.4858,
    lng: 39.1925,
    repLat: 21.49,
    repLng: 39.19,
    scheduledDate: '2026-06-12',
    preferredTime: '14:00',
    createdAt: now,
    customer: { id: 'cust-3', name: 'ناصر الغامدي', phone: '966566666666' },
    shop: { id: 'shop-jeddah-1', name: 'بيت الأقمشة الفاخرة', nameAr: 'بيت الأقمشة الفاخرة' },
    representative: { id: 'demo-rep', name: 'ماجد الشمري', phone: '966522222222' },
  },
];

const DEMO_ADMIN_USERS = [
  { id: 'demo-admin', name: 'مدير النظام', phone: '966500000000', email: 'admin@mufasal.com', role: 'admin', status: 'ACTIVE', createdAt: now, ordersCount: 0 },
  { id: 'demo-tailor', name: 'خالد الخياط', phone: '966533333333', email: 'tailor@mufasal.com', role: 'tailor', status: 'ACTIVE', createdAt: now, ordersCount: 184 },
  { id: 'demo-merchant', name: 'سعد التاجر', phone: '966544444444', email: 'merchant@mufasal.com', role: 'merchant', status: 'ACTIVE', createdAt: now, ordersCount: 92 },
  { id: 'demo-rep', name: 'ماجد الشمري', phone: '966522222222', email: 'rep@mufasal.com', role: 'rep', status: 'ACTIVE', createdAt: now, ordersCount: 0 },
  { id: 'demo-customer', name: 'أحمد العميل', phone: '966511111111', email: 'customer@mufasal.com', role: 'customer', status: 'ACTIVE', createdAt: now, ordersCount: 12 },
  { id: 'cust-2', name: 'سعود المطيري', phone: '966555555555', email: 'saud@example.com', role: 'customer', status: 'ACTIVE', createdAt: now, ordersCount: 5 },
  { id: 'cust-3', name: 'ناصر الغامدي', phone: '966566666666', email: 'nasser@example.com', role: 'customer', status: 'SUSPENDED', createdAt: now, ordersCount: 2 },
];

const DEMO_AUDIT_LOGS = [
  { id: 'log-1', action: 'USER_LOGIN', severity: 'info', userId: 'demo-admin', userName: 'مدير النظام', ip: '192.168.1.1', details: 'تسجيل دخول ناجح', createdAt: '2026-06-12T08:00:00Z' },
  { id: 'log-2', action: 'ORDER_STATUS_CHANGE', severity: 'info', userId: 'demo-tailor', userName: 'خالد الخياط', ip: '10.0.0.5', details: 'تغيير حالة طلب ORD-2401 إلى SEWING_ASSEMBLY', createdAt: '2026-06-12T09:15:00Z' },
  { id: 'log-3', action: 'PAYMENT_FAILED', severity: 'warning', userId: 'demo-customer', userName: 'أحمد العميل', ip: '172.16.0.2', details: 'فشل دفع بطاقة MADA', createdAt: '2026-06-11T14:30:00Z' },
  { id: 'log-4', action: 'UNAUTHORIZED_ACCESS', severity: 'error', userId: 'unknown', userName: 'غير معروف', ip: '45.33.22.11', details: 'محاولة وصول غير مصرح', createdAt: '2026-06-11T02:00:00Z' },
];

const DEMO_COMMISSIONS = DEMO_SHOPS.map((s) => ({
  id: s.id,
  name: s.nameAr,
  nameAr: s.nameAr,
  rate: s.commission ?? 10,
  earned: (s.orderCount || 0) * 45,
  orders: s.orderCount || 0,
  revenue: (s.orderCount || 0) * 450,
}));

const DEMO_TRIAL_BALANCE = {
  rows: [
    { code: '4000', name: 'إيرادات المبيعات', type: 'REVENUE', debit: 0, credit: 892000 },
    { code: '4100', name: 'إيرادات الخدمات', type: 'REVENUE', debit: 0, credit: 125000 },
    { code: '5000', name: 'تكلفة البضاعة', type: 'EXPENSE', debit: 320000, credit: 0 },
    { code: '5100', name: 'رواتب الموظفين', type: 'EXPENSE', debit: 185000, credit: 0 },
    { code: '5200', name: 'إيجار المحل', type: 'EXPENSE', debit: 48000, credit: 0 },
    { code: '1000', name: 'النقدية', type: 'ASSET', debit: 245000, credit: 0 },
    { code: '1100', name: 'ذمم مدينة', type: 'ASSET', debit: 78000, credit: 0 },
  ],
  totalDebit: 628000,
  totalCredit: 1017000,
};

const DEMO_JOURNAL = [
  {
    id: 'je-1', date: '2026-06-12', description: 'مبيعات يومية',
    lines: [
      { id: 'l1', debit: 8500, credit: 0, account: { code: '1000', name: 'النقدية', type: 'ASSET' } },
      { id: 'l2', debit: 0, credit: 8500, account: { code: '4000', name: 'إيرادات المبيعات', type: 'REVENUE' } },
    ],
  },
  {
    id: 'je-2', date: '2026-06-11', description: 'رواتب شهر يونيو',
    lines: [
      { id: 'l3', debit: 45000, credit: 0, account: { code: '5100', name: 'رواتب الموظفين', type: 'EXPENSE' } },
      { id: 'l4', debit: 0, credit: 45000, account: { code: '1000', name: 'النقدية', type: 'ASSET' } },
    ],
  },
];

const DEMO_INVOICES = [
  { id: 'inv-1', invoiceNumber: 'INV-2026-001', orderId: 'ord-demo-1', amount: 850, vatAmount: 127.5, totalAmount: 977.5, status: 'PAID' as const, dueDate: '2026-06-15', paidAt: now, items: [{ name: 'ثوب سعودي فاخر', quantity: 1, price: 850 }], createdAt: now },
  { id: 'inv-2', invoiceNumber: 'INV-2026-002', orderId: 'ord-demo-2', amount: 1200, vatAmount: 180, totalAmount: 1380, status: 'UNPAID' as const, dueDate: '2026-06-20', items: [{ name: 'بشت ملكي', quantity: 1, price: 1200 }], createdAt: now },
];

const DEMO_AVAILABLE_REPS = [
  { id: 'demo-rep', name: 'ماجد الشمري', rating: 4.9, completedJobs: 342, distanceKm: 1.2, pricePerVisit: 30 },
  { id: 'rep-2', name: 'فهد العتيبي', rating: 4.8, completedJobs: 218, distanceKm: 2.5, pricePerVisit: 25 },
];

let demoAddresses = [
  { id: 'addr-1', label: 'المنزل', street: 'شارع التحلية', district: 'العليا', city: 'الرياض', buildingNumber: '12', apartmentNumber: '4', isDefault: true },
  { id: 'addr-2', label: 'العمل', street: 'طريق الملك فهد', district: 'الملز', city: 'الرياض', buildingNumber: '45', isDefault: false },
];

let demoOrdersRuntime = [...DEMO_ORDERS];

let demoMeasurementsRuntime = [
  {
    id: 'm1',
    name: 'الثوب الرئيسي',
    nameAr: 'الثوب الرئيسي',
    data: { chest: 108, waist: 92, shoulderWidth: 48, sleeveLength: 62, shirtLength: 145, neckCircumference: 42 },
    createdAt: now,
  },
  {
    id: 'm2',
    name: 'ثوب سعودي فاخر',
    nameAr: 'ثوب سعودي فاخر',
    data: { chest: 106, waist: 90, shoulderWidth: 46, sleeveLength: 60, shirtLength: 142 },
    createdAt: now,
  },
];

function parseDemoQuery(path: string): URLSearchParams {
  const q = path.includes('?') ? path.slice(path.indexOf('?')) : '';
  return new URLSearchParams(q);
}

function demoBasePath(path: string): string {
  return path.split('?')[0];
}

/** يُرجع استجابة API وهمية حسب المسار */
export function getDemoApiResponse(path: string, method = 'GET', body?: unknown): unknown | undefined {
  const base = demoBasePath(path);

  // ─── Mutations (وضع العرض) ───
  if (method === 'POST' && base === '/auth/login') {
    const payload = body as { phone?: string; password?: string };
    const entry = Object.entries(DEMO_CREDENTIALS).find(([, c]) => c.phone === payload?.phone);
    if (entry && payload?.password === entry[1].password) {
      const session = getDemoSession(entry[0] as keyof typeof DEMO_CREDENTIALS);
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          phone: session.user.phone,
          email: session.user.email,
          role: session.user.role,
          status: 'ACTIVE',
          createdAt: session.user.createdAt,
        },
        access_token: session.token,
        refresh_token: `demo-refresh-${entry[0]}`,
        expires_in: 86400,
      };
    }
    return {
      user: getDemoSession('customer').user,
      access_token: 'demo-token-customer',
      refresh_token: 'demo-refresh-customer',
      expires_in: 86400,
    };
  }
  if (method === 'POST' && base === '/hr/employees') {
    const payload = body as { name?: string; position?: string; phone?: string; salary?: number };
    return {
      id: `emp-${Date.now()}`,
      shopId: 'shop-riyadh-1',
      name: payload?.name || 'موظف جديد',
      nameAr: payload?.name || 'موظف جديد',
      position: payload?.position || 'خياط',
      positionAr: payload?.position || 'خياط',
      phone: payload?.phone,
      salary: payload?.salary ?? 5000,
      isActive: true,
      createdAt: now,
    };
  }
  if (method === 'DELETE' && /^\/hr\/employees\/[^/]+$/.test(base)) {
    return { message: 'deleted' };
  }
  if (method === 'POST' && base === '/orders') {
    const payload = body as {
      shopId?: string;
      totalAmount?: number;
      items?: Array<{ name: string; quantity: number; unitPrice?: number }>;
      paymentMethod?: string;
      deliveryAddress?: { city?: string; street?: string; district?: string };
      measurements?: Record<string, number>;
    };
    const id = `ord-demo-${Date.now()}`;
    const orderNumber = `ORD-${String(Date.now()).slice(-4)}`;
    const shop = DEMO_SHOPS.find((s) => s.id === payload?.shopId) ?? DEMO_SHOPS[0];
    const totalAmount = payload?.totalAmount ?? payload?.items?.[0]?.unitPrice ?? 850;
    const newOrder = {
      id,
      orderNumber,
      customerId: 'demo-customer',
      customerName: 'أحمد العميل',
      customerPhone: '966511111111',
      shopId: payload?.shopId || shop.id,
      shopName: shop.nameAr || shop.name,
      status: 'PENDING',
      items: payload?.items?.length
        ? payload.items.map((i) => ({ ...i, unitPrice: i.unitPrice ?? totalAmount }))
        : [{ name: 'ثوب سعودي', quantity: 1, unitPrice: totalAmount, serviceName: 'ثوب سعودي' }],
      totalAmount,
      deliveryFee: 25,
      vatAmount: Math.round(totalAmount * 0.15 * 100) / 100,
      grandTotal: Math.round((totalAmount * 1.15 + 25) * 100) / 100,
      paymentStatus: payload?.paymentMethod ? 'PAID' : 'UNPAID',
      paymentMethod: payload?.paymentMethod || 'MADA',
      deliveryMethod: 'DELIVERY',
      deliveryAddress: payload?.deliveryAddress || { city: 'الرياض', district: '—', street: '—' },
      measurements: payload?.measurements || {},
      createdAt: now,
      updatedAt: now,
      tracking: [],
    };
    demoOrdersRuntime = [newOrder, ...demoOrdersRuntime];
    return newOrder;
  }
  if (method === 'PATCH' && /^\/orders\/[^/]+\/status$/.test(base)) {
    const id = base.match(/^\/orders\/([^/]+)\/status$/)?.[1];
    const status = (body as { status?: string })?.status;
    if (id && status) {
      demoOrdersRuntime = demoOrdersRuntime.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      const order = demoOrdersRuntime.find((o) => o.id === id);
      return order ?? { updated: true, status };
    }
    return { updated: true, status: status || 'CONFIRMED' };
  }
  if (method === 'PATCH' && /^\/orders\/[^/]+$/.test(base)) {
    return { updated: true, status: 'CONFIRMED' };
  }
  if (method === 'POST' && base === '/services') {
    const id = `svc-${Date.now()}`;
    return { id, status: 'PENDING', serviceType: 'ON_SITE_MEASUREMENT', createdAt: now };
  }
  if (method === 'POST' && /^\/services\/[^/]+\/dispatch$/.test(base)) {
    return { dispatched: true, status: 'DISPATCHED' };
  }
  if (method === 'PATCH' && /^\/services\/[^/]+\/(location|arrive|complete)/.test(base)) {
    return { updated: true };
  }
  if (method === 'POST' && base === '/reviews') {
    return { id: 'rev-demo', createdAt: now };
  }
  if (method === 'POST' && base === '/products') {
    return { id: `prod-${Date.now()}`, name: 'منتج جديد', price: 100, isActive: true };
  }
  if (method === 'POST' && base === '/procurement') {
    const id = `po-${Date.now()}`;
    return {
      id, shopId: 'shop-riyadh-1', orderNumber: `PO-${String(Date.now()).slice(-4)}`, status: 'PENDING',
      totalAmount: 5000, taxAmount: 750, grandTotal: 5750, createdAt: now, updatedAt: now,
      items: [{ id: 'i-new', name: 'قماش جديد', quantity: 10, unitPrice: 500, totalPrice: 5000 }],
    };
  }
  if (method === 'PUT' && /^\/procurement\/[^/]+\/status$/.test(base)) {
    return { updated: true, status: 'CONFIRMED' };
  }
  if (method === 'PUT' && /^\/shops\/[^/]+$/.test(base)) {
    return { updated: true };
  }
  if (method === 'PUT' && /^\/admin\/commissions\/[^/]+$/.test(base)) {
    return { updated: true, rate: (body as { rate?: number })?.rate ?? 10 };
  }
  if (method === 'PUT' && /^\/hr\/employees\/[^/]+$/.test(base)) {
    return { updated: true };
  }
  if (method === 'POST' && /^\/users\/[^/]+\/measurements$/.test(path)) {
    const payload = body as { name?: string; data?: Record<string, number> };
    const entry = {
      id: `m-${Date.now()}`,
      name: payload?.name || 'مقاس جديد',
      nameAr: payload?.name || 'مقاس جديد',
      data: payload?.data || {},
      createdAt: now,
    };
    demoMeasurementsRuntime = [...demoMeasurementsRuntime, entry];
    return entry;
  }
  if (method === 'DELETE' && /^\/users\/[^/]+\/measurements\/[^/]+$/.test(base)) {
    const mId = base.match(/^\/users\/[^/]+\/measurements\/([^/]+)$/)?.[1];
    if (mId) demoMeasurementsRuntime = demoMeasurementsRuntime.filter((m) => m.id !== mId);
    return { message: 'deleted' };
  }
  if (method === 'POST' && /^\/users\/[^/]+\/addresses$/.test(path)) {
    const addr = { id: `addr-${Date.now()}`, label: 'عنوان جديد', street: 'شارع جديد', city: 'الرياض', isDefault: false };
    demoAddresses = [...demoAddresses, addr];
    return addr;
  }
  if (method === 'PUT' && /^\/users\/[^/]+\/addresses\/[^/]+$/.test(path)) {
    return { updated: true };
  }
  if (method === 'DELETE' && /^\/users\/[^/]+\/addresses\/[^/]+$/.test(base)) {
    const addrMatch = base.match(/^\/users\/[^/]+\/addresses\/([^/]+)$/);
    if (addrMatch) demoAddresses = demoAddresses.filter((a) => a.id !== addrMatch[1]);
    return { message: 'deleted' };
  }
  if (method === 'PATCH' && /^\/notifications\/[^/]+\/read$/.test(base)) {
    return { updated: true };
  }
  if (method === 'PATCH' && base === '/notifications/read-all') {
    return { message: 'ok' };
  }
  if (method === 'POST' && /^\/hr\/leaves\/[^/]+\/approve$/.test(base)) {
    return { status: 'APPROVED' };
  }
  if (method === 'POST' && /^\/hr\/leaves\/[^/]+\/reject$/.test(base)) {
    return { status: 'REJECTED' };
  }
  if (method === 'POST' && /^\/hr\/payrolls\/[^/]+\/pay$/.test(base)) {
    return { status: 'PAID', paidAt: now };
  }
  if (method === 'PATCH' && /^\/manufacturing\/tasks\//.test(base)) {
    return { updated: true };
  }
  if (method === 'POST' && base === '/pricing/tiers') {
    return { id: `tier-demo-${Date.now()}`, isActive: true, minQuantity: 10, discountPercent: 5 };
  }
  if (method === 'PUT' && /^\/pricing\/tiers\//.test(base)) {
    return { updated: true };
  }
  if (method === 'DELETE' && /^\/pricing\/tiers\//.test(base)) {
    return { message: 'deleted' };
  }
  if (method === 'PUT' && base === '/auth/profile') {
    const payload = body as { name?: string; email?: string; phone?: string };
    const demoUser = getDemoUserFromToken(useAuthStore.getState().token);
    if (demoUser) {
      return { ...demoUser, ...payload, name: payload?.name ?? demoUser.name, email: payload?.email ?? demoUser.email };
    }
    return payload;
  }
  if (method === 'PUT' && /^\/admin\/users\/[^/]+\/status$/.test(base)) {
    const userId = base.match(/^\/admin\/users\/([^/]+)\/status$/)?.[1];
    const status = (body as { status?: string })?.status ?? 'ACTIVE';
    const u = DEMO_ADMIN_USERS.find((x) => x.id === userId);
    return { user: u ? { ...u, status } : { id: userId, status } };
  }
  if (method === 'POST' && /^\/orders\/[^/]+\/cancel$/.test(base)) {
    const id = base.match(/^\/orders\/([^/]+)\/cancel$/)?.[1];
    if (id) {
      demoOrdersRuntime = demoOrdersRuntime.map((o) =>
        o.id === id ? { ...o, status: 'CANCELLED', updatedAt: now } : o
      );
    }
    return { cancelled: true, status: 'CANCELLED' };
  }
  if (method === 'POST' && /^\/services\/[^/]+\/complete$/.test(base)) {
    return { completed: true, status: 'COMPLETED' };
  }
  if (method === 'POST' && /^\/products\/[^/]+\/stock$/.test(base)) {
    return { updated: true };
  }
  if (method === 'POST' && base === '/pos/sessions') {
    return { id: 'pos-session-demo', status: 'OPEN', openingBalance: (body as { openingBalance?: number })?.openingBalance ?? 0, openedAt: now };
  }
  if (method === 'POST' && /^\/pos\/sessions\/[^/]+\/close$/.test(base)) {
    return { id: 'pos-session-demo', status: 'CLOSED', closedAt: now };
  }
  if (method === 'POST' && /^\/pos\/sessions\/[^/]+\/orders$/.test(base)) {
    return { id: `pos-ord-${Date.now()}`, status: 'PAID', total: (body as { total?: number })?.total ?? 0, createdAt: now };
  }
  if (method === 'POST' && base === '/roles') {
    return { id: `role-${Date.now()}`, ...(body as object), createdAt: now };
  }
  if (method === 'PUT' && /^\/roles\/[^/]+$/.test(base)) {
    return { updated: true };
  }
  if (method === 'DELETE' && /^\/roles\/[^/]+$/.test(base)) {
    return { message: 'deleted' };
  }
  if (method === 'POST' && /^\/orders\/confirm\/[^/]+\/approve$/.test(base)) {
    return { approved: true, status: 'CONFIRMED' };
  }
  if (method === 'POST' && /^\/orders\/confirm\/[^/]+\/changes$/.test(base)) {
    return { changesRequested: true };
  }
  if (method === 'POST' && (base === '/payments/process' || base.startsWith('/payments/process'))) {
    const payload = body as { amount?: number; orderId?: string; method?: string };
    const amount = payload?.amount ?? 850;
    return {
      id: 'pay-demo',
      orderId: payload?.orderId || 'ord-demo-1',
      amount,
      fee: 0,
      netAmount: amount,
      method: payload?.method || 'MADA',
      status: 'SUCCESS',
      referenceId: 'REF-DEMO-001',
      customerName: 'أحمد العميل',
      customerPhone: '966511111111',
      description: 'دفع تجريبي',
      createdAt: now,
    };
  }
  if (method !== 'GET') return undefined;

  if (base === '/auth/profile') {
    const demoUser = getDemoUserFromToken(useAuthStore.getState().token);
    if (demoUser) {
      return {
        id: demoUser.id,
        name: demoUser.name,
        phone: demoUser.phone,
        email: demoUser.email,
        role: demoUser.role,
        status: 'ACTIVE',
        createdAt: demoUser.createdAt,
      };
    }
  }

  if (base === '/services' || base.startsWith('/services')) {
    const params = parseDemoQuery(path);
    if (params.get('status') === 'available') {
      return DEMO_AVAILABLE_REPS;
    }
    const svcMatch = base.match(/^\/services\/([^/]+)$/);
    if (svcMatch && svcMatch[1] !== 'tracking') {
      return DEMO_SERVICE_REQUESTS.find((s) => s.id === svcMatch[1]) ?? DEMO_SERVICE_REQUESTS[0];
    }
    if (base.endsWith('/tracking')) {
      const id = base.match(/^\/services\/([^/]+)\/tracking$/)?.[1];
      const svc = DEMO_SERVICE_REQUESTS.find((s) => s.id === id) ?? DEMO_SERVICE_REQUESTS[0];
      return { service: svc, repLocation: { lat: svc.repLat ?? 24.71, lng: svc.repLng ?? 46.67 } };
    }
    return DEMO_SERVICE_REQUESTS;
  }

  if (base === '/admin/users') {
    const params = parseDemoQuery(path);
    const status = params.get('status');
    let items = DEMO_ADMIN_USERS;
    if (status && status !== 'ALL') {
      items = DEMO_ADMIN_USERS.filter((u) => u.status === status);
    }
    return { items, total: items.length, page: 1, limit: 20 };
  }
  if (base === '/admin/audit-logs') {
    const params = parseDemoQuery(path);
    const severity = params.get('severity');
    let items = DEMO_AUDIT_LOGS;
    if (severity && severity !== 'ALL') {
      items = DEMO_AUDIT_LOGS.filter((l) => l.severity === severity);
    }
    return { items, total: items.length };
  }
  if (base === '/admin/commissions') {
    return DEMO_COMMISSIONS;
  }
  if (base === '/admin/config') {
    return { configs: [{ key: 'site_name', value: 'مفصل', type: 'string', category: 'general', label: 'Site Name', labelAr: 'اسم الموقع', isEnabled: true }] };
  }
  if (base === '/admin/modules') {
    return { modules: [{ key: 'orders', name: 'Orders', nameAr: 'الطلبات', isEnabled: true, order: 1 }] };
  }

  if (base === '/accounting/trial-balance') return DEMO_TRIAL_BALANCE;
  if (base === '/accounting/journal') return DEMO_JOURNAL;
  if (base === '/accounting/accounts') {
    return DEMO_TRIAL_BALANCE.rows.map((r, i) => ({ id: `acc-${i}`, code: r.code, name: r.name, type: r.type, balance: r.debit - r.credit }));
  }
  if (base === '/payments/invoices') {
    return { invoices: DEMO_INVOICES, total: DEMO_INVOICES.length };
  }
  const invoiceMatch = base.match(/^\/payments\/invoices\/([^/]+)$/);
  if (invoiceMatch) {
    const invoice = DEMO_INVOICES.find((i) => i.id === invoiceMatch[1]) ?? DEMO_INVOICES[0];
    return invoice;
  }
  if (base === '/payments/transactions') {
    return { items: [{ id: 'pay-1', orderId: 'ord-demo-1', amount: 977.5, fee: 0, netAmount: 977.5, method: 'MADA', status: 'SUCCESS', referenceId: 'REF-001', customerName: 'أحمد العميل', customerPhone: '966511111111', description: 'دفع طلب ORD-2401', createdAt: now }], total: 1, page: 1, limit: 20 };
  }

  if (base === '/shops' || base === '/shops/featured' || base === '/shops/nearby' || base === '/shops/ranked') {
    return { items: DEMO_SHOPS, total: DEMO_SHOPS.length, page: 1, limit: 20 };
  }
  const shopMatch = base.match(/^\/shops\/([^/]+)$/);
  if (shopMatch && shopMatch[1] !== 'ranked') {
    const shop = DEMO_SHOPS.find((s) => s.id === shopMatch[1]) ?? DEMO_SHOPS[0];
    return {
      ...shop,
      shopServices: DEMO_SERVICES.filter((s) => s.shopId === shop.id),
      yearsExperience: shop.yearsExperience ?? 12,
      specialties: shop.categories || [],
      description: shop.descriptionAr || shop.description,
    };
  }
  const servicesMatch = base.match(/^\/shops\/([^/]+)\/services$/);
  if (servicesMatch) {
    return DEMO_SERVICES.filter((s) => s.shopId === servicesMatch[1]);
  }

  if (base === '/products' || base.startsWith('/products')) {
    return { items: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length, page: 1, limit: 20 };
  }
  const productMatch = base.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    return DEMO_PRODUCTS.find((p) => p.id === productMatch[1]) ?? DEMO_PRODUCTS[0];
  }

  if (base === '/orders' || base.startsWith('/orders/customer') || base.startsWith('/orders/shop')) {
    const params = parseDemoQuery(path);
    const status = params.get('status');
    let items = demoOrdersRuntime;
    if (status && status !== 'ALL') {
      items = demoOrdersRuntime.filter((o) => o.status === status);
    }
    return { items, total: items.length, page: 1, limit: 20 };
  }
  const orderMatch = base.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) {
    return demoOrdersRuntime.find((o) => o.id === orderMatch[1]) ?? demoOrdersRuntime[0];
  }

  if (base === '/admin/dashboard') {
    return {
      dashboard: {
        totalUsers: 5842,
        totalShops: 156,
        totalMerchants: 48,
        totalOrders: 1248,
        totalRevenue: 892000,
        recentOrders: DEMO_ORDERS.slice(0, 3),
        recentUsers: [
          { id: 'demo-customer', name: 'أحمد العميل', status: 'ACTIVE', createdAt: 'منذ ساعتين' },
          { id: 'demo-tailor', name: 'خالد الخياط', status: 'ACTIVE', createdAt: 'منذ 5 ساعات' },
          { id: 'demo-merchant', name: 'سعد التاجر', status: 'ACTIVE', createdAt: 'أمس' },
        ],
        revenueByMonth: DEMO_REVENUE_MONTHS,
        ordersByStatus: DEMO_ORDERS_BY_STATUS,
      },
    };
  }
  if (base === '/admin/reports/revenue') {
    return { summary: { totalRevenue: 892000, growthRate: 12.5 }, items: DEMO_REVENUE_MONTHS, total: 892000 };
  }
  if (base === '/admin/reports/orders') {
    return { summary: { totalOrders: 1248, growthRate: 8.3 }, items: DEMO_ORDERS_BY_STATUS, total: 1248 };
  }
  if (base === '/admin/reports/shops') {
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

  if (base === '/hr/employees') {
    return { items: DEMO_EMPLOYEES, total: DEMO_EMPLOYEES.length, page: 1, limit: 50 };
  }
  if (base === '/hr/attendance') return DEMO_ATTENDANCE;
  if (base === '/hr/leaves') return DEMO_LEAVE_REQUESTS;
  if (base === '/hr/payrolls') return DEMO_PAYROLL;

  if (base === '/pos/products') return DEMO_POS_PRODUCTS;
  if (base === '/roles') return DEMO_ROLES;
  if (base === '/procurement') {
    return { items: DEMO_PROCUREMENT, total: DEMO_PROCUREMENT.length, page: 1, limit: 20 };
  }
  if (base === '/manufacturing/tasks') return DEMO_MANUFACTURING;
  if (base === '/pricing/tiers') return DEMO_PRICING_TIERS;

  const measurementsMatch = base.match(/^\/users\/([^/]+)\/measurements$/);
  if (measurementsMatch) {
    return { measurements: demoMeasurementsRuntime };
  }

  const addressesMatch = base.match(/^\/users\/([^/]+)\/addresses$/);
  if (addressesMatch) {
    return { addresses: demoAddresses };
  }

  if (base === '/notifications' || base.startsWith('/notifications')) {
    return { notifications: DEMO_NOTIFICATIONS, total: DEMO_NOTIFICATIONS.length };
  }

  if (base === '/reports/overview') {
    return {
      totalRevenue: 892000,
      totalOrders: 1248,
      totalProducts: DEMO_PRODUCTS.length,
      lowStockCount: 2,
      revenueChange: 12.5,
      ordersChange: 8.3,
    };
  }
  if (base === '/reports/summary') {
    return { revenue: 892000, orders: 1248, customers: 5842, growth: 12.5 };
  }
  if (base === '/reports/sales-trend') {
    return DEMO_REVENUE_MONTHS.map((m) => ({ date: m.name, revenue: m.value, orders: Math.round(m.value / 450) }));
  }
  if (base === '/reports/top-products') {
    return DEMO_PRODUCTS.slice(0, 5).map((p) => ({ id: p.id, name: p.nameAr, sold: p.soldCount || 0, revenue: (p.soldCount || 0) * p.price }));
  }
  if (base === '/reports/payments') {
    return [{ method: 'MADA', count: 420, amount: 520000 }, { method: 'CASH', count: 180, amount: 210000 }];
  }

  const confirmMatch = base.match(/^\/orders\/confirm\/([^/]+)$/);
  if (confirmMatch) {
    const order = demoOrdersRuntime[0];
    return {
      token: confirmMatch[1],
      order,
      shop: DEMO_SHOPS[0],
      measurements: demoMeasurementsRuntime[0]?.data || {},
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    };
  }

  if (base === '/pos/sessions') {
    return [{ id: 'pos-session-demo', status: 'OPEN', openingBalance: 500, openedAt: now }];
  }
  const posSessionMatch = base.match(/^\/pos\/sessions\/([^/]+)$/);
  if (posSessionMatch) {
    return { id: posSessionMatch[1], status: 'OPEN', openingBalance: 500, openedAt: now };
  }
  const posOrdersMatch = base.match(/^\/pos\/sessions\/([^/]+)\/orders$/);
  if (posOrdersMatch) {
    return [{ id: 'pos-ord-1', total: 850, status: 'PAID', createdAt: now }];
  }

  return undefined;
}

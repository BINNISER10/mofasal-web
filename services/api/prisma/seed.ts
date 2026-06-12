import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// Inlined for Docker seed (compiled to dist/seed.js — no ts-node at runtime).
const ALL = { all: true };
const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN: ALL,
  TAILOR_SHOP: {
    orders: true, products: true, inventory: true, finances: true, accounting: true,
    reports: true, hr: true, staff: true, procurement: true, suppliers: true,
    pos: true, settings: true, services: true, measurements: true,
  },
  TAILOR: {
    orders: true, products: true, inventory: true, staff: true, services: true, measurements: true,
  },
  MERCHANT: {
    products: true, inventory: true, finances: true, accounting: true, reports: true,
    procurement: true, suppliers: true, pos: true, b2b: true, settings: true,
  },
  REPRESENTATIVE: { services: true, orders: true, measurements: true },
  CUSTOMER: { orders: true, measurements: true, ai: true },
};

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 12);

  const shop = await prisma.shop.create({
    data: {
      name: 'مفصل الرياض',
      nameAr: 'مفصل الرياض',
      description: 'أفضل محل خياطة رجالية في الرياض',
      phone: '966500000001',
      email: 'info@riyadh-tailor.com',
      city: 'الرياض',
      region: 'الرياض',
      lat: 24.7136,
      lng: 46.6753,
      rating: 4.8,
      isVerified: true,
      isOpen: true,
      subscriptionPlan: 'PREMIUM',
    },
  });

  await prisma.shop.create({
    data: {
      name: 'خياط جدة',
      nameAr: 'خياط جدة',
      description: 'خياطة رجالية فاخرة في جدة',
      phone: '966500000002',
      email: 'info@jeddah-tailor.com',
      city: 'جدة',
      region: 'مكة المكرمة',
      lat: 21.4858,
      lng: 39.1925,
      rating: 4.6,
      isVerified: true,
      isOpen: true,
    },
  });

  await prisma.shop.create({
    data: {
      name: 'مفصل الدمام',
      nameAr: 'مفصل الدمام',
      description: 'خياطة رجالية في الدمام',
      phone: '966500000003',
      email: 'info@dammam-tailor.com',
      city: 'الدمام',
      region: 'الشرقية',
      lat: 26.4207,
      lng: 50.0888,
      rating: 4.5,
      isVerified: true,
      isOpen: true,
    },
  });

  const roleAdmin = await prisma.role.create({
    data: { shopId: shop.id, name: 'ADMIN', displayName: 'System Admin', displayNameAr: 'مدير النظام', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN },
  });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'TAILOR_SHOP', displayName: 'Tailor Shop Manager', displayNameAr: 'مدير محل الخياطة', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.TAILOR_SHOP },
  });

  const roleTailor = await prisma.role.create({
    data: { shopId: shop.id, name: 'TAILOR', displayName: 'Tailor', displayNameAr: 'خياط', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.TAILOR },
  });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'MERCHANT', displayName: 'Merchant', displayNameAr: 'تاجر', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.MERCHANT },
  });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'REPRESENTATIVE', displayName: 'Representative', displayNameAr: 'مندوب', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.REPRESENTATIVE },
  });

  const roleCustomer = await prisma.role.create({
    data: { shopId: shop.id, name: 'CUSTOMER', displayName: 'Customer', displayNameAr: 'عميل', isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.CUSTOMER },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mufasal.com' },
    create: { shopId: shop.id, name: 'مدير النظام', email: 'admin@mufasal.com', phone: '966500000000', password, roleId: roleAdmin.id, status: 'ACTIVE' },
    update: { name: 'مدير النظام', password, roleId: roleAdmin.id, status: 'ACTIVE' },
  });

  const catSuits = await prisma.category.create({
    data: { name: 'Suits', nameAr: 'بدل', slug: 'suits', order: 1 },
  });
  const catThobes = await prisma.category.create({
    data: { name: 'Thobes', nameAr: 'ثياب', slug: 'thobes', order: 2 },
  });
  const catFabrics = await prisma.category.create({
    data: { name: 'Fabrics', nameAr: 'أقمشة', slug: 'fabrics', order: 3 },
  });
  const catAccessories = await prisma.category.create({
    data: { name: 'Accessories', nameAr: 'إكسسوارات', slug: 'accessories', order: 4 },
  });
  const catKids = await prisma.category.create({
    data: { name: 'Kids Fabrics', nameAr: 'أقمشة أطفال', slug: 'kids', order: 5 },
  });

  const products = [
    { name: 'Italian Wool Suit', nameAr: 'بدلة صوف إيطالية', price: 2500, costPrice: 1200, categoryId: catSuits.id, sku: 'SUIT-001' },
    { name: 'Linen Summer Suit', nameAr: 'بدلة كتان صيفية', price: 1800, costPrice: 900, categoryId: catSuits.id, sku: 'SUIT-002' },
    { name: 'Classic Black Suit', nameAr: 'بدلة سوداء كلاسيكية', price: 3000, costPrice: 1500, categoryId: catSuits.id, sku: 'SUIT-003' },
    { name: 'White Thobe', nameAr: 'ثوب أبيض', price: 350, costPrice: 150, categoryId: catThobes.id, sku: 'THOBE-001' },
    { name: 'Premium White Thobe', nameAr: 'ثوب أبيض فاخر', price: 650, costPrice: 300, categoryId: catThobes.id, sku: 'THOBE-002' },
    { name: 'Black Thobe', nameAr: 'ثوب أسود', price: 400, costPrice: 180, categoryId: catThobes.id, sku: 'THOBE-003' },
    { name: 'Egyptian Cotton Fabric', nameAr: 'قماش قطني مصري', price: 120, costPrice: 60, categoryId: catFabrics.id, sku: 'FAB-001', unit: 'meter' },
    { name: 'Italian Silk Fabric', nameAr: 'قماش حرير إيطالي', price: 450, costPrice: 200, categoryId: catFabrics.id, sku: 'FAB-002', unit: 'meter' },
    { name: 'Wool Blend Fabric', nameAr: 'قماش صوف مخلوط', price: 280, costPrice: 140, categoryId: catFabrics.id, sku: 'FAB-003', unit: 'meter' },
    { name: 'Linen Fabric', nameAr: 'قماش كتان', price: 150, costPrice: 70, categoryId: catFabrics.id, sku: 'FAB-004', unit: 'meter' },
    { name: 'Cashmere Wool', nameAr: 'صوف كشمير فاخر', price: 580, costPrice: 300, categoryId: catFabrics.id, sku: 'FAB-005', unit: 'meter' },
    { name: 'Japanese Cotton', nameAr: 'قطن ياباني ناعم', price: 200, costPrice: 100, categoryId: catFabrics.id, sku: 'FAB-006', unit: 'meter' },
    { name: 'French Velvet', nameAr: 'مخمل فرنسي', price: 350, costPrice: 180, categoryId: catFabrics.id, sku: 'FAB-007', unit: 'meter' },
    { name: 'Summer Niaqa', nameAr: 'نياقة صيفي خفيف', price: 90, costPrice: 40, categoryId: catFabrics.id, sku: 'FAB-008', unit: 'meter' },
    { name: 'Winter Niaqa', nameAr: 'نياقة شتوي ثقيل', price: 130, costPrice: 65, categoryId: catFabrics.id, sku: 'FAB-009', unit: 'meter' },
    { name: 'Boys White Thobe Fabric', nameAr: 'قماش ثوب أطفال أبيض', price: 95, costPrice: 45, categoryId: catKids.id, sku: 'KIDS-001', unit: 'meter' },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        shopId: shop.id,
        name: p.name,
        nameAr: p.nameAr,
        sku: p.sku,
        type: 'PHYSICAL',
        price: p.price,
        costPrice: p.costPrice,
        stockQuantity: 50,
        unit: (p as any).unit || 'piece',
        images: [],
        categoryId: p.categoryId,
        visibility: 'PUBLIC',
        isActive: true,
      },
    });
  }

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@mufasal.com' },
    create: { shopId: shop.id, name: 'أحمد العميل', email: 'customer@mufasal.com', phone: '966511111111', password, roleId: roleCustomer.id, status: 'ACTIVE' },
    update: { name: 'أحمد العميل', password, roleId: roleCustomer.id, status: 'ACTIVE' },
  });

  // ─── Representatives (مناديب القياس) ───
  const roleRep = await prisma.role.findFirst({ where: { shopId: shop.id, name: 'REPRESENTATIVE' } });
  if (roleRep) {
    await prisma.user.upsert({
      where: { email: 'rep@mufasal.com' },
      create: { shopId: shop.id, name: 'ماجد الشمري', email: 'rep@mufasal.com', phone: '966522222222', password, roleId: roleRep.id, status: 'ACTIVE' },
      update: { name: 'ماجد الشمري', password, roleId: roleRep.id, status: 'ACTIVE' },
    });
    await prisma.user.upsert({
      where: { email: 'rep2@mufasal.com' },
      create: { shopId: shop.id, name: 'فهد العتيبي', email: 'rep2@mufasal.com', phone: '966522222223', password, roleId: roleRep.id, status: 'ACTIVE' },
      update: { name: 'فهد العتيبي', password, roleId: roleRep.id, status: 'ACTIVE' },
    });
  }

  // ─── Tailor & Merchant users ───
  await prisma.user.upsert({
    where: { email: 'tailor@mufasal.com' },
    create: { shopId: shop.id, name: 'خالد الخياط', email: 'tailor@mufasal.com', phone: '966533333333', password, roleId: roleTailor.id, status: 'ACTIVE' },
    update: { name: 'خالد الخياط', password, roleId: roleTailor.id, status: 'ACTIVE' },
  });
  const roleMerchant = await prisma.role.findFirst({ where: { shopId: shop.id, name: 'MERCHANT' } });
  if (roleMerchant) {
    await prisma.user.upsert({
      where: { email: 'merchant@mufasal.com' },
      create: { shopId: shop.id, name: 'سعد التاجر', email: 'merchant@mufasal.com', phone: '966544444444', password, roleId: roleMerchant.id, status: 'ACTIVE' },
      update: { name: 'سعد التاجر', password, roleId: roleMerchant.id, status: 'ACTIVE' },
    });
  }

  const tailorServices = [
    { serviceType: 'TAILORING', name: 'Men Thobe', nameAr: 'ثوب رجالي', price: 350, duration: 5 },
    { serviceType: 'TAILORING', name: 'Formal Suit', nameAr: 'بدلة رسمية', price: 850, duration: 10 },
    { serviceType: 'TAILORING', name: 'Bisht', nameAr: 'بشت / مشلح', price: 800, duration: 6 },
    { serviceType: 'TAILORING', name: 'Kids Thobe', nameAr: 'ثوب أطفال', price: 220, duration: 4 },
    { serviceType: 'ALTERATION', name: 'Alteration', nameAr: 'تعديل ملبس', price: 80, duration: 2 },
  ];
  for (const svc of tailorServices) {
    await prisma.shopService.create({ data: { shopId: shop.id, ...svc } });
  }

  let customer = await prisma.customer.findFirst({ where: { phone: '966511111111' } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { shopId: shop.id, name: 'أحمد العميل', phone: '966511111111' },
    });
  }

  await prisma.order.create({
    data: {
      orderNumber: `MUF-${nanoid(8).toUpperCase()}`,
      customerId: customer.id,
      shopId: shop.id,
      status: 'COMPLETED',
      totalAmount: 2500,
      vatAmount: 375,
      grandTotal: 2875,
      items: {
        create: [
          { name: 'بدلة صوف إيطالية', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: `MUF-${nanoid(8).toUpperCase()}`,
      customerId: customer.id,
      shopId: shop.id,
      status: 'PENDING',
      totalAmount: 650,
      vatAmount: 97.5,
      grandTotal: 747.5,
      items: {
        create: [
          { name: 'ثوب أبيض فاخر', quantity: 1, unitPrice: 650, totalPrice: 650 },
        ],
      },
    },
  });

  // ─── Accounting Chart of Accounts (شجرة الحسابات) ───
  // الأصول (Assets)
  await prisma.account.create({
    data: { shopId: shop.id, code: '1000', name: 'صندوق النقدية', type: 'ASSET', balance: 50000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '1100', name: 'حساب البنك', type: 'ASSET', balance: 150000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '1200', name: 'الذمم المدينة', type: 'ASSET', balance: 25000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '1300', name: 'المخزون', type: 'ASSET', balance: 75000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '1400', name: 'المعدات والأثاث', type: 'ASSET', balance: 30000 },
  });

  // الخصوم (Liabilities)
  await prisma.account.create({
    data: { shopId: shop.id, code: '2000', name: 'الذمم الدائنة', type: 'LIABILITY', balance: 15000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '2100', name: 'الرواتب المستحقة', type: 'LIABILITY', balance: 8000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '2200', name: 'الضرائب المستحقة', type: 'LIABILITY', balance: 5000 },
  });

  // حقوق الملكية (Equity)
  await prisma.account.create({
    data: { shopId: shop.id, code: '3000', name: 'رأس المال', type: 'EQUITY', balance: 200000 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '3100', name: 'الأرباح المحتجزة', type: 'EQUITY', balance: 62000 },
  });

  // الإيرادات (Revenue)
  await prisma.account.create({
    data: { shopId: shop.id, code: '4000', name: 'إيرادات المبيعات', type: 'REVENUE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '4100', name: 'إيرادات الخدمات', type: 'REVENUE', balance: 0 },
  });

  // المصروفات (Expenses)
  await prisma.account.create({
    data: { shopId: shop.id, code: '5000', name: 'تكلفة البضاعة المباعة', type: 'EXPENSE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '5100', name: 'رواتب الموظفين', type: 'EXPENSE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '5200', name: 'الإيجار', type: 'EXPENSE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '5300', name: 'الكهرباء والماء', type: 'EXPENSE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '5400', name: 'المواد الخام', type: 'EXPENSE', balance: 0 },
  });
  await prisma.account.create({
    data: { shopId: shop.id, code: '5500', name: 'العمولات', type: 'EXPENSE', balance: 0 },
  });

  // ─── Clear & Seed new module data ───
  await prisma.pOSOrder.deleteMany({});
  await prisma.pOSSession.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.supplierProduct.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});

  // ─── Departments ───
  const deptTailoring = await prisma.department.create({
    data: { shopId: shop.id, name: 'Tailoring', nameAr: 'الخياطة', isActive: true },
  });
  const deptSales = await prisma.department.create({
    data: { shopId: shop.id, name: 'Sales', nameAr: 'المبيعات', isActive: true },
  });
  const deptAdmin = await prisma.department.create({
    data: { shopId: shop.id, name: 'Administration', nameAr: 'الإدارة', isActive: true },
  });

  // ─── Employees ───
  const emp1 = await prisma.employee.create({
    data: { shopId: shop.id, name: 'خالد الأحمد', phone: '966500000010', position: 'Master Tailor', positionAr: 'خياط أول', salary: 8000, departmentId: deptTailoring.id, hireDate: new Date('2024-01-15') },
  });
  await prisma.employee.create({
    data: { shopId: shop.id, name: 'محمد السلمي', phone: '966500000011', position: 'Tailor', positionAr: 'خياط', salary: 5000, departmentId: deptTailoring.id, hireDate: new Date('2024-03-01') },
  });
  await prisma.employee.create({
    data: { shopId: shop.id, name: 'فهد القحطاني', phone: '966500000012', position: 'Sales Representative', positionAr: 'مندوب مبيعات', salary: 4500, departmentId: deptSales.id, hireDate: new Date('2024-02-01') },
  });
  // make emp1 the department manager
  await prisma.department.update({ where: { id: deptTailoring.id }, data: { managerId: emp1.id } });

  // ─── Attendance (today) ───
  const today = new Date(); today.setHours(8, 0, 0, 0);
  await prisma.attendance.create({
    data: { employeeId: emp1.id, date: today, checkIn: today, status: 'PRESENT' },
  });

  // ─── Leave Request ───
  await prisma.leaveRequest.create({
    data: { employeeId: emp1.id, type: 'ANNUAL', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-05'), reason: 'إجازة سنوية', status: 'PENDING' },
  });

  // ─── Payroll ───
  await prisma.payroll.create({
    data: { employeeId: emp1.id, month: 5, year: 2026, baseSalary: 8000, overtime: 500, bonuses: 1000, deductions: 300, netSalary: 9200, status: 'PAID', paidAt: new Date() },
  });

  // ─── Suppliers ───
  const sup1 = await prisma.supplier.create({
    data: { shopId: shop.id, name: 'مؤسسة النسيج السعودي', nameAr: 'مؤسسة النسيج السعودي', phone: '966500000020', email: 'info@saudi-textile.com', city: 'الرياض', region: 'الرياض', taxNumber: '310123456700003', commercialReg: '1010234567' },
  });
  await prisma.supplier.create({
    data: { shopId: shop.id, name: 'شركة الأقمشة الإيطالية', nameAr: 'شركة الأقمشة الإيطالية', phone: '966500000021', city: 'جدة', region: 'مكة المكرمة' },
  });

  // ─── Supplier Products ───
  const fabricProducts = await prisma.product.findMany({ where: { shopId: shop.id, category: { slug: 'fabrics' } } });
  if (fabricProducts.length > 0) {
    await prisma.supplierProduct.create({
      data: { supplierId: sup1.id, productId: fabricProducts[0].id, price: 55, minOrder: 10 },
    });
  }

  // ─── Purchase Order ───
  const po = await prisma.purchaseOrder.create({
    data: {
      shopId: shop.id, supplierId: sup1.id, orderNumber: `PO-${nanoid(8).toUpperCase()}`, status: 'PENDING', totalAmount: 5500, taxAmount: 825, grandTotal: 6325, createdById: adminUser.id,
      items: { create: [{ name: 'قماش قطني مصري', quantity: 50, unitPrice: 110, totalPrice: 5500 }] },
    },
  });

  // ─── POS Session ───
  const posSession = await prisma.pOSSession.create({
    data: { shopId: shop.id, cashierId: adminUser.id, openingBalance: 1000, status: 'OPEN' },
  });
  await prisma.pOSOrder.create({
    data: { sessionId: posSession.id, orderNumber: `POS-${nanoid(8).toUpperCase()}`, totalAmount: 350, paymentMethod: 'CASH' },
  });

  console.log('Seed completed successfully!');
  console.log(`  Admin: admin@mufasal.com / admin123`);
  console.log(`  Customer: customer@mufasal.com / admin123`);
  console.log(`  Rep: rep@mufasal.com / admin123`);
  console.log(`  Tailor: tailor@mufasal.com / admin123`);
  console.log(`  Merchant: merchant@mufasal.com / admin123`);
  console.log(`  Shop: ${shop.name}`);
  console.log(`  Products: ${products.length} (including fabrics)`);
  console.log(`  Employees: 3, Suppliers: 2, Representatives: 2`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

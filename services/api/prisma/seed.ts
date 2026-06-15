import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/config/permissions';

const prisma = new PrismaClient();

const FABRIC_CATALOG = [
  { name: 'Egyptian Cotton Fabric', nameAr: 'قماش قطني مصري', price: 120, costPrice: 60, sku: 'FAB-001', unit: 'meter' },
  { name: 'Italian Silk Fabric', nameAr: 'قماش حرير إيطالي', price: 450, costPrice: 200, sku: 'FAB-002', unit: 'meter' },
  { name: 'Wool Blend Fabric', nameAr: 'قماش صوف مخلوط', price: 280, costPrice: 140, sku: 'FAB-003', unit: 'meter' },
  { name: 'Linen Fabric', nameAr: 'قماش كتان', price: 150, costPrice: 70, sku: 'FAB-004', unit: 'meter' },
];

/** متجر أقمشة منفصل + ربط التاجر + طلب B2B تجريبي */
async function ensureFabricB2BSetup(tailorShopId: string, password: string, catFabricsId?: string) {
  let fabricShop = await prisma.shop.findFirst({ where: { name: 'متجر الأقمشة' } });
  if (!fabricShop) {
    fabricShop = await prisma.shop.create({
      data: {
        name: 'متجر الأقمشة',
        nameAr: 'متجر الأقمشة',
        description: 'تاجر أقمشة رجالية — توريد B2B للخياطين',
        phone: '966544444440',
        email: 'fabric@mufasal.com',
        city: 'الرياض',
        region: 'الرياض',
        address: 'حي الصناعية، الرياض',
        lat: 24.75,
        lng: 46.68,
        rating: 4.9,
        isVerified: true,
        isOpen: true,
        subscriptionPlan: 'PREMIUM',
      },
    });
  }

  let merchantRole = await prisma.role.findFirst({ where: { shopId: fabricShop.id, name: 'MERCHANT' } });
  if (!merchantRole) {
    merchantRole = await prisma.role.create({
      data: { shopId: fabricShop.id, name: 'MERCHANT', permissions: DEFAULT_ROLE_PERMISSIONS.MERCHANT },
    });
  } else {
    await prisma.role.update({
      where: { id: merchantRole.id },
      data: { permissions: DEFAULT_ROLE_PERMISSIONS.MERCHANT },
    });
  }

  if (catFabricsId) {
    for (const f of FABRIC_CATALOG) {
      const exists = await prisma.product.findFirst({ where: { shopId: fabricShop.id, sku: f.sku } });
      if (!exists) {
        await prisma.product.create({
          data: {
            shopId: fabricShop.id,
            name: f.name,
            nameAr: f.nameAr,
            sku: f.sku,
            type: 'PHYSICAL',
            price: f.price,
            costPrice: f.costPrice,
            stockQuantity: 100,
            unit: f.unit,
            images: [],
            categoryId: catFabricsId,
            visibility: 'PUBLIC',
            isActive: true,
          },
        });
      }
    }
  }

  const merchant = await prisma.user.findUnique({ where: { email: 'merchant@mufasal.com' } });
  if (merchant) {
    await prisma.user.update({
      where: { id: merchant.id },
      data: { shopId: fabricShop.id, roleId: merchantRole.id, password },
    });
  }

  const tailorRole = await prisma.role.findFirst({ where: { shopId: tailorShopId, name: 'TAILOR' } });
  if (tailorRole) {
    await prisma.role.update({
      where: { id: tailorRole.id },
      data: { permissions: DEFAULT_ROLE_PERMISSIONS.TAILOR },
    });
  }

  const b2bCount = await prisma.fabricSupplyOrder.count({ where: { merchantShopId: fabricShop.id } });
  if (b2bCount === 0) {
    const tailorUser = await prisma.user.findUnique({ where: { email: 'tailor@mufasal.com' } });
    const product = await prisma.product.findFirst({ where: { shopId: fabricShop.id, sku: 'FAB-001' } });
    if (tailorUser && product) {
      const qty = 5;
      const unitPrice = product.price;
      const total = unitPrice * qty;
      const vat = total * 0.15;
      await prisma.fabricSupplyOrder.create({
        data: {
          orderNumber: `B2B-${nanoid(8).toUpperCase()}`,
          merchantShopId: fabricShop.id,
          buyerShopId: tailorShopId,
          buyerUserId: tailorUser.id,
          deliveryTarget: 'TAILOR_SHOP',
          deliveryAddress: { city: 'الرياض', street: 'حي العليا' },
          status: 'PENDING',
          totalAmount: total,
          vatAmount: vat,
          grandTotal: total + vat,
          notes: 'طلب تجريبي — قماش لتفصيل ثوب',
          items: {
            create: [{
              productId: product.id,
              name: product.nameAr || product.name,
              quantity: qty,
              unit: 'meter',
              unitPrice,
              totalPrice: total,
            }],
          },
        },
      });
    }
  }

  return { fabricShop, merchantRole };
}

/** يحدّث حسابات التجربة على قاعدة موجودة دون إعادة seed كامل */
async function ensureDemoUsers(password: string): Promise<boolean> {
  const shop = await prisma.shop.findFirst({ where: { name: 'مفصل الرياض' } });
  if (!shop) return false;

  const catFabrics = await prisma.category.findFirst({ where: { slug: 'fabrics' } });
  const b2b = await ensureFabricB2BSetup(shop.id, password, catFabrics?.id);

  const roles = await prisma.role.findMany({ where: { shopId: shop.id } });
  const roleId = (name: string) => roles.find((r) => r.name === name)?.id;

  const users = [
    { email: 'admin@mufasal.com', name: 'مدير النظام', phone: '966500000000', role: 'ADMIN' },
    { email: 'customer@mufasal.com', name: 'أحمد العميل', phone: '966511111111', role: 'CUSTOMER' },
    { email: 'tailor@mufasal.com', name: 'خالد الخياط', phone: '966533333333', role: 'TAILOR' },
    { email: 'merchant@mufasal.com', name: 'سعد التاجر', phone: '966544444444', role: 'MERCHANT' },
    { email: 'rep@mufasal.com', name: 'ماجد الشمري', phone: '966522222222', role: 'REPRESENTATIVE' },
    { email: 'rep2@mufasal.com', name: 'فهد المندوب', phone: '966522222223', role: 'REPRESENTATIVE' },
  ];

  for (const u of users) {
    if (u.role === 'MERCHANT' && b2b?.fabricShop) {
      await prisma.user.upsert({
        where: { email: u.email },
        create: {
          shopId: b2b.fabricShop.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          password,
          roleId: b2b.merchantRole.id,
          status: 'ACTIVE',
        },
        update: {
          name: u.name,
          phone: u.phone,
          password,
          shopId: b2b.fabricShop.id,
          roleId: b2b.merchantRole.id,
          status: 'ACTIVE',
        },
      });
      continue;
    }
    const rid = roleId(u.role);
    if (!rid) continue;
    await prisma.user.upsert({
      where: { email: u.email },
      create: { shopId: shop.id, name: u.name, email: u.email, phone: u.phone, password, roleId: rid, status: 'ACTIVE' },
      update: { name: u.name, phone: u.phone, password, roleId: rid, status: 'ACTIVE' },
    });
  }

  for (const role of roles) {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role.name];
    if (defaults) {
      await prisma.role.update({
        where: { id: role.id },
        data: { permissions: defaults },
      });
    }
  }

  console.log('Demo users upserted on existing database');
  return true;
}

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  if (await ensureDemoUsers(password)) return;

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
    data: { shopId: shop.id, name: 'ADMIN', permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN },
  });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'TAILOR_SHOP', permissions: DEFAULT_ROLE_PERMISSIONS.TAILOR_SHOP },
  });

  const roleTailor = await prisma.role.create({
    data: { shopId: shop.id, name: 'TAILOR', permissions: DEFAULT_ROLE_PERMISSIONS.TAILOR },
  });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'MERCHANT', permissions: DEFAULT_ROLE_PERMISSIONS.MERCHANT },
  });

  const roleMerchant = await prisma.role.findFirst({ where: { shopId: shop.id, name: 'MERCHANT' } });

  await prisma.role.create({
    data: { shopId: shop.id, name: 'REPRESENTATIVE', permissions: DEFAULT_ROLE_PERMISSIONS.REPRESENTATIVE },
  });

  const roleRep = await prisma.role.findFirst({ where: { shopId: shop.id, name: 'REPRESENTATIVE' } });

  const roleCustomer = await prisma.role.create({
    data: { shopId: shop.id, name: 'CUSTOMER', permissions: DEFAULT_ROLE_PERMISSIONS.CUSTOMER },
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
  ];

  for (const p of products) {
    if (p.categoryId === catFabrics.id) continue;
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

  await prisma.user.upsert({
    where: { email: 'tailor@mufasal.com' },
    create: { shopId: shop.id, name: 'خالد الخياط', email: 'tailor@mufasal.com', phone: '966533333333', password, roleId: roleTailor.id, status: 'ACTIVE' },
    update: { name: 'خالد الخياط', password, roleId: roleTailor.id, status: 'ACTIVE' },
  });

  if (roleMerchant) {
    await prisma.user.upsert({
      where: { email: 'merchant@mufasal.com' },
      create: { shopId: shop.id, name: 'سعد التاجر', email: 'merchant@mufasal.com', phone: '966544444444', password, roleId: roleMerchant.id, status: 'ACTIVE' },
      update: { name: 'سعد التاجر', password, roleId: roleMerchant.id, status: 'ACTIVE' },
    });
  }

  await ensureFabricB2BSetup(shop.id, password, catFabrics.id);

  if (roleRep) {
    await prisma.user.upsert({
      where: { email: 'rep@mufasal.com' },
      create: { shopId: shop.id, name: 'ماجد الشمري', email: 'rep@mufasal.com', phone: '966522222222', password, roleId: roleRep.id, status: 'ACTIVE' },
      update: { name: 'ماجد الشمري', password, roleId: roleRep.id, status: 'ACTIVE' },
    });
    await prisma.user.upsert({
      where: { email: 'rep2@mufasal.com' },
      create: { shopId: shop.id, name: 'فهد المندوب', email: 'rep2@mufasal.com', phone: '966522222223', password, roleId: roleRep.id, status: 'ACTIVE' },
      update: { name: 'فهد المندوب', password, roleId: roleRep.id, status: 'ACTIVE' },
    });
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

  await prisma.account.create({
    data: {
      shopId: shop.id,
      code: '1000',
      name: 'صندوق النقدية',
      type: 'ASSET',
      balance: 50000,
    },
  });

  await prisma.account.create({
    data: {
      shopId: shop.id,
      code: '2000',
      name: 'حساب البنك',
      type: 'ASSET',
      balance: 150000,
    },
  });

  await prisma.account.create({
    data: {
      shopId: shop.id,
      code: '4000',
      name: 'إيرادات المبيعات',
      type: 'REVENUE',
      balance: 0,
    },
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
  const fabricShop = await prisma.shop.findFirst({ where: { name: 'متجر الأقمشة' } });
  const fabricProducts = await prisma.product.findMany({
    where: { shopId: fabricShop?.id || shop.id, category: { slug: 'fabrics' } },
  });
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
  console.log(`  Tailor: tailor@mufasal.com / admin123`);
  console.log(`  Merchant: merchant@mufasal.com / admin123`);
  console.log(`  Rep: rep@mufasal.com / admin123`);
  console.log(`  Shop: ${shop.name}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Employees: 3, Suppliers: 2, Departments: 3`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

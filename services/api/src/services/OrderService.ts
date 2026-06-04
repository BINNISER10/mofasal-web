import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['STAFF_ON_WAY', 'CANCELLED'],
  STAFF_ON_WAY: ['TAKING_MEASUREMENTS', 'CANCELLED'],
  TAKING_MEASUREMENTS: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['CUTTING_FABRIC', 'CANCELLED'],
  CUTTING_FABRIC: ['SEWING_ASSEMBLY', 'CANCELLED'],
  SEWING_ASSEMBLY: ['IRONING_FINISHING', 'CANCELLED'],
  IRONING_FINISHING: ['PACKING_WRAPPING', 'CANCELLED'],
  PACKING_WRAPPING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'RETURNED'],
  COMPLETED: [],
  CANCELLED: [],
  RETURNED: [],
};

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'STAFF_ON_WAY' | 'TAKING_MEASUREMENTS' | 'IN_PROGRESS' | 'CUTTING_FABRIC' | 'SEWING_ASSEMBLY' | 'IRONING_FINISHING' | 'PACKING_WRAPPING' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

interface OrderWhereClause {
  shopId?: string;
  customerId?: object;
  status?: string;
  orderNumber?: object;
  paymentStatus?: string;
  items?: object;
}

export class OrderService {
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = nanoid(6).toUpperCase();
    return `MUF-${timestamp}-${random}`;
  }

  // جسر User→Customer: كل طلب مرتبط بسجل Customer داخل المحل المستهدف.
  // نوفّق المستخدم المصادَق بسجل Customer عبر (shopId, phone) أو ننشئ واحداً.
  static async resolveCustomerId(userId: string, shopId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    const phone = user.phone || `user-${userId}`;

    const existing = await prisma.customer.findFirst({ where: { shopId, phone } });
    if (existing) return existing.id;

    const created = await prisma.customer.create({
      data: { shopId, phone, name: user.name || 'عميل' },
    });
    return created.id;
  }

  static async createOrder(data: {
    customerId?: string; userId?: string; shopId: string; totalAmount?: number;
    deliveryFee?: number; customerNotes?: string; paymentMethod?: string;
    items?: Array<{ name: string; quantity: number; unitPrice: number }>;
  }) {
    const orderNumber = this.generateOrderNumber();
    const totalAmount = data.totalAmount || 0;
    const deliveryFee = data.deliveryFee || 0;
    const vatAmount = totalAmount * 0.15;
    const grandTotal = totalAmount + vatAmount + deliveryFee;

    // إن لم يُمرّر customerId صريح، نوفّقه من المستخدم المصادَق
    const customerId = data.customerId
      || (data.userId ? await this.resolveCustomerId(data.userId, data.shopId) : undefined);
    if (!customerId) throw ApiError.badRequest('Customer could not be resolved');

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        shopId: data.shopId,
        totalAmount,
        vatAmount,
        deliveryFee,
        grandTotal,
        customerNotes: data.customerNotes,
        paymentMethod: data.paymentMethod,
        items: data.items ? {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        } : undefined,
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true } },
        shop: { select: { id: true, name: true } },
      },
    });

    return order;
  }

  static async getOrders(filters: {
    userId?: string; shopId?: string; role?: string; status?: string;
    page?: number; limit?: number; search?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: OrderWhereClause = {};
    if (filters.shopId) where.shopId = filters.shopId;
    if (filters.userId) {
      // userId هو معرّف User؛ نوفّقه بسجلات Customer عبر الهاتف
      const user = await prisma.user.findUnique({
        where: { id: filters.userId }, select: { phone: true },
      });
      const customers = user?.phone
        ? await prisma.customer.findMany({ where: { phone: user.phone }, select: { id: true } })
        : [];
      where.customerId = { in: customers.map((c) => c.id) };
    }
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.orderNumber = { contains: filters.search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true } },
          shop: { select: { id: true, name: true, logo: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  static async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true } },
        shop: { select: { id: true, name: true, nameAr: true, logo: true, address: true, lat: true, lng: true } },
      },
    });
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  }

  static async updateOrderStatus(orderId: string, newStatus: string, userId: string, note?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Order not found');

    const allowedTransitions = STATUS_FLOW[order.status];
    if (!allowedTransitions?.includes(newStatus)) {
      throw ApiError.badRequest(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(newStatus === 'CONFIRMED' ? { confirmedDate: new Date(), isConfirmed: true } : {}),
        ...(newStatus === 'COMPLETED' ? { paymentStatus: 'PAID' } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        shop: { select: { id: true, name: true } },
      },
    });

    return updatedOrder;
  }

  static readonly TRACKING_SEQUENCE: Array<{ status: string; label: string; labelEn: string }> = [
    { status: 'PENDING', label: 'تم استلام الطلب', labelEn: 'Order received' },
    { status: 'CONFIRMED', label: 'تم تأكيد الطلب', labelEn: 'Order confirmed' },
    { status: 'STAFF_ON_WAY', label: 'الموظف في الطريق', labelEn: 'Staff on the way' },
    { status: 'TAKING_MEASUREMENTS', label: 'أخذ المقاسات', labelEn: 'Taking measurements' },
    { status: 'IN_PROGRESS', label: 'قيد التنفيذ والخياطة', labelEn: 'Cutting & sewing' },
    { status: 'CUTTING_FABRIC', label: 'قص القماش', labelEn: 'Cutting fabric' },
    { status: 'SEWING_ASSEMBLY', label: 'التجميع والخياطة', labelEn: 'Sewing assembly' },
    { status: 'IRONING_FINISHING', label: 'الكي والتشطيب', labelEn: 'Ironing & finishing' },
    { status: 'PACKING_WRAPPING', label: 'التغليف', labelEn: 'Packing & wrapping' },
    { status: 'READY_FOR_DELIVERY', label: 'جاهز للتوصيل', labelEn: 'Ready for delivery' },
    { status: 'OUT_FOR_DELIVERY', label: 'في الطريق إليك', labelEn: 'Out for delivery' },
    { status: 'DELIVERED', label: 'تم التوصيل', labelEn: 'Delivered' },
    { status: 'COMPLETED', label: 'مكتمل', labelEn: 'Completed' },
    { status: 'CANCELLED', label: 'ملغي', labelEn: 'Cancelled' },
    { status: 'RETURNED', label: 'مرتجع', labelEn: 'Returned' },
  ];

  static async getOrderTracking(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Order not found');

    const currentIdx = this.TRACKING_SEQUENCE.findIndex((s) => s.status === order.status);
    const cancelled = order.status === 'CANCELLED';

    return this.TRACKING_SEQUENCE.map((step, i) => ({
      status: step.status,
      label: step.label,
      labelEn: step.labelEn,
      description: '',
      timestamp: i === 0 ? order.createdAt : (i <= currentIdx ? order.updatedAt : null),
      completed: !cancelled && i < currentIdx,
      active: !cancelled && i === currentIdx,
    }));
  }

  static async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Order not found');
    if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw ApiError.badRequest('لا يمكن إلغاء الطلب في حالته الحالية');
    }
    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        shop: { select: { id: true, name: true } },
      },
    });
  }

  static async getOrdersByCustomer(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        skip, take: limit,
        include: { items: true, shop: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { customerId } }),
    ]);
    return { orders, total, page, limit };
  }

  static async getOrdersByShop(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { shopId },
        skip, take: limit,
        include: { items: true, customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { shopId } }),
    ]);
    return { orders, total, page, limit };
  }

  static async assignStaff(orderId: string, staffId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Order not found');
    return prisma.order.update({
      where: { id: orderId },
      data: { staffId },
      include: { customer: { select: { id: true, name: true } }, shop: { select: { id: true, name: true } } },
    });
  }

  static async getOrderStats(shopId?: string) {
    const where = shopId ? { shopId } : {};
    const [total, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, paymentStatus: 'PAID' }, _sum: { grandTotal: true } }),
    ]);
    return { total, totalRevenue: revenue._sum.grandTotal || 0 };
  }

  /**
   * إنشاء أمر شراء (B2B) تلقائي للقماش المطلوب في طلب تفصيل.
   * يبحث عن منتج القماش بالاسم، ينقص المخزون، وينشئ أمر شراء من المورّد المرتبط.
   * @param orderId رقم الطلب الأصلي
   * @param fabricName اسم القماش المطلوب (بحث جزئي)
   * @param requiredMeters الأمتار المطلوبة (تُقرّب لأعلى لأقرب متر كامل)
   */
  static async createB2BSubOrderForFabric(orderId: string, fabricName: string, requiredMeters: number) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw ApiError.notFound('Order not found');

    const fabric = await prisma.product.findFirst({
      where: { shopId: order.shopId, name: { contains: fabricName, mode: 'insensitive' } },
    });
    if (!fabric) throw ApiError.notFound('Fabric product not found');

    const quantity = Math.ceil(requiredMeters);

    await prisma.product.update({
      where: { id: fabric.id },
      data: { stockQuantity: { decrement: quantity } },
    });

    const supplierProduct = await prisma.supplierProduct.findFirst({
      where: { productId: fabric.id },
    });

    const unitPrice = supplierProduct?.price ?? fabric.costPrice ?? 0;
    const totalAmount = unitPrice * quantity;

    return prisma.purchaseOrder.create({
      data: {
        shopId: order.shopId,
        supplierId: supplierProduct?.supplierId,
        orderNumber: `PO-${nanoid(8).toUpperCase()}`,
        status: 'DRAFT',
        totalAmount,
        grandTotal: totalAmount,
        notes: `Auto-generated for order ${order.orderNumber} (fabric: ${fabricName})`,
        items: {
          create: [
            {
              productId: fabric.id,
              name: fabric.name,
              quantity,
              unitPrice,
              totalPrice: totalAmount,
            },
          ],
        },
      },
    });
  }
}

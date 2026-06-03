import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import { LedgerService } from './LedgerService';
import { NotificationService } from './NotificationService';

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

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

    // إشعار فوري: عميل + موظفو المحل
    NotificationService.notifyOrderCreated({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      shopId: order.shopId,
      grandTotal: order.grandTotal,
    }).catch((err) => logger.error('Order creation notification failed', err));

    return order;
  }

  static async getOrders(filters: {
    userId?: string; shopId?: string; role?: string; status?: string;
    page?: number; limit?: number; search?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
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
        orderMeasurements: true,
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

    // إشعار تغيير الحالة (لا يُعطّل تدفّق الطلب)
    NotificationService.notifyOrderStatusChanged({
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      shopId: updatedOrder.shopId,
      status: newStatus,
      previousStatus: order.status,
    }).catch((err) => logger.error('Order status notification failed', err));

    // ترحيل محاسبي تلقائي عند اعتبار الطلب مدفوعاً (لا يُعطّل تدفّق الطلب أبداً)
    if (newStatus === 'COMPLETED') {
      LedgerService.postOrderRevenue(updatedOrder).catch((err) =>
        logger.error(`Auto ledger posting failed for order ${updatedOrder.orderNumber}: ${err.message}`)
      );
    }

    return updatedOrder;
  }

  static readonly TRACKING_SEQUENCE: Array<{ status: string; label: string; labelEn: string }> = [
    { status: 'PENDING', label: 'تم استلام الطلب', labelEn: 'Order received' },
    { status: 'CONFIRMED', label: 'تم تأكيد الطلب', labelEn: 'Order confirmed' },
    { status: 'IN_PROGRESS', label: 'قيد التنفيذ والخياطة', labelEn: 'In progress' },
    { status: 'READY_FOR_DELIVERY', label: 'جاهز للتوصيل', labelEn: 'Ready for delivery' },
    { status: 'OUT_FOR_DELIVERY', label: 'في الطريق إليك', labelEn: 'Out for delivery' },
    { status: 'DELIVERED', label: 'تم التوصيل', labelEn: 'Delivered' },
    { status: 'COMPLETED', label: 'مكتمل', labelEn: 'Completed' },
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
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        shop: { select: { id: true, name: true } },
      },
    });
    // إشعار الإلغاء
    NotificationService.notifyOrderStatusChanged({
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      shopId: updatedOrder.shopId,
      status: 'CANCELLED',
      previousStatus: order.status,
    }).catch((err) => logger.error('Order cancellation notification failed', err));
    return updatedOrder;
  }

  static async createB2BSubOrderForFabric(orderId: string, fabricNote: string, quantity = 3.5) {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      // 1. Find the product (fabric) by name or SKU
      const product = await prisma.product.findFirst({
        where: {
          type: 'FABRIC',
          name: { contains: fabricNote, mode: 'insensitive' },
        },
      });

      if (!product) {
        logger.warn(`B2B sub-order: Fabric product not found for note: ${fabricNote}`);
        return;
      }

      // 2. Find the supplier for this product
      const supplierProduct = await prisma.supplierProduct.findFirst({
        where: { productId: product.id, isActive: true },
        include: { supplier: true },
      });

      const supplierId = supplierProduct?.supplierId || null;

      // 3. Deduct stock from the product
      if (product.stockQuantity >= quantity) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQuantity: { decrement: Math.ceil(quantity) } },
        });
      } else {
        logger.warn(`B2B sub-order: Fabric product ${product.name} is out of stock or insufficient quantity.`);
      }

      // 4. Create the B2B PurchaseOrder
      const orderNumber = `PO-B2B-${Date.now().toString(36).toUpperCase()}`;
      await prisma.purchaseOrder.create({
        data: {
          shopId: order.shopId,
          supplierId,
          orderNumber,
          status: 'PENDING',
          totalAmount: (supplierProduct?.price || product.costPrice || 50) * quantity,
          taxAmount: ((supplierProduct?.price || product.costPrice || 50) * quantity) * 0.15,
          grandTotal: ((supplierProduct?.price || product.costPrice || 50) * quantity) * 1.15,
          notes: `طلب قماش تلقائي للطلب رقم ${order.orderNumber}. نوع القماش: ${fabricNote}`,
          items: {
            create: {
              productId: product.id,
              name: product.name,
              quantity: Math.ceil(quantity),
              unitPrice: supplierProduct?.price || product.costPrice || 50,
              totalPrice: (supplierProduct?.price || product.costPrice || 50) * Math.ceil(quantity),
            },
          },
        },
      });

      logger.info(`Successfully generated B2B sub-order ${orderNumber} for fabric ${product.name}`);
    } catch (error) {
      logger.error('Failed to create B2B sub-order for fabric', error);
    }
  }

  static async getOrderStats(shopId?: string) {
    const where = shopId ? { shopId } : {};
    const [total, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, paymentStatus: 'PAID' }, _sum: { grandTotal: true } }),
    ]);
    return { total, totalRevenue: revenue._sum.grandTotal || 0 };
  }
}

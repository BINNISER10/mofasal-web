import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

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

  static async createOrder(data: {
    customerId: string; shopId: string; totalAmount?: number;
    deliveryFee?: number; customerNotes?: string; paymentMethod?: string;
    items?: Array<{ name: string; quantity: number; unitPrice: number }>;
  }) {
    const orderNumber = this.generateOrderNumber();
    const totalAmount = data.totalAmount || 0;
    const deliveryFee = data.deliveryFee || 0;
    const vatAmount = totalAmount * 0.15;
    const grandTotal = totalAmount + vatAmount + deliveryFee;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
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

    const where: any = {};
    if (filters.shopId) where.shopId = filters.shopId;
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

  static async getOrderStats(shopId?: string) {
    const where = shopId ? { shopId } : {};
    const [total, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, paymentStatus: 'PAID' }, _sum: { grandTotal: true } }),
    ]);
    return { total, totalRevenue: revenue._sum.grandTotal || 0 };
  }
}

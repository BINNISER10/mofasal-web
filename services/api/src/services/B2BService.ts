import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ON_WAY', 'CANCELLED'],
  ON_WAY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export type DeliveryTarget = 'TAILOR_SHOP' | 'CUSTOMER_HOME';

interface CreateItemInput {
  productId: string;
  quantity: number;
}

export class B2BService {
  static generateOrderNumber(): string {
    return `B2B-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
  }

  static async resolveUnitPrice(merchantShopId: string, productId: string, quantity: number, basePrice: number): Promise<number> {
    const tier = await prisma.pricingTier.findFirst({
      where: {
        shopId: merchantShopId,
        productId,
        isActive: true,
        minQuantity: { lte: quantity },
      },
      orderBy: { minQuantity: 'desc' },
    });
    if (tier?.b2bPrice != null) return tier.b2bPrice;
    if (tier?.discountPercent) return basePrice * (1 - tier.discountPercent / 100);
    return basePrice;
  }

  static async listFabricMerchants() {
    const shops = await prisma.shop.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            visibility: 'PUBLIC',
            OR: [
              { unit: 'meter' },
              { category: { slug: 'fabrics' } },
            ],
          },
        },
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        city: true,
        rating: true,
        _count: { select: { products: true } },
      },
      orderBy: { rating: 'desc' },
      take: 50,
    });
    return shops;
  }

  static async listOrders(filters: {
    role: string;
    shopId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;

    const role = filters.role;
    if (role === 'MERCHANT') {
      if (!filters.shopId) throw ApiError.forbidden('Shop context required');
      where.merchantShopId = filters.shopId;
    } else if (role === 'TAILOR' || role === 'TAILOR_SHOP') {
      if (!filters.shopId) throw ApiError.forbidden('Shop context required');
      where.buyerShopId = filters.shopId;
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      // all orders
    } else {
      throw ApiError.forbidden('Insufficient permissions');
    }

    const [items, total] = await Promise.all([
      prisma.fabricSupplyOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: { select: { id: true, name: true, nameAr: true } } } },
          merchantShop: { select: { id: true, name: true, nameAr: true, city: true } },
          buyerShop: { select: { id: true, name: true, nameAr: true, city: true } },
          buyerUser: { select: { id: true, name: true, phone: true } },
          linkedOrder: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fabricSupplyOrder.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  static async getById(id: string) {
    const order = await prisma.fabricSupplyOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, nameAr: true, unit: true } } } },
        merchantShop: { select: { id: true, name: true, nameAr: true, phone: true, address: true, city: true } },
        buyerShop: { select: { id: true, name: true, nameAr: true, phone: true, address: true, city: true } },
        buyerUser: { select: { id: true, name: true, phone: true } },
        linkedOrder: { select: { id: true, orderNumber: true, status: true } },
      },
    });
    if (!order) throw ApiError.notFound('B2B order not found');
    return order;
  }

  static async create(data: {
    buyerUserId: string;
    buyerShopId: string;
    merchantShopId: string;
    items: CreateItemInput[];
    deliveryTarget?: DeliveryTarget;
    deliveryAddress?: Record<string, unknown>;
    linkedOrderId?: string;
    notes?: string;
  }) {
    if (!data.items?.length) throw ApiError.badRequest('At least one item is required');
    if (data.buyerShopId === data.merchantShopId) {
      throw ApiError.badRequest('لا يمكن طلب القماش من نفس المتجر');
    }

    const merchantShop = await prisma.shop.findUnique({ where: { id: data.merchantShopId } });
    if (!merchantShop) throw ApiError.notFound('Merchant shop not found');

    const buyerShop = await prisma.shop.findUnique({ where: { id: data.buyerShopId } });
    if (!buyerShop) throw ApiError.notFound('Buyer shop not found');

    let deliveryAddress = data.deliveryAddress;
    const deliveryTarget = data.deliveryTarget || 'TAILOR_SHOP';
    if (deliveryTarget === 'TAILOR_SHOP' && !deliveryAddress) {
      deliveryAddress = {
        label: buyerShop.nameAr || buyerShop.name,
        street: buyerShop.address || '',
        city: buyerShop.city || '',
      };
    }
    if (deliveryTarget === 'CUSTOMER_HOME' && !deliveryAddress?.street) {
      throw ApiError.badRequest('عنوان توصيل العميل مطلوب');
    }

    const lineItems: Array<{
      productId: string;
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, shopId: data.merchantShopId, isActive: true },
      });
      if (!product) throw ApiError.notFound(`Product not found: ${item.productId}`);
      if (product.stockQuantity < item.quantity) {
        throw ApiError.badRequest(`المخزون غير كافٍ للمنتج: ${product.nameAr || product.name}`);
      }
      const unitPrice = await this.resolveUnitPrice(
        data.merchantShopId,
        product.id,
        item.quantity,
        product.price,
      );
      const qty = Math.max(0.5, item.quantity);
      lineItems.push({
        productId: product.id,
        name: product.nameAr || product.name,
        quantity: qty,
        unit: product.unit || 'meter',
        unitPrice,
        totalPrice: unitPrice * qty,
      });
    }

    const totalAmount = lineItems.reduce((s, i) => s + i.totalPrice, 0);
    const vatAmount = totalAmount * 0.15;
    const grandTotal = totalAmount + vatAmount;

    return prisma.fabricSupplyOrder.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        merchantShopId: data.merchantShopId,
        buyerShopId: data.buyerShopId,
        buyerUserId: data.buyerUserId,
        linkedOrderId: data.linkedOrderId,
        deliveryTarget,
        deliveryAddress: deliveryAddress as object,
        notes: data.notes,
        totalAmount,
        vatAmount,
        grandTotal,
        status: 'PENDING',
        items: { create: lineItems },
      },
      include: {
        items: true,
        merchantShop: { select: { id: true, name: true, nameAr: true } },
        buyerShop: { select: { id: true, name: true, nameAr: true } },
      },
    });
  }

  static async updateStatus(
    id: string,
    newStatus: string,
    actor: { role: string; shopId?: string },
  ) {
    const order = await prisma.fabricSupplyOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw ApiError.notFound('B2B order not found');

    const allowed = STATUS_FLOW[order.status];
    if (!allowed?.includes(newStatus)) {
      throw ApiError.badRequest(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const isMerchant = actor.role === 'MERCHANT' && actor.shopId === order.merchantShopId;
    const isBuyer = (actor.role === 'TAILOR' || actor.role === 'TAILOR_SHOP') && actor.shopId === order.buyerShopId;
    const isAdmin = actor.role === 'ADMIN' || actor.role === 'SUPER_ADMIN';

    if (newStatus === 'CANCELLED') {
      if (!isMerchant && !isBuyer && !isAdmin) throw ApiError.forbidden('Insufficient permissions');
    } else if (!isMerchant && !isAdmin) {
      throw ApiError.forbidden('Only merchant can update this status');
    }

    return prisma.$transaction(async (tx) => {
      if (newStatus === 'CONFIRMED' && order.status === 'PENDING') {
        for (const item of order.items) {
          if (!item.productId) continue;
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stockQuantity < item.quantity) {
            throw ApiError.badRequest(`المخزون غير كافٍ: ${item.name}`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: Math.ceil(item.quantity) } },
          });
        }
      }

      if (newStatus === 'CANCELLED' && order.status === 'CONFIRMED') {
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: Math.ceil(item.quantity) } },
          });
        }
      }

      return tx.fabricSupplyOrder.update({
        where: { id },
        data: {
          status: newStatus,
          ...(newStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        },
        include: {
          items: true,
          merchantShop: { select: { id: true, name: true, nameAr: true } },
          buyerShop: { select: { id: true, name: true, nameAr: true } },
        },
      });
    });
  }
}

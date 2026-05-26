import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class ProcurementService {
  static async getPurchaseOrders(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({ where: { shopId }, skip, take: limit, include: { supplier: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } }, items: true }, orderBy: { createdAt: 'desc' } }),
      prisma.purchaseOrder.count({ where: { shopId } }),
    ]);
    return { items, total, page, limit };
  }

  static async getPurchaseOrder(id: string) {
    const order = await prisma.purchaseOrder.findUnique({ where: { id }, include: { supplier: true, createdBy: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, name: true, sku: true } } } } } });
    if (!order) throw ApiError.notFound('Purchase order not found');
    return order;
  }

  static async createPurchaseOrder(data: any) {
    const { items, ...orderData } = data;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = totalAmount * 0.15;
    const grandTotal = totalAmount + taxAmount;
    return prisma.purchaseOrder.create({
      data: { ...orderData, totalAmount, taxAmount, grandTotal, items: { create: items } },
      include: { items: true, supplier: true },
    });
  }

  static async updatePurchaseOrderStatus(id: string, status: string) {
    const order = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!order) throw ApiError.notFound('Purchase order not found');
    const data: any = { status };
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    return prisma.purchaseOrder.update({ where: { id }, data, include: { items: true } });
  }

  static async deletePurchaseOrder(id: string) {
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await prisma.purchaseOrder.delete({ where: { id } });
    return { message: 'Purchase order deleted' };
  }
}

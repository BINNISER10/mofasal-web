import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class SupplierService {
  static async getSuppliers(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.supplier.findMany({ where: { shopId }, skip, take: limit, include: { _count: { select: { purchaseOrders: true, products: true } } }, orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where: { shopId } }),
    ]);
    return { items, total, page, limit };
  }

  static async getSupplier(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id }, include: { products: { include: { product: { select: { id: true, name: true, sku: true, price: true } } } }, purchaseOrders: { take: 20, orderBy: { createdAt: 'desc' } } } });
    if (!supplier) throw ApiError.notFound('Supplier not found');
    return supplier;
  }

  static async createSupplier(data: any) {
    return prisma.supplier.create({ data });
  }

  static async updateSupplier(id: string, data: any) {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Supplier not found');
    return prisma.supplier.update({ where: { id }, data });
  }

  static async deleteSupplier(id: string) {
    const orderCount = await prisma.purchaseOrder.count({ where: { supplierId: id } });
    if (orderCount > 0) throw ApiError.badRequest('Cannot delete supplier with purchase orders');
    await prisma.supplierProduct.deleteMany({ where: { supplierId: id } });
    await prisma.supplier.delete({ where: { id } });
    return { message: 'Supplier deleted' };
  }

  static async addProduct(supplierId: string, data: any) {
    return prisma.supplierProduct.create({ data: { supplierId, ...data }, include: { product: { select: { id: true, name: true, sku: true } } } });
  }

  static async removeProduct(id: string) {
    await prisma.supplierProduct.delete({ where: { id } });
    return { message: 'Product removed from supplier' };
  }
}

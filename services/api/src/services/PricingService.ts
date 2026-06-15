import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export class PricingService {
  static async getTiers(shopId: string) {
    const tiers = await prisma.pricingTier.findMany({
      where: { shopId, isActive: true },
      include: { product: { select: { id: true, name: true, nameAr: true, price: true } } },
      orderBy: [{ productId: 'asc' }, { minQuantity: 'asc' }],
    });
    return tiers.map((t) => ({
      id: t.id,
      productId: t.productId || '',
      productName: t.productName || t.product?.nameAr || t.product?.name,
      minQuantity: t.minQuantity,
      discountPercent: t.discountPercent,
      b2bPrice: t.b2bPrice ?? undefined,
      b2cPrice: t.b2cPrice ?? t.product?.price,
      isActive: t.isActive,
    }));
  }

  static async createTier(shopId: string, data: {
    productId?: string;
    productName?: string;
    minQuantity: number;
    discountPercent: number;
    b2bPrice?: number;
    b2cPrice?: number;
  }) {
    return prisma.pricingTier.create({
      data: { shopId, ...data },
    });
  }

  static async updateTier(id: string, shopId: string, data: Partial<{
    minQuantity: number;
    discountPercent: number;
    b2bPrice: number;
    b2cPrice: number;
    isActive: boolean;
  }>) {
    const tier = await prisma.pricingTier.findFirst({ where: { id, shopId } });
    if (!tier) throw ApiError.notFound('Pricing tier not found');
    return prisma.pricingTier.update({ where: { id }, data });
  }

  static async deleteTier(id: string, shopId: string) {
    const tier = await prisma.pricingTier.findFirst({ where: { id, shopId } });
    if (!tier) throw ApiError.notFound('Pricing tier not found');
    await prisma.pricingTier.delete({ where: { id } });
    return { message: 'Pricing tier deleted' };
  }
}

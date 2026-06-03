import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

export interface CouponInput {
  code: string;
  shopId: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startDate?: Date;
  endDate?: Date;
  applicableTo?: 'ALL' | 'THOBES' | 'SUITS' | 'FABRICS';
  isActive?: boolean;
}

export class CouponService {
  /** إنشاء كوبون جديد */
  static async createCoupon(data: CouponInput) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) throw ApiError.badRequest('كود الكوبون مستخدم مسبقاً');

    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        shopId: data.shopId,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount ?? 0,
        maxDiscount: data.maxDiscount ?? null,
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? 1,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate ?? null,
        applicableTo: data.applicableTo ?? 'ALL',
        isActive: data.isActive ?? true,
      },
    });
  }

  /** تطبيق كوبون على طلب والتحقق من صلاحيته */
  static async applyCoupon(code: string, order: {
    shopId: string;
    customerId?: string;
    totalAmount: number;
    items: Array<{ categorySlug?: string; name: string }>;
  }) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw ApiError.badRequest('كوبون غير صالح');

    // التحقق من تاريخ الصلاحية
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) throw ApiError.badRequest('الكوبون لم يبدأ بعد');
    if (coupon.endDate && now > coupon.endDate) throw ApiError.badRequest('الكوبون منتهي الصلاحية');

    // التحقق من المحل
    if (coupon.shopId !== order.shopId) throw ApiError.badRequest('الكوبون لا ينطبق على هذا المحل');

    // التحقق من الحد الأدنى للطلب
    if (coupon.minOrderAmount && order.totalAmount < coupon.minOrderAmount) {
      throw ApiError.badRequest(`الحد الأدنى للطلب ${coupon.minOrderAmount} ريال لتطبيق الكوبون`);
    }

    // التحقق من الفئة المطبقة
    if (coupon.applicableTo !== 'ALL') {
      const categoryMap: Record<string, string[]> = {
        THOBES: ['thobes', 'ثياب'],
        SUITS: ['suits', 'بدل'],
        FABRICS: ['fabrics', 'أقمشة'],
      };
      const allowed = categoryMap[coupon.applicableTo] || [];
      const hasApplicable = order.items.some((item) =>
        allowed.some((a) =>
          item.categorySlug?.toLowerCase().includes(a) ||
          item.name.toLowerCase().includes(a)
        )
      );
      if (!hasApplicable) throw ApiError.badRequest('الكوبون لا ينطبق على منتجات في سلة التسوق');
    }

    // التحقق من عدد الاستخدامات الإجمالي
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw ApiError.badRequest('نفذت الكمية المتاحة من هذا الكوبون');
    }

    // التحقق من استخدامات العميل
    if (coupon.maxUsesPerUser && order.customerId) {
      const userUsage = await prisma.couponUsage.count({
        where: { couponId: coupon.id, customerId: order.customerId },
      });
      if (userUsage >= coupon.maxUsesPerUser) {
        throw ApiError.badRequest('لقد استخدمت هذا الكوبون مسبقاً');
      }
    }

    // حساب الخصم
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (order.totalAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, order.totalAmount); // لا يتجاوز قيمة الطلب

    return {
      coupon,
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round((order.totalAmount - discount) * 100) / 100,
    };
  }

  /** تسجيل استخدام الكوبون */
  static async recordUsage(couponId: string, customerId: string, orderId: string) {
    await prisma.$transaction([
      prisma.couponUsage.create({
        data: { couponId, customerId, orderId, usedAt: new Date() },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);
  }

  /** قائمة كوبونات المحل */
  static async listCoupons(shopId: string, includeInactive = false) {
    return prisma.coupon.findMany({
      where: { shopId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** تعطيل/تفعيل كوبون */
  static async toggleCoupon(couponId: string, shopId: string, isActive: boolean) {
    const coupon = await prisma.coupon.findFirst({ where: { id: couponId, shopId } });
    if (!coupon) throw ApiError.notFound('الكوبون غير موجود');
    return prisma.coupon.update({ where: { id: couponId }, data: { isActive } });
  }

  /** إحصائيات الكوبون */
  static async getCouponStats(couponId: string) {
    const [coupon, usages] = await Promise.all([
      prisma.coupon.findUnique({ where: { id: couponId } }),
      prisma.couponUsage.findMany({
        where: { couponId },
        include: { customer: { select: { name: true, phone: true } } },
        orderBy: { usedAt: 'desc' },
        take: 50,
      }),
    ]);
    if (!coupon) throw ApiError.notFound('الكوبون غير موجود');
    return { coupon, usages };
  }
}

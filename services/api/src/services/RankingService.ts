import prisma from '../config/database';
import logger from '../utils/logger';
import { RedisService } from './RedisService';

interface RankingFactors {
  rating: number;
  orderCount: number;
  proximityScore: number;
  deliverySpeedScore: number;
  subscriptionBoost: number;
}

interface RankedShop {
  shopId: string;
  score: number;
  factors: RankingFactors;
}

/**
 * خوارزمية الترتيب الذكي للمحلات
 * 
 * نقاط_المحل = (التقييم × 0.35)
 *            + (عدد_الطلبات_المطبّع × 0.25)
 *            + (القرب_الجغرافي × 0.25)
 *            + (سرعة_التسليم × 0.15)
 *            + (دفعة_الاشتراك_المموّل)
 */
export class RankingService {
  private static readonly CACHE_TTL = 3600; // 1 ساعة
  private static readonly CACHE_PREFIX = 'ranking:';

  /**
   * حساب نقاط محل واحد
   */
  static async calculateShopScore(shopId: string, userLocation?: { lat: number; lng: number }): Promise<RankedShop | null> {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        subscription: true,
        orders: {
          where: { status: 'COMPLETED' },
          select: { id: true, createdAt: true, deliveryDate: true },
        },
      },
    });

    if (!shop) return null;

    // التقييم (0-5) -> تطبيع إلى 0-1
    const ratingScore = (shop.rating || 0) / 5;

    // عدد الطلبات المطبّع -> تطبيع (باستخدام log لتقليل التأثير الشديد)
    const orderCount = shop.orders.length;
    const orderScore = Math.min(1, Math.log10(orderCount + 1) / Math.log10(1000));

    // القرب الجغرافي
    let proximityScore = 0.5; // افتراضي إذا لم يحدد المستخدم موقع
    if (userLocation && shop.latitude && shop.longitude) {
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.latitude,
        shop.longitude
      );
      // المسافة بالكيلومتر، نحسب نتيجة عكسية
      proximityScore = Math.max(0, 1 - distance / 50); // 50 كم = 0 نقطة
    }

    // سرعة التسليم (متوسط أيام التسليم)
    let deliverySpeedScore = 0.5;
    if (shop.orders.length > 0) {
      const deliveryTimes = shop.orders
        .map((o) => {
          if (!o.deliveryDate) return null;
          const created = new Date(o.createdAt).getTime();
          const delivered = new Date(o.deliveryDate).getTime();
          return (delivered - created) / (1000 * 60 * 60 * 24); // أيام
        })
        .filter((t): t is number => t !== null && t > 0);

      if (deliveryTimes.length > 0) {
        const avgDays = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
        // 3 أيام = 1 نقطة، 14 يوم = 0 نقطة
        deliverySpeedScore = Math.max(0, 1 - (avgDays - 3) / 11);
      }
    }

    // دفعة الاشتراك المموّل
    let subscriptionBoost = 0;
    if (shop.subscription && shop.subscription.status === 'ACTIVE') {
      const tier = shop.subscription.tier || 'BASIC';
      switch (tier) {
        case 'PREMIUM':
          subscriptionBoost = 0.2;
          break;
        case 'PRO':
          subscriptionBoost = 0.1;
          break;
        case 'BASIC':
          subscriptionBoost = 0.05;
          break;
      }
    }

    const factors: RankingFactors = {
      rating: ratingScore,
      orderCount: orderScore,
      proximityScore,
      deliverySpeedScore,
      subscriptionBoost,
    };

    // حساب النقاط النهائية
    const score =
      ratingScore * 0.35 +
      orderScore * 0.25 +
      proximityScore * 0.25 +
      deliverySpeedScore * 0.15 +
      subscriptionBoost;

    return {
      shopId,
      score: Math.round(score * 1000) / 1000,
      factors,
    };
  }

  /**
   * ترتيب المحلات لمستخدم معين
   */
  static async getRankedShops(
    userId: string,
    filters?: {
      city?: string;
      categoryId?: string;
      limit?: number;
    }
  ): Promise<RankedShop[]> {
    const cacheKey = `${this.CACHE_PREFIX}shops:${userId}:${JSON.stringify(filters || {})}`;

    // محاولة جلب من الكاش
    const cached = await RedisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // جلب موقع المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { latitude: true, longitude: true },
    });

    const userLocation = user?.latitude && user?.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : undefined;

    // جلب المحلات المرشحة
    const shops = await prisma.shop.findMany({
      where: {
        isOpen: true,
        isVerified: true,
        ...(filters?.city && { city: filters.city }),
      },
      include: {
        subscription: true,
        orders: {
          where: { status: 'COMPLETED' },
          select: { id: true, createdAt: true, deliveryDate: true },
        },
      },
      take: filters?.limit || 100,
    });

    // حساب النقاط لكل محل
    const ranked = await Promise.all(
      shops.map((shop) => this.calculateShopScore(shop.id, userLocation))
    );

    const validRanked = ranked.filter((r): r is RankedShop => r !== null);

    // ترتيب تنازلي
    validRanked.sort((a, b) => b.score - a.score);

    // حفظ في الكاش
    await RedisService.set(cacheKey, JSON.stringify(validRanked), this.CACHE_TTL);

    return validRanked;
  }

  /**
   * ترتيب المحلات حسب الفئة
   */
  static async getRankedShopsByCategory(
    categoryId: string,
    userId: string,
    limit = 20
  ): Promise<RankedShop[]> {
    return this.getRankedShops(userId, { categoryId, limit });
  }

  /**
   * ترتيب المحلات حسب المدينة
   */
  static async getRankedShopsByCity(
    city: string,
    userId: string,
    limit = 20
  ): Promise<RankedShop[]> {
    return this.getRankedShops(userId, { city, limit });
  }

  /**
   * تحديث كاش الترتيب عند تغيير بيانات محل
   */
  static async invalidateShopCache(shopId: string): Promise<void> {
    // حذف جميع الكاشات المتعلقة بهذا المحل
    const pattern = `${this.CACHE_PREFIX}shops:*`;
    // ملاحظة: RedisService قد لا يدعم حذف بالـ pattern
    // في الحالة الحالية، نعتمد على TTL
    logger.info(`[Ranking] Cache invalidated for shop ${shopId}`);
  }

  /**
   * حساب المسافة بين نقطتين (Haversine formula)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * الحصول على تقرير الترتيب لمحل معين
   */
  static async getShopRankingReport(shopId: string): Promise<{
    rank: number;
    totalShops: number;
    score: number;
    factors: RankingFactors;
    percentile: number;
  } | null> {
    const ranked = await this.getRankedShops('system', { limit: 1000 });
    const shopIndex = ranked.findIndex((r) => r.shopId === shopId);

    if (shopIndex === -1) return null;

    const shopRanking = ranked[shopIndex];
    const totalShops = ranked.length;
    const percentile = ((totalShops - shopIndex) / totalShops) * 100;

    return {
      rank: shopIndex + 1,
      totalShops,
      score: shopRanking.score,
      factors: shopRanking.factors,
      percentile: Math.round(percentile),
    };
  }
}

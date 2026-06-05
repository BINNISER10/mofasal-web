import prisma from '../config/database';
import logger from '../utils/logger';

const RECENCY_WINDOW_DAYS = 90;

interface ScoredProduct {
  product: any;
  score: number;
}

function recencyBoost(createdAt: Date): number {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 0) return 1;
  if (ageDays >= RECENCY_WINDOW_DAYS) return 0;
  return 1 - ageDays / RECENCY_WINDOW_DAYS;
}

export class RecommendationService {
  /**
   * توصيات شخصية متقدمة تجمع بين:
   * 1. Content-based (تفضيلات المستخدم)
   * 2. Collaborative filtering (مستخدمون مشابهون)
   * 3. Trending (المنتجات الرائجة)
   */
  static async getRecommendations(userId: string, limit = 12) {
    const profile = await prisma.aIProfile.findUnique({ where: { userId } });
    const preferences = (profile?.preferences as Record<string, any>) || {};

    const topCategories: string[] = Array.isArray(preferences.topCategories) ? preferences.topCategories : [];
    const topShops: string[] = Array.isArray(preferences.topShops) ? preferences.topShops : [];
    const categoryCounts: Record<string, number> = preferences.categoryCounts || {};
    const shopCounts: Record<string, number> = preferences.shopCounts || {};

    // Cold-start: لا يوجد سلوك بعد
    if (topCategories.length === 0 && topShops.length === 0) {
      return { items: await this.getPopular(limit), personalized: false, strategy: 'cold-start' };
    }

    // جلب المرشحين
    const candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        visibility: 'PUBLIC',
        stockQuantity: { gt: 0 },
        OR: [
          ...(topCategories.length ? [{ categoryId: { in: topCategories } }] : []),
          ...(topShops.length ? [{ shopId: { in: topShops } }] : []),
        ],
      },
      take: 200,
      include: {
        shop: { select: { id: true, name: true, nameAr: true, rating: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
    });

    // Collaborative filtering: منتجات اشتراها مستخدمون مشابهون
    const collaborativeProducts = await this.getCollaborativeProducts(userId, 50);

    const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));
    const maxShopCount = Math.max(1, ...Object.values(shopCounts));

    const scored: ScoredProduct[] = candidates.map((product) => {
      // Content-based score
      const categoryPref = product.categoryId ? (categoryCounts[product.categoryId] || 0) / maxCategoryCount : 0;
      const shopPref = (shopCounts[product.shopId] || 0) / maxShopCount;
      const ratingScore = (product.shop?.rating || 0) / 5;
      const freshness = recencyBoost(product.createdAt);

      // Collaborative boost
      const collabBoost = collaborativeProducts.some((cp: any) => cp.id === product.id) ? 0.15 : 0;

      const score =
        categoryPref * 0.35 +
        shopPref * 0.2 +
        ratingScore * 0.15 +
        freshness * 0.1 +
        collabBoost * 0.2;

      return { product, score: Math.round(score * 1000) / 1000 };
    });

    scored.sort((a, b) => b.score - a.score);
    const items = scored.slice(0, limit).map((s) => ({ ...s.product, recommendationScore: s.score }));

    return {
      items,
      personalized: true,
      strategy: 'hybrid',
      basedOn: { topCategories, topShops, collaborative: collaborativeProducts.length },
    };
  }

  /**
   * Collaborative Filtering: منتجات اشتراها مستخدمون مشتركون
   * يجد العملاء الذين اشتروا نفس المنتجات ويقترح ما اشتروه
   */
  static async getCollaborativeProducts(userId: string, limit = 50): Promise<any[]> {
    try {
      // جلب طلبات المستخدم الحالي
      const userOrders = await prisma.order.findMany({
        where: { customerId: userId },
        select: { id: true },
        take: 20,
      });

      if (userOrders.length === 0) return [];

      const orderIds = userOrders.map((o) => o.id);

      // جلب عناصر طلبات المستخدم
      const userItems = await prisma.orderItem.findMany({
        where: { orderId: { in: orderIds } },
        select: { name: true },
      });

      if (userItems.length === 0) return [];

      const userItemNames = [...new Set(userItems.map((i) => i.name))];

      // جلب مستخدمين آخرين اشتروا نفس المنتجات
      const similarOrders = await prisma.orderItem.findMany({
        where: {
          name: { in: userItemNames },
          order: { customerId: { not: userId } },
        },
        select: { orderId: true },
        distinct: ['orderId'],
        take: 50,
      });

      if (similarOrders.length === 0) return [];

      const similarOrderIds = similarOrders.map((o) => o.orderId);

      // جلب منتجات اشتروها ولم يشترها المستخدم الحالي
      const collaborativeItems = await prisma.orderItem.findMany({
        where: {
          orderId: { in: similarOrderIds },
          name: { notIn: userItemNames },
        },
        select: { name: true },
        take: limit,
      });

      // تحويل لأسماء فريدة
      const collabNames = [...new Set(collaborativeItems.map((i) => i.name))];

      // جلب المنتجات المطابقة
      const products = await prisma.product.findMany({
        where: {
          name: { in: collabNames },
          isActive: true,
          visibility: 'PUBLIC',
          stockQuantity: { gt: 0 },
        },
        take: limit,
        include: {
          shop: { select: { id: true, name: true, rating: true } },
        },
      });

      return products;
    } catch (err) {
      logger.warn(`[Recommendation] Collaborative filtering failed for user ${userId}: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * منتجات مشابهة (Content-based)
   */
  static async getSimilarProducts(productId: string, limit = 8) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, shopId: true, price: true, name: true },
    });
    if (!product) return [];

    const candidates = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        visibility: 'PUBLIC',
        stockQuantity: { gt: 0 },
        OR: [
          ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
          { name: { contains: product.name, mode: 'insensitive' } },
        ],
      },
      take: 100,
      include: { shop: { select: { id: true, name: true, rating: true } }, category: { select: { id: true, name: true } } },
    });

    const scored = candidates.map((c) => {
      const ratingScore = (c.shop?.rating || 0) / 5;
      const priceCloseness = product.price > 0
        ? 1 - Math.min(1, Math.abs(c.price - product.price) / product.price)
        : 0;
      const sameShop = c.shopId === product.shopId ? 0.15 : 0;
      const nameSimilarity = c.name.includes(product.name) || product.name.includes(c.name) ? 0.2 : 0;
      const score = ratingScore * 0.3 + priceCloseness * 0.35 + sameShop + nameSimilarity;
      return { ...c, recommendationScore: Math.round(score * 1000) / 1000 };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored.slice(0, limit);
  }

  /**
   * المنتجات الرائجة (Trending)
   */
  static async getTrending(limit = 12) {
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        paymentStatus: 'PAID',
      },
      select: { id: true },
      take: 100,
    });

    if (recentOrders.length === 0) return this.getPopular(limit);

    const orderIds = recentOrders.map((o) => o.id);

    const trendingItems = await prisma.orderItem.groupBy({
      by: ['name'],
      where: { orderId: { in: orderIds } },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: limit,
    });

    const trendingNames = trendingItems.map((i) => i.name);

    const products = await prisma.product.findMany({
      where: {
        name: { in: trendingNames },
        isActive: true,
        visibility: 'PUBLIC',
        stockQuantity: { gt: 0 },
      },
      take: limit,
      include: {
        shop: { select: { id: true, name: true, rating: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return products.map((p) => ({
      ...p,
      recommendationScore: trendingItems.find((t) => t.name === p.name)?._count.name || 0,
    }));
  }

  /**
   * Cold-start fallback
   */
  static async getPopular(limit = 12) {
    const products = await prisma.product.findMany({
      where: { isActive: true, visibility: 'PUBLIC', stockQuantity: { gt: 0 } },
      take: 100,
      include: { shop: { select: { id: true, name: true, rating: true } }, category: { select: { id: true, name: true } } },
    });

    const scored = products.map((p) => {
      const ratingScore = (p.shop?.rating || 0) / 5;
      const freshness = recencyBoost(p.createdAt);
      const score = ratingScore * 0.7 + freshness * 0.3;
      return { ...p, recommendationScore: Math.round(score * 1000) / 1000 };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored.slice(0, limit);
  }

  /**
   * توصيات للمتاجر (بناءً على السلوك)
   */
  static async getShopRecommendations(userId: string, limit = 6) {
    const profile = await prisma.aIProfile.findUnique({ where: { userId } });
    const preferences = (profile?.preferences as Record<string, any>) || {};
    const topShops: string[] = Array.isArray(preferences.topShops) ? preferences.topShops : [];

    if (topShops.length === 0) {
      return prisma.shop.findMany({
        where: { isOpen: true, isVerified: true },
        orderBy: { rating: 'desc' },
        take: limit,
        select: { id: true, name: true, nameAr: true, city: true, rating: true, orderCount: true },
      });
    }

    // متاجر مشابهة لتفضيلات المستخدم
    const visitedShops = await prisma.shop.findMany({
      where: { id: { in: topShops } },
      select: { city: true, category: true },
    });

    const cities = [...new Set(visitedShops.map((s) => s.city).filter(Boolean))];
    const categories = [...new Set(visitedShops.map((s) => s.category).filter(Boolean))];

    return prisma.shop.findMany({
      where: {
        id: { notIn: topShops },
        isOpen: true,
        OR: [
          ...(cities.length ? [{ city: { in: cities } }] : []),
          ...(categories.length ? [{ category: { in: categories } }] : []),
        ],
      },
      orderBy: { rating: 'desc' },
      take: limit,
      select: { id: true, name: true, nameAr: true, city: true, rating: true, orderCount: true },
    });
  }

  static async getProfile(userId: string) {
    const profile = await prisma.aIProfile.findUnique({ where: { userId } });
    if (!profile) return { exists: false, insights: '', preferences: {} };
    return {
      exists: true,
      insights: profile.insights,
      preferences: profile.preferences,
      lastUpdated: profile.lastUpdated,
    };
  }
}

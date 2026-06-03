import prisma from '../config/database';

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
   * Personalized product recommendations derived from the user's behavior profile.
   * Falls back to popular/new products for cold-start users (no behavior yet).
   */
  static async getRecommendations(userId: string, limit = 12) {
    const profile = await prisma.aIProfile.findUnique({ where: { userId } });
    const preferences = (profile?.preferences as Record<string, any>) || {};

    const topCategories: string[] = Array.isArray(preferences.topCategories) ? preferences.topCategories : [];
    const topShops: string[] = Array.isArray(preferences.topShops) ? preferences.topShops : [];
    const categoryCounts: Record<string, number> = preferences.categoryCounts || {};
    const shopCounts: Record<string, number> = preferences.shopCounts || {};

    if (topCategories.length === 0 && topShops.length === 0) {
      return { items: await this.getPopular(limit), personalized: false };
    }

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
      include: { shop: { select: { id: true, name: true, rating: true } }, category: { select: { id: true, name: true } } },
    });

    const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));
    const maxShopCount = Math.max(1, ...Object.values(shopCounts));

    const scored: ScoredProduct[] = candidates.map((product) => {
      const categoryPref = product.categoryId ? (categoryCounts[product.categoryId] || 0) / maxCategoryCount : 0;
      const shopPref = (shopCounts[product.shopId] || 0) / maxShopCount;
      const ratingScore = (product.shop?.rating || 0) / 5;
      const freshness = recencyBoost(product.createdAt);

      const score =
        categoryPref * 0.45 +
        shopPref * 0.25 +
        ratingScore * 0.2 +
        freshness * 0.1;

      return { product, score: Math.round(score * 1000) / 1000 };
    });

    scored.sort((a, b) => b.score - a.score);
    const items = scored.slice(0, limit).map((s) => ({ ...s.product, recommendationScore: s.score }));

    return { items, personalized: true, basedOn: { topCategories, topShops } };
  }

  /**
   * Content-based "similar products" for a given product (same category, in-stock).
   */
  static async getSimilarProducts(productId: string, limit = 8) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, shopId: true, price: true },
    });
    if (!product) return [];

    const candidates = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        visibility: 'PUBLIC',
        stockQuantity: { gt: 0 },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
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
      const score = ratingScore * 0.4 + priceCloseness * 0.45 + sameShop;
      return { ...c, recommendationScore: Math.round(score * 1000) / 1000 };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored.slice(0, limit);
  }

  /**
   * Cold-start fallback: highest-rated, in-stock, recent public products.
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

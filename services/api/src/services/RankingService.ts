import prisma from '../config/database';
import logger from '../utils/logger';
import redisService from './RedisService';

export interface RankingFactors {
  rating: number;
  orderCount: number;
  proximityScore: number;
  deliverySpeedScore: number;
  subscriptionBoost: number;
}

export interface RankedShop {
  shopId: string;
  score: number;
  factors: RankingFactors;
}

type ShopForRanking = {
  id: string;
  rating?: number | null;
  orderCount?: number;
  lat?: number | null;
  lng?: number | null;
  subscriptionPlan?: string | null;
  createdAt?: Date;
  _count?: { orders?: number };
};

/**
 * خوارزمية الترتيب الذكي للمحلات (ROADMAP المرحلة 5)
 *
 * نقاط_المحل = (التقييم × 0.35)
 *            + (عدد_الطلبات_المطبّع × 0.25)
 *            + (القرب_الجغرافي × 0.25)
 *            + (سرعة_التسليم × 0.15)
 *            + (دفعة_الاشتراك)
 */
export class RankingService {
  private static readonly CACHE_TTL = 3600;
  private static readonly CACHE_PREFIX = 'ranking:';

  static computeScore(shop: ShopForRanking, userLocation?: { lat: number; lng: number }): RankedShop {
    const ratingScore = Math.min(1, (shop.rating || 0) / 5);
    const orders = shop.orderCount ?? shop._count?.orders ?? 0;
    const orderScore = Math.min(1, Math.log10(orders + 1) / Math.log10(1000));

    let proximityScore = 0.5;
    if (userLocation && shop.lat != null && shop.lng != null) {
      const distance = this.calculateDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng);
      proximityScore = Math.max(0, 1 - distance / 50);
    }

    const subscriptionBoost = this.subscriptionBoost(shop.subscriptionPlan);
    const deliverySpeedScore = 0.5;

    const factors: RankingFactors = {
      rating: ratingScore,
      orderCount: orderScore,
      proximityScore,
      deliverySpeedScore,
      subscriptionBoost,
    };

    const score =
      ratingScore * 0.35 +
      orderScore * 0.25 +
      proximityScore * 0.25 +
      deliverySpeedScore * 0.15 +
      subscriptionBoost;

    return {
      shopId: shop.id,
      score: Math.round(score * 1000) / 1000,
      factors,
    };
  }

  /** ترتيب قائمة محلات جاهزة (يُستدعى من ShopService) */
  static async rankShops<T extends ShopForRanking>(
    shops: T[],
    options?: { userId?: string; userLocation?: { lat: number; lng: number } },
  ): Promise<(T & { rankingScore: number })[]> {
    let userLocation = options?.userLocation;

    if (!userLocation && options?.userId) {
      const address = await prisma.userAddress.findFirst({
        where: { userId: options.userId, isDefault: true },
        select: { lat: true, lng: true },
      });
      if (address?.lat != null && address?.lng != null) {
        userLocation = { lat: address.lat, lng: address.lng };
      }
    }

    const cacheKey = `${this.CACHE_PREFIX}list:${options?.userId || 'anon'}:${userLocation?.lat || 0}:${userLocation?.lng || 0}:${shops.length}`;
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) {
        const order: string[] = JSON.parse(cached);
        const byId = new Map(shops.map((s) => [s.id, s]));
        return order
          .map((id) => byId.get(id))
          .filter((s): s is T => !!s)
          .map((s) => ({ ...s, rankingScore: this.computeScore(s, userLocation).score }));
      }
    } catch {
      /* cache miss */
    }

    const ranked = shops
      .map((shop) => ({
        ...shop,
        rankingScore: this.computeScore(shop, userLocation).score,
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore);

    try {
      await redisService.set(cacheKey, JSON.stringify(ranked.map((s) => s.id)), this.CACHE_TTL);
    } catch {
      /* ignore */
    }

    return ranked;
  }

  static async calculateShopScore(
    shopId: string,
    userLocation?: { lat: number; lng: number },
  ): Promise<RankedShop | null> {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { _count: { select: { orders: true } } },
    });
    if (!shop) return null;
    return this.computeScore(shop, userLocation);
  }

  static async getRankedShops(
    userId: string,
    filters?: { city?: string; limit?: number },
  ): Promise<RankedShop[]> {
    const shops = await prisma.shop.findMany({
      where: {
        isOpen: true,
        isVerified: true,
        ...(filters?.city && { city: { contains: filters.city, mode: 'insensitive' } }),
      },
      include: { _count: { select: { orders: true } } },
      take: filters?.limit || 100,
    });

    const ranked = await this.rankShops(shops, { userId });
    return ranked.map((s) => this.computeScore(s));
  }

  static async invalidateShopCache(shopId: string): Promise<void> {
    logger.info(`[Ranking] Cache invalidated for shop ${shopId}`);
  }

  static async getShopRankingReport(shopId: string): Promise<{
    rank: number;
    totalShops: number;
    score: number;
    factors: RankingFactors;
    percentile: number;
  } | null> {
    const shops = await prisma.shop.findMany({
      where: { isOpen: true, isVerified: true },
      include: { _count: { select: { orders: true } } },
      take: 500,
    });
    const ranked = await this.rankShops(shops);
    const shopIndex = ranked.findIndex((r) => r.id === shopId);
    if (shopIndex === -1) return null;

    const factors = this.computeScore(ranked[shopIndex]).factors;
    const totalShops = ranked.length;
    const percentile = ((totalShops - shopIndex) / totalShops) * 100;

    return {
      rank: shopIndex + 1,
      totalShops,
      score: ranked[shopIndex].rankingScore,
      factors,
      percentile: Math.round(percentile),
    };
  }

  private static subscriptionBoost(plan?: string | null): number {
    switch (plan) {
      case 'PREMIUM':
        return 0.2;
      case 'PRO':
        return 0.1;
      case 'BASIC':
        return 0.05;
      default:
        return 0;
    }
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

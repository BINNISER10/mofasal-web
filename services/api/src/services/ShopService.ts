import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

type ShopSort = 'smart' | 'rating' | 'distance' | 'popular' | 'newest';

interface ShopFilters {
  page?: number;
  limit?: number;
  city?: string;
  region?: string;
  serviceType?: string;
  minRating?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  maxDistance?: number;
  search?: string;
  isOpen?: boolean;
  sort?: ShopSort;
}

const CANDIDATE_CAP = 500;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function computeShopScore(
  shop: { rating?: number; reviewCount?: number; orderCount?: number; isVerified?: boolean; isOpen?: boolean },
  distanceKm: number | null,
  maxDistance: number
): number {
  const ratingScore = clamp01((shop.rating || 0) / 5);
  const reviewScore = clamp01(Math.log10((shop.reviewCount || 0) + 1) / 3);
  const orderScore = clamp01(Math.log10((shop.orderCount || 0) + 1) / 4);
  const verifiedScore = shop.isVerified ? 1 : 0;
  const openScore = shop.isOpen ? 1 : 0;

  const hasGeo = distanceKm !== null;
  const distanceScore = hasGeo ? clamp01(1 - distanceKm! / Math.max(maxDistance, 1)) : 0;

  const w = hasGeo
    ? { rating: 0.3, review: 0.15, order: 0.15, verified: 0.1, open: 0.05, distance: 0.25 }
    : { rating: 0.42, review: 0.22, order: 0.2, verified: 0.1, open: 0.06, distance: 0 };

  const score =
    ratingScore * w.rating +
    reviewScore * w.review +
    orderScore * w.order +
    verifiedScore * w.verified +
    openScore * w.open +
    distanceScore * w.distance;

  return Math.round(score * 1000) / 1000;
}

export class ShopService {
  static async createShop(data: {
    name: string; nameAr?: string; description?: string; logo?: string; coverImage?: string;
    phone?: string; email?: string; address?: string; lat?: number; lng?: number; city?: string; region?: string;
    deliveryRadius?: number; commissionRate?: number;
  }) {
    const shop = await prisma.shop.create({ data });
    return shop;
  }

  static async getShops(filters: ShopFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sort: ShopSort = filters.sort || 'smart';

    const where: any = {};
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.region) where.region = { contains: filters.region, mode: 'insensitive' };
    if (filters.isOpen !== undefined) where.isOpen = filters.isOpen;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nameAr: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.minRating) where.rating = { gte: filters.minRating };

    const hasGeo = filters.lat !== undefined && filters.lng !== undefined;
    const maxDist = filters.maxDistance || 50;

    if (!hasGeo && (sort === 'newest' || sort === 'rating' || sort === 'popular')) {
      const orderBy =
        sort === 'newest' ? { createdAt: 'desc' as const }
        : sort === 'popular' ? { orderCount: 'desc' as const }
        : { rating: 'desc' as const };

      const [rows, total] = await Promise.all([
        prisma.shop.findMany({
          where, skip, take: limit,
          include: { _count: { select: { orders: true, products: true } } },
          orderBy,
        }),
        prisma.shop.count({ where }),
      ]);
      return { shops: rows, total, page, limit };
    }

    const candidates = await prisma.shop.findMany({
      where,
      take: CANDIDATE_CAP,
      include: { _count: { select: { orders: true, products: true } } },
      orderBy: { rating: 'desc' },
    });

    let scored = candidates.map((shop) => {
      const distanceKm =
        hasGeo && shop.lat != null && shop.lng != null
          ? haversineDistance(filters.lat!, filters.lng!, shop.lat, shop.lng)
          : null;
      return {
        ...shop,
        distanceKm: distanceKm != null ? Math.round(distanceKm * 100) / 100 : null,
        score: computeShopScore(shop, distanceKm, maxDist),
      };
    });

    if (hasGeo) {
      scored = scored.filter((s) => s.distanceKm === null || s.distanceKm <= maxDist);
    }

    scored.sort((a, b) => {
      if (sort === 'distance') {
        const da = a.distanceKm ?? Infinity;
        const db = b.distanceKm ?? Infinity;
        if (da !== db) return da - db;
        return b.score - a.score;
      }
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0) || b.score - a.score;
      if (sort === 'popular') return (b.orderCount || 0) - (a.orderCount || 0) || b.score - a.score;
      return b.score - a.score;
    });

    const total = scored.length;
    const shops = scored.slice(skip, skip + limit);

    return { shops, total, page, limit };
  }

  static async getShopById(id: string) {
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        shopServices: { where: { isActive: true }, orderBy: { price: 'asc' } },
        shopVehicles: { where: { isActive: true } },
        users: { select: { id: true, name: true, avatar: true, role: { select: { name: true } } } },
        _count: { select: { orders: true, products: true } },
      },
    });
    if (!shop) throw ApiError.notFound('Shop not found');
    return shop;
  }

  static async updateShop(id: string, data: any) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data });
  }

  static async deleteShop(id: string) {
    await prisma.shop.update({ where: { id }, data: { isOpen: false } });
    return { message: 'Shop deactivated' };
  }

  static async toggleOpenStatus(id: string) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data: { isOpen: !shop.isOpen } });
  }

  static async getShopServices(shopId: string) {
    return prisma.shopService.findMany({ where: { shopId, isActive: true }, orderBy: { price: 'asc' } });
  }

  static async createShopService(shopId: string, data: { serviceType: string; name: string; description?: string; price: number; duration?: number }) {
    return prisma.shopService.create({ data: { ...data, shopId, serviceType: data.serviceType } });
  }

  static async updateShopService(shopId: string, serviceId: string, data: any) {
    const service = await prisma.shopService.findFirst({ where: { id: serviceId, shopId } });
    if (!service) throw ApiError.notFound('Service not found');
    return prisma.shopService.update({ where: { id: serviceId }, data });
  }

  static async deleteShopService(shopId: string, serviceId: string) {
    const service = await prisma.shopService.findFirst({ where: { id: serviceId, shopId } });
    if (!service) throw ApiError.notFound('Service not found');
    await prisma.shopService.update({ where: { id: serviceId }, data: { isActive: false } });
    return { message: 'Service deleted' };
  }

  static async getShopVehicles(shopId: string) {
    return prisma.shopVehicle.findMany({ where: { shopId, isActive: true } });
  }

  static async createShopVehicle(shopId: string, data: { plateNumber: string; model?: string; color?: string; driverName?: string; driverPhone?: string }) {
    return prisma.shopVehicle.create({ data: { ...data, shopId } });
  }

  static async updateShopVehicle(shopId: string, vehicleId: string, data: any) {
    const vehicle = await prisma.shopVehicle.findFirst({ where: { id: vehicleId, shopId } });
    if (!vehicle) throw ApiError.notFound('Vehicle not found');
    return prisma.shopVehicle.update({ where: { id: vehicleId }, data });
  }

  static async deleteShopVehicle(shopId: string, vehicleId: string) {
    const vehicle = await prisma.shopVehicle.findFirst({ where: { id: vehicleId, shopId } });
    if (!vehicle) throw ApiError.notFound('Vehicle not found');
    await prisma.shopVehicle.update({ where: { id: vehicleId }, data: { isActive: false } });
    return { message: 'Vehicle deleted' };
  }

  static async getShopStats(shopId: string) {
    const [totalOrders, pendingOrders, completedOrders, products, revenue] = await Promise.all([
      prisma.order.count({ where: { shopId } }),
      prisma.order.count({ where: { shopId, status: 'PENDING' } }),
      prisma.order.count({ where: { shopId, status: 'COMPLETED' } }),
      prisma.product.count({ where: { shopId, isActive: true } }),
      prisma.order.aggregate({ where: { shopId, paymentStatus: 'PAID' }, _sum: { grandTotal: true } }),
    ]);

    return { totalOrders, pendingOrders, completedOrders, totalProducts: products, totalRevenue: revenue._sum.grandTotal || 0 };
  }
}

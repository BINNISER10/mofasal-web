import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { RankingService } from './RankingService';

interface ShopWhereClause {
  city?: object;
  region?: object;
  isOpen?: boolean;
  OR?: object[];
  rating?: object;
}

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
  sort?: 'smart' | 'rating' | 'distance' | 'popular' | 'newest';
  userId?: string;
}

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

export class ShopService {
  static async createShop(data: {
    name: string; nameAr?: string; description?: string; logo?: string; coverImage?: string;
    phone?: string; email?: string; address?: string; lat?: number; lng?: number; city?: string; region?: string;
    deliveryRadius?: number; commissionRate?: number;
  }) {
    const shop = await prisma.shop.create({ data });
    return shop;
  }

  static async getFeaturedShops(userId?: string) {
    const shops = await prisma.shop.findMany({
      where: { isVerified: true, isOpen: true, rating: { gte: 4 } },
      take: 50,
      include: { _count: { select: { orders: true, products: true } } },
    });
    const ranked = await RankingService.rankShops(shops, { userId });
    return ranked.slice(0, 20);
  }

  static async verifyShop(id: string) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data: { isVerified: true } });
  }

  static async suspendShop(id: string) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data: { isVerified: false, isOpen: false } });
  }

  static async activateShop(id: string) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data: { isOpen: true } });
  }

  static async updateShopCommission(id: string, commission: number) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    return prisma.shop.update({ where: { id }, data: { commissionRate: commission } });
  }

  static async getShops(filters: ShopFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: ShopWhereClause = {};
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

    let shops = await prisma.shop.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: { select: { orders: true, products: true } },
      },
      orderBy: { rating: 'desc' },
    });

    if (filters.lat && filters.lng) {
      const userLat = filters.lat;
      const userLng = filters.lng;
      const maxDist = filters.maxDistance || 50;

      shops = shops.filter((shop) => {
        if (shop.lat && shop.lng) {
          const dist = haversineDistance(userLat, userLng, shop.lat, shop.lng);
          return dist <= maxDist;
        }
        return true;
      });

      shops.sort((a, b) => {
        const distA = a.lat && a.lng ? haversineDistance(userLat, userLng, a.lat, a.lng) : Infinity;
        const distB = b.lat && b.lng ? haversineDistance(userLat, userLng, b.lat, b.lng) : Infinity;
        return distA - distB;
      });
    }

    const total = await prisma.shop.count({ where });

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

  static async updateShop(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    logo: string;
    coverImage: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    district: string;
    lat: number;
    lng: number;
    isOpen: boolean;
    commissionRate: number;
    minOrderAmount: number;
    deliveryRadius: number;
  }>) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) throw ApiError.notFound('Shop not found');
    const updated = await prisma.shop.update({ where: { id }, data });
    await RankingService.invalidateShopCache(id);
    return updated;
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

  static async updateShopService(shopId: string, serviceId: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    price: number;
    duration: number;
    isActive: boolean;
  }>) {
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

  static async updateShopVehicle(shopId: string, vehicleId: string, data: Partial<{
    type: string;
    plateNumber: string;
    model: string;
    color: string;
    driverName: string;
    driverPhone: string;
    isActive: boolean;
  }>) {
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

import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

interface ReviewUpdateData {
  shopRating?: number;
  tailorRating?: number;
  representativeRating?: number;
  shopReview?: string;
  tailorReview?: string;
  representativeReview?: string;
  isPublished?: boolean;
}

interface ReviewWhereClause {
  order: { shopId: string };
  isPublished?: boolean;
}

export class ReviewService {
  static async createReview(data: {
    orderId: string; userId: string; shopRating?: number; tailorRating?: number;
    representativeRating?: number; shopReview?: string; tailorReview?: string; representativeReview?: string;
  }) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw ApiError.notFound('Order not found');
    if (order.customerId !== data.userId) throw ApiError.forbidden('Not your order');

    const existing = await prisma.review.findUnique({ where: { orderId: data.orderId } });
    if (existing) throw ApiError.conflict('Review already exists for this order');

    if (order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
      throw ApiError.badRequest('Can only review completed orders');
    }

    const review = await prisma.review.create({ data });

    await this.updateShopRating(order.shopId);

    return review;
  }

  static async getReview(orderId: string) {
    const review = await prisma.review.findUnique({ where: { orderId } });
    if (!review) throw ApiError.notFound('Review not found');
    return review;
  }

  static async updateReview(orderId: string, userId: string, data: ReviewUpdateData) {
    const review = await prisma.review.findUnique({ where: { orderId } });
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId) throw ApiError.forbidden('Not your review');

    const updated = await prisma.review.update({ where: { orderId }, data });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) await this.updateShopRating(order.shopId);

    return updated;
  }

  static async deleteReview(orderId: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { orderId } });
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId) throw ApiError.forbidden('Not your review');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    await prisma.review.delete({ where: { orderId } });
    if (order) await this.updateShopRating(order.shopId);

    return { message: 'Review deleted' };
  }

  static async getShopReviews(shopId: string, page = 1, limit = 20) {
    const where: ReviewWhereClause = { order: { shopId }, isPublished: true };
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, avatar: true } }, order: { select: { shopId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  static async getUserReviews(userId: string, page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        include: { order: { include: { shop: { select: { id: true, name: true, logo: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return { reviews, total, page, limit };
  }

  static async getShopRatingSummary(shopId: string) {
    const result = await prisma.review.aggregate({
      where: { order: { shopId }, isPublished: true } as ReviewWhereClause,
      _avg: { shopRating: true, tailorRating: true, representativeRating: true },
      _count: true,
    });

    return {
      averageShopRating: result._avg.shopRating || 0,
      averageTailorRating: result._avg.tailorRating || 0,
      averageRepresentativeRating: result._avg.representativeRating || 0,
      totalReviews: result._count,
    };
  }

  private static async updateShopRating(shopId: string) {
    const avg = await prisma.review.aggregate({
      where: { order: { shopId }, isPublished: true } as ReviewWhereClause,
      _avg: { shopRating: true },
    });

    await prisma.shop.update({
      where: { id: shopId },
      data: { rating: avg._avg.shopRating || 0 },
    });
  }
}

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { LoyaltyService } from '../../services/LoyaltyService';
import { ApiError } from '../../utils/ApiError';

export class LoyaltyController {
  /** رصيد النقاط للعميل الحالي */
  static async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw ApiError.unauthorized();

      const balance = await LoyaltyService.getOrCreateBalance(customerId);
      const discountInfo = await LoyaltyService.calculateAvailableDiscount(customerId);

      res.json({
        success: true,
        data: {
          balance,
          availableDiscount: discountInfo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /** حساب الخصم المتاح من النقاط */
  static async calculateDiscount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw ApiError.unauthorized();

      const { maxPoints } = req.body;
      const discount = await LoyaltyService.calculateAvailableDiscount(customerId, maxPoints);

      res.json({ success: true, data: discount });
    } catch (error) {
      next(error);
    }
  }

  /** صرف نقاط (للعميل عند الطلب) */
  static async redeem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw ApiError.unauthorized();

      const { points, orderId } = req.body;
      const result = await LoyaltyService.redeemPoints(customerId, points, orderId);

      res.json({
        success: true,
        data: result,
        message: `تم صرف ${result.pointsRedeemed} نقطة مقابل خصم ${result.discountValue} ريال`,
      });
    } catch (error) {
      next(error);
    }
  }

  /** سجل المعاملات */
  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.id;
      if (!customerId) throw ApiError.unauthorized();

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await LoyaltyService.getTransactionHistory(customerId, page, limit);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  /** لوحة المتصدرين ( leaderboard ) */
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = req.query.shopId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;

      const leaderboard = await LoyaltyService.getLeaderboard(shopId, limit);
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /** إحصائيات الولاء للمحل (للتاجر) */
  static async getShopStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user?.shopId;
      if (!shopId) throw ApiError.forbidden('لا يوجد محل مرتبط');

      const stats = await LoyaltyService.getShopStats(shopId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /** منح نقاط يدوياً (للأدمن) */
  static async grantPoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { customerId, points, reason } = req.body;
      
      const balance = await LoyaltyService.getOrCreateBalance(customerId);
      await prisma.loyaltyBalance.update({
        where: { customerId },
        data: {
          points: { increment: points },
          lifetimePoints: { increment: points },
        },
      });

      // تسجيل المعاملة
      const { LoyaltyService: LS } = await import('../../services/LoyaltyService');
      await (LS as any).recordTransaction?.(customerId, 'MANUAL', points, null, reason || 'منح يدوي');

      res.json({
        success: true,
        data: { customerId, pointsGranted: points },
        message: `تم منح ${points} نقطة للعميل`,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Import prisma for the manual grant
import prisma from '../../config/database';

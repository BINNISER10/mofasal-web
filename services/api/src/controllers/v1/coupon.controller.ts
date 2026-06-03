import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { CouponService } from '../../services/CouponService';
import { ApiError } from '../../utils/ApiError';

export class CouponController {
  /** إنشاء كوبون جديد (للتاجر/الأدمن) */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user?.shopId;
      if (!shopId) throw ApiError.forbidden('لا يوجد محل مرتبط');

      const coupon = await CouponService.createCoupon({
        ...req.body,
        shopId,
      });
      res.status(201).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  }

  /** قائمة كوبونات المحل */
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user?.shopId;
      if (!shopId) throw ApiError.forbidden('لا يوجد محل مرتبط');

      const includeInactive = req.query.includeInactive === 'true';
      const coupons = await CouponService.listCoupons(shopId, includeInactive);
      res.json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  }

  /** تفعيل/تعطيل كوبون */
  static async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user?.shopId;
      if (!shopId) throw ApiError.forbidden('لا يوجد محل مرتبط');

      const { id } = req.params;
      const { isActive } = req.body;
      const coupon = await CouponService.toggleCoupon(id, shopId, isActive);
      res.json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  }

  /** إحصائيات الكوبون */
  static async stats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await CouponService.getCouponStats(id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /** تطبيق كوبون على طلب (للعميل) */
  static async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, order } = req.body;
      const result = await CouponService.applyCoupon(code, {
        ...order,
        customerId: req.user?.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** التحقق من صلاحية كوبون (للعميل - بدون تطبيق) */
  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, shopId, totalAmount, items } = req.body;
      const result = await CouponService.applyCoupon(code, {
        shopId,
        totalAmount,
        items,
      });
      res.json({
        success: true,
        data: {
          valid: true,
          discount: result.discount,
          finalAmount: result.finalAmount,
          coupon: {
            code: result.coupon.code,
            type: result.coupon.type,
            value: result.coupon.value,
          },
        },
      });
    } catch (error: any) {
      res.json({
        success: false,
        data: { valid: false, message: error.message || 'كوبون غير صالح' },
      });
    }
  }
}

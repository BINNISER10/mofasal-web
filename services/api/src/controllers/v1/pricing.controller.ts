import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { PricingService } from '../../services/PricingService';
import { ApiError } from '../../utils/ApiError';

export class PricingController {
  static async getTiers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const tiers = await PricingService.getTiers(shopId);
      sendSuccess(res, tiers);
    } catch (error) { next(error); }
  }

  static async createTier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const tier = await PricingService.createTier(shopId, req.body);
      sendCreated(res, tier, 'Pricing tier created');
    } catch (error) { next(error); }
  }

  static async updateTier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const tier = await PricingService.updateTier(req.params.id, shopId, req.body);
      sendSuccess(res, tier, 'Pricing tier updated');
    } catch (error) { next(error); }
  }

  static async deleteTier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const result = await PricingService.deleteTier(req.params.id, shopId);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}

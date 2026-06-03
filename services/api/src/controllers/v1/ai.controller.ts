import { Response, NextFunction } from 'express';
import { RecommendationService } from '../../services/RecommendationService';
import { MufasalOmniAI } from '../../services/ai.service';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

export class AIController {
  static async logBehavior(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const { actionType, actionData } = req.body;
      if (!actionType) throw ApiError.badRequest('actionType is required');
      await MufasalOmniAI.logBehavior(req.user?.shopId || '', userId, actionType, actionData || {});
      sendCreated(res, { queued: true }, 'Behavior event queued');
    } catch (error) { next(error); }
  }

  static async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const result = await RecommendationService.getRecommendations(userId, limit);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getSimilarProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const items = await RecommendationService.getSimilarProducts(req.params.productId, limit);
      sendSuccess(res, items);
    } catch (error) { next(error); }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.unauthorized();
      const profile = await RecommendationService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) { next(error); }
  }
}

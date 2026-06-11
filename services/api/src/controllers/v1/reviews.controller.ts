import { Response, NextFunction } from 'express';
import { ReviewService } from '../../services/ReviewService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class ReviewController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.createReview({ ...req.body, userId: req.user!.id });
      sendCreated(res, review, 'Review created');
    } catch (error) { next(error); }
  }

  static async getReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.getReview(req.params.orderId);
      sendSuccess(res, review);
    } catch (error) { next(error); }
  }

  static async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.updateReview(req.params.orderId, req.user!.id, req.body);
      sendSuccess(res, review, 'Review updated');
    } catch (error) { next(error); }
  }

  static async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ReviewService.deleteReview(req.params.orderId, req.user!.id);
      sendSuccess(res, result, 'Review deleted');
    } catch (error) { next(error); }
  }

  static async getShopReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await ReviewService.getShopReviews(req.params.shopId, page ? parseInt(page as string) : 1, limit ? parseInt(limit as string) : 20);
      sendPaginated(res, result.reviews, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getMyReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await ReviewService.getUserReviews(req.user!.id, page ? parseInt(page as string) : 1, limit ? parseInt(limit as string) : 20);
      sendPaginated(res, result.reviews, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }
}

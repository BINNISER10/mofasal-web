import { Response, NextFunction } from 'express';
import { ReportService } from '../../services/ReportService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

function resolveShopId(req: AuthRequest): string {
  const role = req.user?.role || '';
  const isPlatformAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const queryShopId = req.query.shopId as string | undefined;
  if (isPlatformAdmin && queryShopId) return queryShopId;
  if (req.user?.shopId) return req.user.shopId;
  if (isPlatformAdmin) {
    throw ApiError.badRequest('shopId query parameter required for admin reports');
  }
  throw ApiError.badRequest('No shop associated with this account');
}

function parseRange(req: AuthRequest) {
  const { startDate, endDate } = req.query;
  return {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  };
}

export class ReportController {
  static async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const overview = await ReportService.getOverview(shopId, parseRange(req));
      sendSuccess(res, overview);
    } catch (error) { next(error); }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const summary = await ReportService.getSummary(shopId, parseRange(req));
      sendSuccess(res, summary);
    } catch (error) { next(error); }
  }

  static async getSalesTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const granularity = req.query.granularity === 'month' ? 'month' : 'day';
      const trend = await ReportService.getSalesTrend(shopId, parseRange(req), granularity);
      sendSuccess(res, trend);
    } catch (error) { next(error); }
  }

  static async getTopProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const products = await ReportService.getTopProducts(shopId, parseRange(req), limit);
      sendSuccess(res, products);
    } catch (error) { next(error); }
  }

  static async getPaymentBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const breakdown = await ReportService.getPaymentBreakdown(shopId, parseRange(req));
      sendSuccess(res, breakdown);
    } catch (error) { next(error); }
  }
}

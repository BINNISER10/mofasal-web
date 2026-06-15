import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import { B2BService } from '../../services/B2BService';

export class B2BController {
  static async listMerchants(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchants = await B2BService.listFabricMerchants();
      sendSuccess(res, merchants);
    } catch (error) { next(error); }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await B2BService.listOrders({
        role: req.user!.role,
        shopId: req.user?.shopId,
        userId: req.user?.id,
        status: status as string | undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      sendPaginated(res, result.items, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await B2BService.getById(req.params.id);
      const role = req.user!.role;
      const shopId = req.user?.shopId;
      const canView =
        role === 'ADMIN' || role === 'SUPER_ADMIN'
        || shopId === order.merchantShopId
        || shopId === order.buyerShopId;
      if (!canView) throw ApiError.forbidden('Insufficient permissions');
      sendSuccess(res, order);
    } catch (error) { next(error); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.shopId) throw ApiError.forbidden('Shop context required');
      const order = await B2BService.create({
        buyerUserId: req.user.id,
        buyerShopId: req.user.shopId,
        merchantShopId: req.body.merchantShopId,
        items: req.body.items,
        deliveryTarget: req.body.deliveryTarget,
        deliveryAddress: req.body.deliveryAddress,
        linkedOrderId: req.body.linkedOrderId,
        notes: req.body.notes,
      });
      sendCreated(res, order, 'B2B fabric order created');
    } catch (error) { next(error); }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await B2BService.updateStatus(req.params.id, req.body.status, {
        role: req.user!.role,
        shopId: req.user?.shopId,
      });
      sendSuccess(res, order, 'Status updated');
    } catch (error) { next(error); }
  }
}

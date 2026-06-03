import { Response, NextFunction } from 'express';
import { OrderService } from '../../services/OrderService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class OrderController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder({ ...req.body, customerId: undefined, userId: req.user!.id });
      sendCreated(res, order, 'Order created');
    } catch (error) { next(error); }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      // العميل يرى طلباته فقط؛ صاحب المحل/الخياط يرى طلبات محله
      const isShopMember = ['TAILOR', 'TAILOR_SHOP', 'MERCHANT', 'ADMIN', 'SUPER_ADMIN'].includes(req.user?.role || '');
      const result = await OrderService.getOrders({
        shopId: isShopMember ? req.user?.shopId : undefined,
        userId: isShopMember ? undefined : req.user?.id,
        status: status as string, search: search as string,
        page: page ? parseInt(page as string) : 1, limit: limit ? parseInt(limit as string) : 20,
      });
      sendPaginated(res, result.orders, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      sendSuccess(res, order);
    } catch (error) { next(error); }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.updateOrderStatus(req.params.id, req.body.status, req.user!.id, req.body.note);
      sendSuccess(res, order, 'Status updated');
    } catch (error) { next(error); }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await OrderService.getOrderStats(req.user?.shopId);
      sendSuccess(res, stats);
    } catch (error) { next(error); }
  }

  static async getTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tracking = await OrderService.getOrderTracking(req.params.id);
      sendSuccess(res, tracking);
    } catch (error) { next(error); }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.cancelOrder(req.params.id, req.user!.id);
      sendSuccess(res, order, 'Order cancelled');
    } catch (error) { next(error); }
  }
}

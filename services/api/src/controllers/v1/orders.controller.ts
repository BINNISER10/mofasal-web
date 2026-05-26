import { Response, NextFunction } from 'express';
import { OrderService } from '../../services/OrderService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class OrderController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder({ ...req.body, customerId: req.body.customerId });
      sendCreated(res, order, 'Order created');
    } catch (error) { next(error); }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await OrderService.getOrders({
        shopId: req.user?.shopId,
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
}

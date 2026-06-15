import { Response, NextFunction } from 'express';
import { OrderService } from '../../services/OrderService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

const SHOP_STAFF_ROLES = ['TAILOR', 'TAILOR_SHOP', 'MERCHANT', 'REPRESENTATIVE'];
const PLATFORM_ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

function resolveOrderScope(req: AuthRequest, queryShopId?: string) {
  const role = req.user?.role || '';
  if (role === 'CUSTOMER') {
    return { userId: req.user!.id, shopId: undefined as string | undefined };
  }
  if (SHOP_STAFF_ROLES.includes(role)) {
    if (!req.user?.shopId) throw ApiError.forbidden('Shop context required');
    return { shopId: req.user.shopId, userId: undefined as string | undefined };
  }
  if (PLATFORM_ADMIN_ROLES.includes(role)) {
    return { shopId: queryShopId, userId: undefined as string | undefined };
  }
  return { userId: req.user?.id, shopId: undefined as string | undefined };
}

export class OrderController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder({ ...req.body, customerId: undefined, userId: req.user!.id });
      sendCreated(res, order, 'Order created');
    } catch (error) { next(error); }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit, shopId } = req.query;
      const scope = resolveOrderScope(req, shopId as string | undefined);
      const result = await OrderService.getOrders({
        shopId: scope.shopId,
        userId: scope.userId,
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

  static async getConfirmation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const confirmation = await OrderService.getConfirmationByToken(req.params.token);
      sendSuccess(res, confirmation);
    } catch (error) { next(error); }
  }

  static async approveConfirmation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.approveConfirmation(req.params.token);
      sendSuccess(res, result, 'Order approved');
    } catch (error) { next(error); }
  }

  static async requestChanges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.requestConfirmationChanges(req.params.token, req.body.notes);
      sendSuccess(res, result, 'Change request sent');
    } catch (error) { next(error); }
  }
}

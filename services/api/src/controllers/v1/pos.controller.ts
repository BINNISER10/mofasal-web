import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { POSService } from '../../services/POSService';

export class POSController {
  static async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { category, search } = req.query;
      const products = await POSService.getProducts(shopId, {
        category: category as string | undefined,
        search: search as string | undefined,
      });
      sendSuccess(res, products);
    } catch (error) { next(error); }
  }

  static async openSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const session = await POSService.openSession(shopId, req.user!.id, req.body.openingBalance || 0);
      sendCreated(res, session, 'POS session opened');
    } catch (error) { next(error); }
  }

  static async closeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await POSService.closeSession(req.params.id, req.body.closingBalance);
      sendSuccess(res, session, 'POS session closed');
    } catch (error) { next(error); }
  }

  static async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { page, limit } = req.query;
      const result = await POSService.getSessions(shopId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await POSService.getSession(req.params.id);
      sendSuccess(res, session);
    } catch (error) { next(error); }
  }

  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await POSService.createOrder(req.params.sessionId, req.body);
      sendCreated(res, order, 'POS order created');
    } catch (error) { next(error); }
  }

  static async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await POSService.getOrders(req.params.sessionId);
      sendSuccess(res, orders);
    } catch (error) { next(error); }
  }
}

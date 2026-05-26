import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ProcurementService } from '../../services/ProcurementService';

export class ProcurementController {
  static async getPurchaseOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { page, limit } = req.query;
      const result = await ProcurementService.getPurchaseOrders(shopId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getPurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ProcurementService.getPurchaseOrder(req.params.id);
      sendSuccess(res, order);
    } catch (error) { next(error); }
  }

  static async createPurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, shopId: req.user!.shopId!, createdById: req.user!.id };
      const order = await ProcurementService.createPurchaseOrder(data);
      sendCreated(res, order, 'Purchase order created');
    } catch (error) { next(error); }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ProcurementService.updatePurchaseOrderStatus(req.params.id, req.body.status);
      sendSuccess(res, order, 'Purchase order status updated');
    } catch (error) { next(error); }
  }

  static async deletePurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProcurementService.deletePurchaseOrder(req.params.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}

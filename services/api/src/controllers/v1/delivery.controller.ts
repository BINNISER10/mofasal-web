import { Response, NextFunction } from 'express';
import { DeliveryService } from '../../services/DeliveryService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';

export class DeliveryController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const delivery = await DeliveryService.createDeliveryRequest(req.body.orderId, req.body.provider);
      sendCreated(res, delivery, 'Delivery request created');
    } catch (error) { next(error); }
  }

  static async getByOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const delivery = await DeliveryService.getDeliveryRequest(req.params.orderId);
      sendSuccess(res, delivery);
    } catch (error) { next(error); }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, lat, lng, driverName, driverPhone, trackingUrl } = req.body;
      const delivery = await DeliveryService.updateDeliveryStatus(req.params.id, status, { lat, lng, driverName, driverPhone, trackingUrl });
      sendSuccess(res, delivery, 'Delivery status updated');
    } catch (error) { next(error); }
  }

  static async addTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const point = await DeliveryService.addTrackingPoint(req.params.id, req.body);
      sendSuccess(res, point, 'Tracking point added');
    } catch (error) { next(error); }
  }

  static async getTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tracking = await DeliveryService.getDeliveryTracking(req.params.id);
      sendSuccess(res, tracking);
    } catch (error) { next(error); }
  }
}

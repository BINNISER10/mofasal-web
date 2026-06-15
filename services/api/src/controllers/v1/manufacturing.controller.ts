import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import { ManufacturingService } from '../../services/ManufacturingService';
import { ApiError } from '../../utils/ApiError';

export class ManufacturingController {
  static async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const tasks = await ManufacturingService.getTasks(shopId);
      sendSuccess(res, tasks);
    } catch (error) { next(error); }
  }

  static async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const order = await ManufacturingService.updateTaskStatus(req.params.id, shopId, req.body.status);
      sendSuccess(res, order, 'Task updated');
    } catch (error) { next(error); }
  }
}

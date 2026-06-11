import { Response, NextFunction } from 'express';
import { NotificationService } from '../../services/NotificationService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, unreadOnly } = req.query;
      const result = await NotificationService.getNotifications(
        req.user!.id,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20,
        unreadOnly === 'true'
      );
      sendPaginated(res, result.notifications, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
      sendSuccess(res, notification, 'Marked as read');
    } catch (error) { next(error); }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.deleteNotification(req.params.id, req.user!.id);
      sendSuccess(res, result, 'Notification deleted');
    } catch (error) { next(error); }
  }
}

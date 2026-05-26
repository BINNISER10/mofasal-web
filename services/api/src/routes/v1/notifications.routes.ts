import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { NotificationController } from '../../controllers/v1/notifications.controller';

const router = Router();

router.get('/', authenticate, NotificationController.getAll);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.patch('/read-all', authenticate, NotificationController.markAllAsRead);
router.delete('/:id', authenticate, NotificationController.delete);

export default router;

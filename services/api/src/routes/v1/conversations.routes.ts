import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { ConversationController } from '../../controllers/v1/conversations.controller';

const router = Router();

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
  mediaUrl: z.string().optional(),
});

router.get('/order/:orderId', authenticate, ConversationController.getByOrder);
router.post('/order/:orderId/message', authenticate, validate(messageSchema), ConversationController.sendMessage);
router.get('/:id/messages', authenticate, ConversationController.getMessages);
router.patch('/messages/:messageId/read', authenticate, ConversationController.markAsRead);

export default router;

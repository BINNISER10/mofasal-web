import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { AIController } from '../../controllers/v1/ai.controller';

const router = Router();

const behaviorSchema = z.object({
  actionType: z.string().min(1),
  actionData: z.record(z.any()).optional(),
});

router.post('/behavior', authenticate, validate(behaviorSchema), AIController.logBehavior);
router.get('/recommendations', authenticate, AIController.getRecommendations);
router.get('/profile', authenticate, AIController.getProfile);
router.get('/similar/:productId', optionalAuth, AIController.getSimilarProducts);

export default router;

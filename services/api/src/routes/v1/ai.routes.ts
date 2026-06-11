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

const askSchema = z.object({
  question: z.string().min(1, 'السؤال مطلوب').max(1000),
  context: z.object({
    currentProduct: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      categoryId: z.string().optional(),
    }).optional(),
    currentShop: z.object({
      id: z.string(),
      name: z.string(),
    }).optional(),
  }).optional(),
});

const sentimentSchema = z.object({
  text: z.string().min(1).max(5000),
});

// Existing routes
router.post('/behavior', authenticate, validate(behaviorSchema), AIController.logBehavior);
router.get('/recommendations', authenticate, AIController.getRecommendations);
router.get('/profile', authenticate, AIController.getProfile);
router.get('/similar/:productId', optionalAuth, AIController.getSimilarProducts);

// New AI routes
router.post('/ask', optionalAuth, validate(askSchema), AIController.askAdvisor);
router.get('/trending', optionalAuth, AIController.getTrending);
router.get('/shops', authenticate, AIController.getShopRecommendations);
router.post('/sentiment', authenticate, validate(sentimentSchema), AIController.analyzeSentiment);
router.get('/health', AIController.healthCheck);

export default router;

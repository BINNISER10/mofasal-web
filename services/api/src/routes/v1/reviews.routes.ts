import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { ReviewController } from '../../controllers/v1/reviews.controller';

const router = Router();

const createSchema = z.object({
  orderId: z.string().uuid(),
  shopRating: z.number().int().min(1).max(5).optional(),
  tailorRating: z.number().int().min(1).max(5).optional(),
  representativeRating: z.number().int().min(1).max(5).optional(),
  shopReview: z.string().max(1000).optional(),
  tailorReview: z.string().max(1000).optional(),
  representativeReview: z.string().max(1000).optional(),
});

router.post('/', authenticate, validate(createSchema), ReviewController.create);
router.get('/order/:orderId', authenticate, ReviewController.getReview);
router.put('/order/:orderId', authenticate, ReviewController.updateReview);
router.delete('/order/:orderId', authenticate, ReviewController.deleteReview);
router.get('/shop/:shopId', ReviewController.getShopReviews);
router.get('/my/reviews', authenticate, ReviewController.getMyReviews);

export default router;

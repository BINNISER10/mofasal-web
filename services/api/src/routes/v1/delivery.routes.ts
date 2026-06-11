import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { DeliveryController } from '../../controllers/v1/delivery.controller';

const router = Router();

const createSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(['SHOP_VEHICLE', 'UBER', 'CAREEN', 'JEENY', 'SMSA', 'ARAMEX']).optional(),
});

const statusSchema = z.object({
  status: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  trackingUrl: z.string().optional(),
});

const trackingSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  status: z.string().optional(),
});

router.post('/', authenticate, authorize('TAILOR_SHOP', 'STAFF', 'ADMIN'), validate(createSchema), DeliveryController.create);
router.get('/order/:orderId', authenticate, DeliveryController.getByOrder);
router.patch('/:id/status', authenticate, authorize('TAILOR_SHOP', 'STAFF', 'ADMIN', 'SUPER_ADMIN'), validate(statusSchema), DeliveryController.updateStatus);
router.post('/:id/tracking', authenticate, authorize('TAILOR_SHOP', 'STAFF', 'ADMIN'), validate(trackingSchema), DeliveryController.addTracking);
router.get('/:id/tracking', authenticate, DeliveryController.getTracking);

export default router;

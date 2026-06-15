import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { B2BController } from '../../controllers/v1/b2b.controller';

const router = Router();

const createSchema = z.object({
  merchantShopId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
  })).min(1),
  deliveryTarget: z.enum(['TAILOR_SHOP', 'CUSTOMER_HOME']).optional(),
  deliveryAddress: z.object({
    label: z.string().optional(),
    street: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  linkedOrderId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'ON_WAY', 'DELIVERED', 'CANCELLED']),
});

router.use(
  authenticate,
  authorize('MERCHANT', 'TAILOR', 'TAILOR_SHOP', 'ADMIN', 'SUPER_ADMIN'),
  requirePermission('b2b'),
);

router.get('/merchants', B2BController.listMerchants);
router.get('/', B2BController.list);
router.get('/:id', B2BController.getById);
router.post('/', authorize('TAILOR', 'TAILOR_SHOP', 'ADMIN', 'SUPER_ADMIN'), validate(createSchema), B2BController.create);
router.patch('/:id/status', validate(statusSchema), B2BController.updateStatus);

export default router;

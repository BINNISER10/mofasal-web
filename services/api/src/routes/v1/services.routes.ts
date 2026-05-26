import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { ServiceRequestController } from '../../controllers/v1/services.controller';

const router = Router();

const createSchema = z.object({
  shopId: z.string().uuid(),
  serviceType: z.enum(['TAILORING', 'ALTERATION', 'DESIGN_CONSULTATION', 'FABRIC_SALE', 'READY_MADE', 'CHILDREN_WEAR']),
  locationType: z.enum(['DELIVERY', 'PICKUP', 'SHOP_VISIT']).optional(),
  addressId: z.string().uuid().optional(),
  customAddress: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

router.post('/', authenticate, validate(createSchema), ServiceRequestController.create);
router.get('/', authenticate, ServiceRequestController.getAll);
router.get('/:id', authenticate, ServiceRequestController.getById);
router.put('/:id', authenticate, ServiceRequestController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ServiceRequestController.delete);

export default router;

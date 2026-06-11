import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { ServiceRequestController } from '../../controllers/v1/services.controller';

const router = Router();

const createSchema = z.object({
  shopId: z.string().uuid(),
  serviceType: z.enum([
    'TAILORING', 'ALTERATION', 'DESIGN_CONSULTATION', 'FABRIC_SALE', 'READY_MADE',
    'CHILDREN_WEAR', 'ON_SITE_MEASUREMENT', 'IN_SHOP_MEASUREMENT', 'CONSULTATION',
  ]),
  locationType: z.enum(['DELIVERY', 'PICKUP', 'SHOP_VISIT', 'HOME', 'WORK', 'OTHER']).optional(),
  addressId: z.string().uuid().optional(),
  customAddress: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  scheduledDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

router.post('/', authenticate, validate(createSchema), ServiceRequestController.create);
router.get('/', authenticate, ServiceRequestController.getAll);
router.get('/:id', authenticate, ServiceRequestController.getById);
router.get('/:id/tracking', authenticate, ServiceRequestController.tracking);
router.post('/:id/dispatch', authenticate, ServiceRequestController.dispatch);
router.patch('/:id/location', authenticate, validate(locationSchema), ServiceRequestController.updateLocation);
router.patch('/:id/arrive', authenticate, ServiceRequestController.arrive);
router.put('/:id', authenticate, ServiceRequestController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ServiceRequestController.delete);

export default router;

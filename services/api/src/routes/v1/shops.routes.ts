import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { ShopController } from '../../controllers/v1/shops.controller';

const router = Router();

const createShopSchema = z.object({
  name: z.string().min(2).max(100),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
});

const serviceSchema = z.object({
  serviceType: z.enum(['TAILORING', 'ALTERATION', 'DESIGN_CONSULTATION', 'FABRIC_SALE', 'READY_MADE', 'CHILDREN_WEAR']),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive().optional(),
});

const vehicleSchema = z.object({
  plateNumber: z.string().min(1),
  model: z.string().optional(),
  color: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
});

router.get('/', optionalAuth, ShopController.getShops);
router.get('/:id', ShopController.getShop);
router.post('/', authenticate, authorize('TAILOR', 'TAILOR_SHOP', 'ADMIN'), validate(createShopSchema), ShopController.createShop);
router.put('/:id', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.updateShop);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ShopController.deleteShop);
router.patch('/:id/toggle-open', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.toggleOpenStatus);
router.get('/:id/stats', authenticate, ShopController.getShopStats);

router.get('/:shopId/services', ShopController.getServices);
router.post('/:shopId/services', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), validate(serviceSchema), ShopController.createService);
router.put('/:shopId/services/:serviceId', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.updateService);
router.delete('/:shopId/services/:serviceId', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.deleteService);

router.get('/:shopId/vehicles', authenticate, ShopController.getVehicles);
router.post('/:shopId/vehicles', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), validate(vehicleSchema), ShopController.createVehicle);
router.put('/:shopId/vehicles/:vehicleId', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.updateVehicle);
router.delete('/:shopId/vehicles/:vehicleId', authenticate, authorize('TAILOR_SHOP', 'ADMIN'), ShopController.deleteVehicle);

export default router;

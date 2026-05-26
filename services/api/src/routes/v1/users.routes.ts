import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserController } from '../../controllers/v1/users.controller';

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['CUSTOMER', 'TAILOR', 'TAILOR_SHOP', 'MERCHANT', 'ADMIN', 'STAFF', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  avatar: z.string().optional(),
});

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1),
  district: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  country: z.string().optional(),
  buildingNumber: z.string().optional(),
  apartmentNumber: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().optional(),
});

const measurementSchema = z.object({
  name: z.string().min(1),
  data: z.record(z.any()),
});

router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), UserController.getUsers);
router.get('/:id', authenticate, UserController.getUser);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), UserController.deleteUser);

router.get('/:id/addresses', authenticate, UserController.getAddresses);
router.post('/:id/addresses', authenticate, validate(addressSchema), UserController.createAddress);
router.put('/:id/addresses/:addressId', authenticate, validate(addressSchema.partial()), UserController.updateAddress);
router.delete('/:id/addresses/:addressId', authenticate, UserController.deleteAddress);

router.get('/:id/measurements', authenticate, UserController.getMeasurements);
router.post('/:id/measurements', authenticate, validate(measurementSchema), UserController.createMeasurement);
router.put('/:id/measurements/:measurementId', authenticate, UserController.updateMeasurement);
router.delete('/:id/measurements/:measurementId', authenticate, UserController.deleteMeasurement);

export default router;

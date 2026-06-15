import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { OrderController } from '../../controllers/v1/orders.controller';

const router = Router();

const deliveryAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1),
  district: z.string().optional(),
  city: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const createOrderSchema = z.object({
  shopId: z.string().uuid(),
  serviceRequestId: z.string().uuid().optional(),
  totalAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  customerNotes: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  deliveryAddress: deliveryAddressSchema.optional(),
  measurements: z.record(z.string(), z.number()).optional(),
  fabricId: z.string().uuid().optional(),
  fabricSource: z.enum(['shop', 'marketplace']).optional(),
  paymentMethod: z.enum(['MADA', 'VISA_MASTERCARD', 'APPLE_PAY', 'STC_PAY', 'TAMARA', 'TABBY', 'SADAD', 'CASH']).optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })).optional(),
});

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'STAFF_ON_WAY', 'TAKING_MEASUREMENTS',
  'IN_PROGRESS', 'CUTTING_FABRIC', 'SEWING_ASSEMBLY', 'IRONING_FINISHING',
  'PACKING_WRAPPING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED',
] as const;

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().optional(),
});

router.post('/', authenticate, validate(createOrderSchema), OrderController.create);
router.get('/', authenticate, OrderController.getAll);
router.get('/stats', authenticate, OrderController.getStats);
router.get('/:id', authenticate, OrderController.getById);
router.get('/:id/tracking', authenticate, OrderController.getTracking);
router.patch('/:id/status', authenticate, validate(statusSchema), OrderController.updateStatus);
router.post('/:id/cancel', authenticate, OrderController.cancel);

// Confirmation endpoints (public - uses token)
router.get('/confirm/:token', OrderController.getConfirmation);
router.post('/confirm/:token/approve', OrderController.approveConfirmation);
router.post('/confirm/:token/changes', OrderController.requestChanges);

export default router;

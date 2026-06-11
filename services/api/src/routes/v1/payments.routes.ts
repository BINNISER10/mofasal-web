import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { PaymentController } from '../../controllers/v1/payments.controller';

const router = Router();

const processSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['MADA', 'VISA_MASTERCARD', 'APPLE_PAY', 'STC_PAY', 'TAMARA', 'TABBY', 'SADAD', 'CASH']),
  amount: z.number().positive(),
  gatewayData: z.any().optional(),
});

const refundSchema = z.object({
  amount: z.number().positive().optional(),
});

router.post('/process', authenticate, validate(processSchema), PaymentController.processPayment);
router.get('/transactions/:orderId', authenticate, PaymentController.getTransactions);
router.get('/transaction/:id', authenticate, PaymentController.getTransaction);
router.post('/refund/:transactionId', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP'), validate(refundSchema), PaymentController.refund);
router.post('/webhook/:method', PaymentController.handleWebhook);
router.post('/invoice/generate/:orderId', authenticate, authorize('TAILOR_SHOP', 'STAFF', 'ADMIN'), PaymentController.generateInvoice);

export default router;

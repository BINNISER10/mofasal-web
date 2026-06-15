import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { POSController } from '../../controllers/v1/pos.controller';

const router = Router();

// POS is for shop staff/owners and merchants only.
router.use(authenticate, requirePermission('pos'));

router.get('/products', POSController.getProducts);
router.post('/sessions', authenticate, POSController.openSession);
router.post('/sessions/:id/close', authenticate, POSController.closeSession);
router.get('/sessions', authenticate, POSController.getSessions);
router.get('/sessions/:id', authenticate, POSController.getSession);
router.post('/sessions/:sessionId/orders', authenticate, POSController.createOrder);
router.get('/sessions/:sessionId/orders', authenticate, POSController.getOrders);

export default router;

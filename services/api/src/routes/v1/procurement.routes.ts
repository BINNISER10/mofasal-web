import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { ProcurementController } from '../../controllers/v1/procurement.controller';

const router = Router();

// Procurement is management-only; customers/representatives are blocked.
router.use(authenticate, requirePermission('procurement'));

router.get('/', authenticate, ProcurementController.getPurchaseOrders);
router.get('/:id', authenticate, ProcurementController.getPurchaseOrder);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP'), ProcurementController.createPurchaseOrder);
router.put('/:id/status', authenticate, ProcurementController.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ProcurementController.deletePurchaseOrder);

export default router;

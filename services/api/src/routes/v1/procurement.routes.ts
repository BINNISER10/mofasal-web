import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { ProcurementController } from '../../controllers/v1/procurement.controller';

const router = Router();

router.get('/', authenticate, ProcurementController.getPurchaseOrders);
router.get('/:id', authenticate, ProcurementController.getPurchaseOrder);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP'), ProcurementController.createPurchaseOrder);
router.put('/:id/status', authenticate, ProcurementController.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ProcurementController.deletePurchaseOrder);

export default router;

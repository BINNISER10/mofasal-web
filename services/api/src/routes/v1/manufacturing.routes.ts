import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { ManufacturingController } from '../../controllers/v1/manufacturing.controller';

const router = Router();

router.use(authenticate, authorize('TAILOR_SHOP', 'TAILOR', 'ADMIN', 'SUPER_ADMIN'), requirePermission('manufacturing'));

router.get('/tasks', ManufacturingController.getTasks);
router.patch('/tasks/:id', ManufacturingController.updateTask);

export default router;

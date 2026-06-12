import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { RoleController } from '../../controllers/v1/role.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP'), requirePermission('roles'));

router.get('/', RoleController.getRoles);
router.get('/:id', RoleController.getRole);
router.post('/', RoleController.createRole);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

export default router;

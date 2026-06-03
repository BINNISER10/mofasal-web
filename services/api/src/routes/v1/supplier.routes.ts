import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { SupplierController } from '../../controllers/v1/supplier.controller';

const router = Router();

// Supplier management is restricted to roles with the suppliers/procurement permission.
router.use(authenticate, requirePermission('suppliers', 'procurement'));

router.get('/', authenticate, SupplierController.getSuppliers);
router.get('/:id', authenticate, SupplierController.getSupplier);
router.post('/', authenticate, SupplierController.createSupplier);
router.put('/:id', authenticate, SupplierController.updateSupplier);
router.delete('/:id', authenticate, SupplierController.deleteSupplier);
router.post('/:id/products', authenticate, SupplierController.addProduct);
router.delete('/:id/products/:productId', authenticate, SupplierController.removeProduct);

export default router;

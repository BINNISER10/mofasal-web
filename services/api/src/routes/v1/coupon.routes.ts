import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { CouponController } from '../../controllers/v1/coupon.controller';

const router = Router();

// ─── Public: التحقق من صلاحية كوبون (للعميل قبل الطلب) ───
router.post('/validate', CouponController.validate);

// ─── Protected (Admin/Shop): إدارة الكوبونات ───
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP', 'MERCHANT'), requirePermission('settings'));

router.post('/', CouponController.create);
router.get('/', CouponController.list);
router.patch('/:id/toggle', CouponController.toggle);
router.get('/:id/stats', CouponController.stats);

// ─── Protected (Customer): تطبيق كوبون على طلب ───
router.post('/apply', authenticate, CouponController.apply);

export default router;

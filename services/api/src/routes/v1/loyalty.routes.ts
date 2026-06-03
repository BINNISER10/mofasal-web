import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { LoyaltyController } from '../../controllers/v1/loyalty.controller';

const router = Router();

// ─── Public: لوحة المتصدرين ───
router.get('/leaderboard', LoyaltyController.getLeaderboard);

// ─── Protected (Customer): إدارة النقاط ───
router.use('/me', authenticate);
router.get('/me/balance', authenticate, LoyaltyController.getBalance);
router.post('/me/calculate', authenticate, LoyaltyController.calculateDiscount);
router.post('/me/redeem', authenticate, LoyaltyController.redeem);
router.get('/me/history', authenticate, LoyaltyController.getHistory);

// ─── Protected (Admin/Shop): إدارة الولاء ───
router.use('/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP', 'MERCHANT'), requirePermission('settings'));
router.get('/admin/stats', LoyaltyController.getShopStats);
router.post('/admin/grant', LoyaltyController.grantPoints);

export default router;

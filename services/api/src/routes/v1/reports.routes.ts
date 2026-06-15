import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { ReportController } from '../../controllers/v1/reports.controller';

const router = Router();

router.use(authenticate, authorize('TAILOR', 'TAILOR_SHOP', 'MERCHANT', 'STAFF', 'ADMIN', 'SUPER_ADMIN'), requirePermission('reports'));

router.get('/overview', ReportController.getOverview);
router.get('/summary', ReportController.getSummary);
router.get('/sales-trend', ReportController.getSalesTrend);
router.get('/top-products', ReportController.getTopProducts);
router.get('/payments', ReportController.getPaymentBreakdown);

export default router;

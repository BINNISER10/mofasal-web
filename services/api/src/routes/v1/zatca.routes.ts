import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { ZatcaController } from '../../controllers/v1/zatca.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'TAILOR_SHOP'));

router.post('/generate-invoice/:invoiceId', ZatcaController.generateInvoice);
router.post('/report/:invoiceId', ZatcaController.reportInvoice);
router.post('/clear/:invoiceId', ZatcaController.clearInvoice);
router.get('/status/:invoiceId', ZatcaController.getInvoiceStatus);
router.get('/compliance-status', ZatcaController.getComplianceStatus);
router.get('/qr/:invoiceId', ZatcaController.getQrCode);

export default router;

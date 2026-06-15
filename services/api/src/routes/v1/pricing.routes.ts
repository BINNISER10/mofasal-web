import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { PricingController } from '../../controllers/v1/pricing.controller';

const router = Router();

router.use(authenticate, authorize('MERCHANT', 'TAILOR', 'TAILOR_SHOP', 'ADMIN', 'SUPER_ADMIN'), requirePermission('b2b'));

router.get('/tiers', PricingController.getTiers);
router.post('/tiers', PricingController.createTier);
router.put('/tiers/:id', PricingController.updateTier);
router.delete('/tiers/:id', PricingController.deleteTier);

export default router;

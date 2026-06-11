import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, requirePermission } from '../../middleware/auth';
import { AccountingController } from '../../controllers/v1/accounting.controller';

const router = Router();

const entrySchema = z.object({
  description: z.string().min(1),
  date: z.string().optional(),
  shopId: z.string().uuid().optional(),
  lines: z.array(z.object({
    accountCode: z.string().min(1),
    debit: z.number().min(0).optional(),
    credit: z.number().min(0).optional(),
  })).min(2),
});

router.use(authenticate, authorize('TAILOR_SHOP', 'MERCHANT', 'ADMIN', 'SUPER_ADMIN'), requirePermission('accounting'));

router.get('/accounts', AccountingController.getAccounts);
router.post('/accounts/seed', AccountingController.seedAccounts);
router.get('/journal', AccountingController.getJournal);
router.post('/journal', validate(entrySchema), AccountingController.postEntry);
router.get('/trial-balance', AccountingController.getTrialBalance);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { AdminController } from '../../controllers/v1/admin.controller';

const router = Router();

const configSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().optional(),
  label: z.string().optional(),
  labelAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  dependsOn: z.string().optional(),
  dependsValue: z.string().optional(),
});

const moduleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  isEnabled: z.boolean().optional(),
  parentModuleKey: z.string().optional(),
  order: z.number().int().optional(),
});

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.put('/users/:id/status', AdminController.updateUserStatus);

router.get('/config', AdminController.getConfigs);
router.get('/config/:key', AdminController.getConfig);
router.put('/config/:key', validate(configSchema), AdminController.updateConfig);
router.delete('/config/:key', AdminController.deleteConfig);
router.patch('/config/:key/toggle', AdminController.toggleConfig);

router.get('/modules', AdminController.getModules);
router.post('/modules', validate(moduleSchema), AdminController.createModule);
router.put('/modules/:key', AdminController.updateModule);
router.patch('/modules/:key/toggle', AdminController.toggleModule);

router.get('/reports/orders', AdminController.getOrderReports);
router.get('/reports/revenue', AdminController.getRevenueReports);
router.get('/reports/shops', AdminController.getShopReports);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;

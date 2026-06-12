import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { RoleService } from '../../services/RoleService';
import { ApiError } from '../../utils/ApiError';

export class RoleController {
  static async getRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
        ? (req.query.shopId as string) || req.user!.shopId
        : req.user!.shopId;
      const roles = await RoleService.getRoles(shopId || undefined);
      sendSuccess(res, roles);
    } catch (error) { next(error); }
  }

  static async getRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.getRole(req.params.id);
      sendSuccess(res, role);
    } catch (error) { next(error); }
  }

  static async createRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId;
      if (!shopId) throw ApiError.badRequest('Shop context required');
      const role = await RoleService.createRole(shopId, req.body);
      sendCreated(res, role, 'Role created');
    } catch (error) { next(error); }
  }

  static async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.updateRole(req.params.id, req.body);
      sendSuccess(res, role, 'Role updated');
    } catch (error) { next(error); }
  }

  static async deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await RoleService.deleteRole(req.params.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}

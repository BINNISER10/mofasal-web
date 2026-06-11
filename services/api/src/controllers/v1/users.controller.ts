import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/UserService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendPaginated, sendCreated } from '../../utils/response';

export class UserController {
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, status, search, page, limit } = req.query;
      const result = await UserService.getUsers({
        role: role as string, status: status as string, search: search as string,
        page: page ? parseInt(page as string) : 1, limit: limit ? parseInt(limit as string) : 20,
      });
      sendPaginated(res, result.users, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id);
      sendSuccess(res, user);
    } catch (error) { next(error); }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      sendSuccess(res, user, 'User updated');
    } catch (error) { next(error); }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      sendSuccess(res, result, 'User deactivated');
    } catch (error) { next(error); }
  }

  static async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const addresses = await UserService.getAddresses(userId);
      sendSuccess(res, addresses);
    } catch (error) { next(error); }
  }

  static async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const address = await UserService.createAddress(userId, req.body);
      sendCreated(res, address, 'Address created');
    } catch (error) { next(error); }
  }

  static async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const address = await UserService.updateAddress(userId, req.params.addressId, req.body);
      sendSuccess(res, address, 'Address updated');
    } catch (error) { next(error); }
  }

  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const result = await UserService.deleteAddress(userId, req.params.addressId);
      sendSuccess(res, result, 'Address deleted');
    } catch (error) { next(error); }
  }

  static async getMeasurements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const measurements = await UserService.getMeasurements(userId);
      sendSuccess(res, measurements);
    } catch (error) { next(error); }
  }

  static async createMeasurement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const measurement = await UserService.createMeasurement(userId, req.body);
      sendCreated(res, measurement, 'Measurement created');
    } catch (error) { next(error); }
  }

  static async updateMeasurement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const measurement = await UserService.updateMeasurement(userId, req.params.measurementId, req.body);
      sendSuccess(res, measurement, 'Measurement updated');
    } catch (error) { next(error); }
  }

  static async deleteMeasurement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user!.id;
      const result = await UserService.deleteMeasurement(userId, req.params.measurementId);
      sendSuccess(res, result, 'Measurement deleted');
    } catch (error) { next(error); }
  }
}

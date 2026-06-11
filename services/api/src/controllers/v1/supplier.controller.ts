import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { SupplierService } from '../../services/SupplierService';

export class SupplierController {
  static async getSuppliers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { page, limit } = req.query;
      const result = await SupplierService.getSuppliers(shopId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getSupplier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.getSupplier(req.params.id);
      sendSuccess(res, supplier);
    } catch (error) { next(error); }
  }

  static async createSupplier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.createSupplier({ ...req.body, shopId: req.user!.shopId! });
      sendCreated(res, supplier, 'Supplier created');
    } catch (error) { next(error); }
  }

  static async updateSupplier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
      sendSuccess(res, supplier, 'Supplier updated');
    } catch (error) { next(error); }
  }

  static async deleteSupplier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupplierService.deleteSupplier(req.params.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async addProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupplierService.addProduct(req.params.id, req.body);
      sendCreated(res, result, 'Product added to supplier');
    } catch (error) { next(error); }
  }

  static async removeProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupplierService.removeProduct(req.params.productId);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}

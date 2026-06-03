import { Request, Response, NextFunction } from 'express';
import { ShopService } from '../../services/ShopService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class ShopController {
  static async createShop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shop = await ShopService.createShop({ ...req.body, ownerId: req.user!.id });
      sendCreated(res, shop, 'Shop created');
    } catch (error) { next(error); }
  }

  static async getShops(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, city, region, serviceType, minRating, lat, lng, maxDistance, search, isOpen, sort } = req.query;
      const allowedSort = ['smart', 'rating', 'distance', 'popular', 'newest'];
      const result = await ShopService.getShops({
        page: page ? parseInt(page as string) : 1, limit: limit ? parseInt(limit as string) : 20,
        city: city as string, region: region as string, serviceType: serviceType as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        lat: lat ? parseFloat(lat as string) : undefined, lng: lng ? parseFloat(lng as string) : undefined,
        maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
        search: search as string, isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
        sort: allowedSort.includes(sort as string) ? (sort as any) : undefined,
      });
      sendPaginated(res, result.shops, result.total, result.page, result.limit);
    } catch (error) { next(error); }
  }

  static async getShop(req: Request, res: Response, next: NextFunction) {
    try {
      const shop = await ShopService.getShopById(req.params.id);
      sendSuccess(res, shop);
    } catch (error) { next(error); }
  }

  static async updateShop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shop = await ShopService.updateShop(req.params.id, req.body);
      sendSuccess(res, shop, 'Shop updated');
    } catch (error) { next(error); }
  }

  static async deleteShop(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShopService.deleteShop(req.params.id);
      sendSuccess(res, result, 'Shop deactivated');
    } catch (error) { next(error); }
  }

  static async toggleOpenStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const shop = await ShopService.toggleOpenStatus(req.params.id);
      sendSuccess(res, { isOpen: shop.isOpen }, 'Shop status toggled');
    } catch (error) { next(error); }
  }

  static async getShopStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ShopService.getShopStats(req.params.id);
      sendSuccess(res, stats);
    } catch (error) { next(error); }
  }

  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await ShopService.getShopServices(req.params.shopId);
      sendSuccess(res, services);
    } catch (error) { next(error); }
  }

  static async createService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await ShopService.createShopService(req.params.shopId, req.body);
      sendCreated(res, service, 'Service created');
    } catch (error) { next(error); }
  }

  static async updateService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await ShopService.updateShopService(req.params.shopId, req.params.serviceId, req.body);
      sendSuccess(res, service, 'Service updated');
    } catch (error) { next(error); }
  }

  static async deleteService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ShopService.deleteShopService(req.params.shopId, req.params.serviceId);
      sendSuccess(res, result, 'Service deleted');
    } catch (error) { next(error); }
  }

  static async getVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicles = await ShopService.getShopVehicles(req.params.shopId);
      sendSuccess(res, vehicles);
    } catch (error) { next(error); }
  }

  static async createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await ShopService.createShopVehicle(req.params.shopId, req.body);
      sendCreated(res, vehicle, 'Vehicle added');
    } catch (error) { next(error); }
  }

  static async updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await ShopService.updateShopVehicle(req.params.shopId, req.params.vehicleId, req.body);
      sendSuccess(res, vehicle, 'Vehicle updated');
    } catch (error) { next(error); }
  }

  static async deleteVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ShopService.deleteShopVehicle(req.params.shopId, req.params.vehicleId);
      sendSuccess(res, result, 'Vehicle deleted');
    } catch (error) { next(error); }
  }
}

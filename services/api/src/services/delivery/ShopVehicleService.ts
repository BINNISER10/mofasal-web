import prisma from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import logger from '../../utils/logger';

export class ShopVehicleService {
  async assignDelivery(shopId: string, orderId: string): Promise<any> {
    const vehicle = await prisma.shopVehicle.findFirst({
      where: { shopId, isActive: true },
    });
    if (!vehicle) throw ApiError.notFound('No active vehicle found for this shop');

    return {
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      vehicleModel: vehicle.model,
      plateNumber: vehicle.plateNumber,
      estimatedArrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'ASSIGNED',
    };
  }

  async getDriverLocation(shopId: string, orderId: string): Promise<{ lat: number; lng: number } | null> {
    return null;
  }

  async updateDeliveryStatus(orderId: string, status: string): Promise<void> {
    logger.info(`Shop vehicle delivery status: Order ${orderId} -> ${status}`);
  }
}

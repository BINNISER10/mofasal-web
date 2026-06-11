import { CareenService } from '../integrations/CareenService';
import logger from '../../utils/logger';

export class CareenDeliveryService {
  private careenService: CareenService;

  constructor() {
    this.careenService = new CareenService();
  }

  async createDelivery(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }): Promise<any> {
    try {
      const result = await this.careenService.createDelivery(
        { lat: data.pickupLat, lng: data.pickupLng },
        { lat: data.dropoffLat, lng: data.dropoffLng },
        { description: 'Clothing delivery', weight: 1, unit: 'kg' }
      );
      return {
        driverName: result.driver?.name || 'Careen Driver',
        driverPhone: result.driver?.phone || '',
        trackingUrl: result.tracking_url || '',
        estimatedArrival: result.estimated_arrival || '',
        status: 'PICKED_UP',
      };
    } catch (error) {
      logger.error('Careen delivery creation failed', error);
      throw new Error('Careen delivery failed');
    }
  }

  async getDeliveryStatus(deliveryId: string): Promise<any> {
    return this.careenService.getDeliveryStatus(deliveryId);
  }

  async cancelDelivery(deliveryId: string): Promise<boolean> {
    return this.careenService.cancelDelivery(deliveryId);
  }
}

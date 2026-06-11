import { UberService } from '../integrations/UberService';
import logger from '../../utils/logger';

export class UberDeliveryService {
  private uberService: UberService;

  constructor() {
    this.uberService = new UberService();
  }

  async createDelivery(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }): Promise<any> {
    try {
      const result = await this.uberService.bookRide(
        { lat: data.pickupLat, lng: data.pickupLng },
        { lat: data.dropoffLat, lng: data.dropoffLng }
      );
      return {
        driverName: result.driver?.name || 'Uber Driver',
        driverPhone: result.driver?.phone || '',
        trackingUrl: result.tracking_url || '',
        estimatedArrival: result.estimated_arrival || '',
        status: 'PICKED_UP',
      };
    } catch (error) {
      logger.error('Uber delivery creation failed', error);
      throw new Error('Uber delivery failed');
    }
  }

  async getDeliveryStatus(requestId: string): Promise<any> {
    const result = await this.uberService.getRideStatus(requestId);
    return result;
  }

  async cancelDelivery(requestId: string): Promise<boolean> {
    return this.uberService.cancelRide(requestId);
  }
}

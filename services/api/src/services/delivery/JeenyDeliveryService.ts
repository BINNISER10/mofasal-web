import { JeenyService } from '../integrations/JeenyService';
import logger from '../../utils/logger';

export class JeenyDeliveryService {
  private jeenyService: JeenyService;

  constructor() {
    this.jeenyService = new JeenyService();
  }

  async createDelivery(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }): Promise<any> {
    try {
      const result = await this.jeenyService.requestRide(
        { lat: data.pickupLat, lng: data.pickupLng },
        { lat: data.dropoffLat, lng: data.dropoffLng }
      );
      return {
        driverName: result.driver?.name || 'Jeeny Driver',
        driverPhone: result.driver?.phone || '',
        trackingUrl: result.tracking_url || '',
        estimatedArrival: result.estimated_arrival || '',
        status: 'PICKED_UP',
      };
    } catch (error) {
      logger.error('Jeeny delivery creation failed', error);
      throw new Error('Jeeny delivery failed');
    }
  }

  async getDeliveryStatus(rideId: string): Promise<any> {
    return this.jeenyService.getRideStatus(rideId);
  }

  async cancelDelivery(rideId: string): Promise<boolean> {
    return this.jeenyService.cancelRide(rideId);
  }
}

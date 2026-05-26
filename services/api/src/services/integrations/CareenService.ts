import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class CareenService {
  private api = axios.create({
    baseURL: config.delivery.careen.apiUrl || 'https://api.careen.app/v1',
    headers: {
      'x-api-key': config.delivery.careen.apiKey,
      'Content-Type': 'application/json',
    },
  });

  async createDelivery(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }, packageDetails?: any): Promise<any> {
    try {
      const response = await this.api.post('/deliveries', {
        pickup: { latitude: pickup.lat, longitude: pickup.lng },
        dropoff: { latitude: dropoff.lat, longitude: dropoff.lng },
        package: packageDetails || { description: 'Clothing delivery', weight: 1, unit: 'kg' },
      });
      return response.data;
    } catch (error) {
      logger.error('Careen delivery creation failed', error);
      throw new Error('Careen delivery failed');
    }
  }

  async getDeliveryStatus(deliveryId: string): Promise<any> {
    try {
      const response = await this.api.get(`/deliveries/${deliveryId}`);
      return response.data;
    } catch (error) {
      logger.error('Careen status check failed', error);
      return null;
    }
  }

  async cancelDelivery(deliveryId: string): Promise<boolean> {
    try {
      await this.api.post(`/deliveries/${deliveryId}/cancel`);
      return true;
    } catch (error) {
      logger.error('Careen cancellation failed', error);
      return false;
    }
  }

  async getDeliveryCost(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }): Promise<number> {
    try {
      const response = await this.api.post('/deliveries/estimate', {
        pickup: { latitude: pickup.lat, longitude: pickup.lng },
        dropoff: { latitude: dropoff.lat, longitude: dropoff.lng },
      });
      return response.data.estimatedCost || 0;
    } catch (error) {
      logger.error('Careen cost estimate failed', error);
      return 0;
    }
  }
}

import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class JeenyService {
  private api = axios.create({
    baseURL: config.delivery.jeeny.apiUrl || 'https://api.jeeny.com/v1',
    headers: {
      'Authorization': `Bearer ${config.delivery.jeeny.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  async requestRide(pickup: { lat: number; lng: number; address?: string }, dropoff: { lat: number; lng: number; address?: string }): Promise<any> {
    try {
      const response = await this.api.post('/rides', {
        pickup: {
          latitude: pickup.lat,
          longitude: pickup.lng,
          address: pickup.address || '',
        },
        dropoff: {
          latitude: dropoff.lat,
          longitude: dropoff.lng,
          address: dropoff.address || '',
        },
        type: 'delivery',
      });
      return response.data;
    } catch (error) {
      logger.error('Jeeny ride request failed', error);
      throw new Error('Jeeny ride request failed');
    }
  }

  async getRideStatus(rideId: string): Promise<any> {
    try {
      const response = await this.api.get(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      logger.error('Jeeny status check failed', error);
      return null;
    }
  }

  async cancelRide(rideId: string): Promise<boolean> {
    try {
      await this.api.post(`/rides/${rideId}/cancel`);
      return true;
    } catch (error) {
      logger.error('Jeeny cancellation failed', error);
      return false;
    }
  }

  async getDriverLocation(rideId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await this.api.get(`/rides/${rideId}/location`);
      return { lat: response.data.latitude, lng: response.data.longitude };
    } catch (error) {
      logger.error('Jeeny location fetch failed', error);
      return null;
    }
  }
}

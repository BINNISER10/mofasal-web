import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class UberService {
  private api = axios.create({
    baseURL: config.delivery.uber.apiUrl || 'https://api.uber.com/v1',
    headers: {
      'Authorization': `Bearer ${config.delivery.uber.clientId}`,
      'Content-Type': 'application/json',
    },
  });

  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post('https://login.uber.com/oauth/v2/token', {
        client_id: config.delivery.uber.clientId,
        client_secret: config.delivery.uber.clientSecret,
        grant_type: 'client_credentials',
        scope: 'delivery',
      });
      return response.data.access_token;
    } catch (error) {
      logger.error('Uber auth failed', error);
      throw new Error('Uber authentication failed');
    }
  }

  async bookRide(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${config.delivery.uber.apiUrl}/requests`,
        {
          product_id: 'delivery',
          start_latitude: pickup.lat,
          start_longitude: pickup.lng,
          end_latitude: dropoff.lat,
          end_longitude: dropoff.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      logger.error('Uber ride booking failed', error);
      throw new Error('Uber ride booking failed');
    }
  }

  async getRideStatus(requestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${config.delivery.uber.apiUrl}/requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      logger.error('Uber status check failed', error);
      throw new Error('Uber status check failed');
    }
  }

  async cancelRide(requestId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      await axios.delete(
        `${config.delivery.uber.apiUrl}/requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      logger.error('Uber ride cancellation failed', error);
      return false;
    }
  }
}

import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class SmsaService {
  private api = axios.create({
    baseURL: config.delivery.smsa.apiUrl || 'https://api.smsaexpress.com/v1',
    headers: {
      'x-api-key': config.delivery.smsa.apiKey,
      'x-passphrase': config.delivery.smsa.passphrase,
      'Content-Type': 'application/json',
    },
  });

  async createWaybill(data: {
    customerName: string; customerPhone: string; customerEmail?: string;
    pickupAddress: string; deliveryAddress: string;
    description: string; weight?: number; pieces?: number;
  }): Promise<any> {
    try {
      const response = await this.api.post('/waybills', {
        accountNumber: config.delivery.smsa.accountNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || '',
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        description: data.description,
        weight: data.weight || 1,
        pieces: data.pieces || 1,
        status: 'CREATED',
      });
      return response.data;
    } catch (error) {
      logger.error('SMSA waybill creation failed', error);
      throw new Error('SMSA waybill creation failed');
    }
  }

  async trackWaybill(waybillNumber: string): Promise<any> {
    try {
      const response = await this.api.get(`/waybills/${waybillNumber}/track`);
      return response.data;
    } catch (error) {
      logger.error('SMSA tracking failed', error);
      return null;
    }
  }

  async cancelWaybill(waybillNumber: string): Promise<boolean> {
    try {
      await this.api.post(`/waybills/${waybillNumber}/cancel`);
      return true;
    } catch (error) {
      logger.error('SMSA cancellation failed', error);
      return false;
    }
  }

  async printLabel(waybillNumber: string): Promise<string | null> {
    try {
      const response = await this.api.get(`/waybills/${waybillNumber}/label`, { responseType: 'arraybuffer' });
      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      logger.error('SMSA label printing failed', error);
      return null;
    }
  }
}

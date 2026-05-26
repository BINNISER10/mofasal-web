import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class MadaService {
  private api = axios.create({
    baseURL: 'https://api.moyasar.com/v1',
    headers: {
      Authorization: `Basic ${Buffer.from(config.payment.mada.apiKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  async charge(amount: number, source: any): Promise<any> {
    try {
      const response = await this.api.post('/payments', {
        amount: Math.round(amount * 100),
        currency: 'SAR',
        source: {
          type: 'mada',
          ...source,
        },
        callback_url: `${config.apiPrefix}/payments/webhook/mada`,
      });
      return {
        success: response.data.status === 'paid',
        reference: response.data.id,
        status: response.data.status,
        metadata: response.data,
      };
    } catch (error) {
      logger.error('Mada payment failed', error);
      throw new Error('Mada payment processing failed');
    }
  }

  async refund(paymentId: string, amount?: number): Promise<any> {
    try {
      const response = await this.api.post(`/payments/${paymentId}/refund`, {
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return response.data;
    } catch (error) {
      logger.error('Mada refund failed', error);
      throw new Error('Mada refund failed');
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('Mada payment fetch failed', error);
      return null;
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    return true;
  }
}

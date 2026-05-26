import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class TabbyService {
  private api = axios.create({
    baseURL: config.payment.tabby.apiUrl || 'https://api.tabby.ai/api/v2',
    headers: {
      'Authorization': `Bearer ${config.payment.tabby.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  async createSession(amount: number, orderData: any): Promise<any> {
    try {
      const response = await this.api.post('/checkout/sessions', {
        payment: {
          amount: amount.toString(),
          currency: 'SAR',
          description: orderData.description || 'MUFASAL Order',
          buyer: {
            phone: orderData.customerPhone || '966500000000',
            email: orderData.customerEmail || '',
            name: orderData.customerName || 'Customer',
          },
          order: {
            reference_id: orderData.orderId || `ORD-${Date.now()}`,
            items: orderData.items?.map((item: any) => ({
              title: item.name,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            })) || [],
          },
        },
        lang: 'en',
        merchant_code: 'MUFASAL',
      });

      return {
        success: true,
        reference: response.data.id,
        checkoutUrl: response.data.configuration?.available_products?.installments?.[0]?.web_url,
        status: 'PENDING',
      };
    } catch (error) {
      logger.error('Tabby session creation failed', error);
      return { success: false, message: 'Tabby payment initiation failed' };
    }
  }

  async verifySession(sessionId: string): Promise<any> {
    try {
      const response = await this.api.get(`/checkout/sessions/${sessionId}`);
      return {
        success: response.data.status === 'authorized',
        reference: sessionId,
        status: response.data.status,
      };
    } catch (error) {
      logger.error('Tabby verification failed', error);
      return { success: false, status: 'FAILED' };
    }
  }

  async capturePayment(sessionId: string): Promise<boolean> {
    try {
      await this.api.post(`/checkout/sessions/${sessionId}/capture`);
      return true;
    } catch (error) {
      logger.error('Tabby capture failed', error);
      return false;
    }
  }

  async refund(sessionId: string, amount?: number): Promise<boolean> {
    try {
      await this.api.post(`/checkout/sessions/${sessionId}/refund`, {
        amount: amount ? amount.toString() : undefined,
      });
      return true;
    } catch (error) {
      logger.error('Tabby refund failed', error);
      return false;
    }
  }
}

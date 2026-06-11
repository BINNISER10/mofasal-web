import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class TamaraService {
  private api = axios.create({
    baseURL: config.payment.tamara.apiUrl || 'https://api.tamara.co/v1',
    headers: {
      'Authorization': `Bearer ${config.payment.tamara.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  async createSession(amount: number, orderData: any): Promise<any> {
    try {
      const response = await this.api.post('/checkout', {
        order_reference_id: orderData.orderId || `ORD-${Date.now()}`,
        order_number: orderData.orderNumber,
        total_amount: { amount: amount.toString(), currency: 'SAR' },
        description: orderData.description || 'MUFASAL Order',
        items: orderData.items?.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: { amount: item.unitPrice.toString(), currency: 'SAR' },
          total_amount: { amount: item.totalPrice.toString(), currency: 'SAR' },
        })) || [],
        consumer: {
          first_name: orderData.customerName || 'Customer',
          phone_number: orderData.customerPhone || '966500000000',
        },
        success_url: `${config.cors.origin}/orders/${orderData.orderId}/success`,
        failure_url: `${config.cors.origin}/orders/${orderData.orderId}/failure`,
        cancel_url: `${config.cors.origin}/orders/${orderData.orderId}/cancel`,
        locale: 'en',
      });

      return {
        success: true,
        reference: response.data.order_id,
        checkoutUrl: response.data.checkout_url,
        status: 'PENDING',
      };
    } catch (error) {
      logger.error('Tamara session creation failed', error);
      return { success: false, message: 'Tamara payment initiation failed' };
    }
  }

  async verifySession(orderId: string): Promise<any> {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      return {
        success: response.data.status === 'approved',
        reference: orderId,
        status: response.data.status,
      };
    } catch (error) {
      logger.error('Tamara verification failed', error);
      return { success: false, status: 'FAILED' };
    }
  }

  async capturePayment(orderId: string): Promise<boolean> {
    try {
      await this.api.post(`/orders/${orderId}/capture`);
      return true;
    } catch (error) {
      logger.error('Tamara capture failed', error);
      return false;
    }
  }

  async refund(orderId: string, amount?: number): Promise<boolean> {
    try {
      await this.api.post(`/orders/${orderId}/refund`, {
        total_amount: amount ? { amount: amount.toString(), currency: 'SAR' } : undefined,
      });
      return true;
    } catch (error) {
      logger.error('Tamara refund failed', error);
      return false;
    }
  }
}

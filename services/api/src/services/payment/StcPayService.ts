import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class StcPayService {
  private api = axios.create({
    baseURL: config.payment.stcpay.apiUrl || 'https://api.stcpay.com.sa/v1',
    headers: {
      'Authorization': `Bearer ${config.payment.stcpay.apiKey}`,
      'Content-Type': 'application/json',
      'x-merchant-id': config.payment.stcpay.merchantId,
    },
  });

  async initiatePayment(amount: number, phoneNumber: string): Promise<any> {
    try {
      const response = await this.api.post('/payments', {
        amount: Math.round(amount * 100),
        currency: 'SAR',
        phoneNumber,
        merchantId: config.payment.stcpay.merchantId,
        description: 'MUFASAL Order Payment',
      });
      return response.data;
    } catch (error) {
      logger.error('STC Pay initiation failed', error);
      throw new Error('STC Pay payment initiation failed');
    }
  }

  async charge(amount: number, gatewayData: any): Promise<any> {
    const phoneNumber = gatewayData?.phoneNumber || '966500000000';
    return this.initiatePayment(amount, phoneNumber);
  }

  async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await this.api.get(`/payments/${paymentId}/status`);
      return {
        success: response.data.status === 'PAID',
        reference: response.data.referenceId,
        status: response.data.status,
        metadata: response.data,
      };
    } catch (error) {
      logger.error('STC Pay verification failed', error);
      return { success: false, status: 'FAILED' };
    }
  }

  async refund(paymentId: string): Promise<boolean> {
    try {
      await this.api.post(`/payments/${paymentId}/refund`);
      return true;
    } catch (error) {
      logger.error('STC Pay refund failed', error);
      return false;
    }
  }
}

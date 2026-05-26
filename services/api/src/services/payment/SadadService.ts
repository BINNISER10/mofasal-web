import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class SadadService {
  private api = axios.create({
    baseURL: 'https://api.sadad.sa/v1',
    headers: {
      'x-api-key': config.payment.sadad.apiKey,
      'Content-Type': 'application/json',
    },
  });

  async generateInvoice(amount: number, data: any): Promise<any> {
    try {
      const response = await this.api.post('/invoices', {
        merchantId: config.payment.sadad.merchantId,
        terminalId: config.payment.sadad.terminalId,
        amount: Math.round(amount * 100),
        currency: 'SAR',
        customerName: data.customerName || 'MUFASAL Customer',
        customerMobile: data.customerPhone || '966500000000',
        customerEmail: data.customerEmail || '',
        description: data.description || 'MUFASAL Order',
        expiryMinutes: 1440,
      });

      return {
        success: true,
        reference: response.data.invoiceId,
        invoiceUrl: response.data.invoiceUrl,
        qrCode: response.data.qrCode,
        status: 'PENDING',
      };
    } catch (error) {
      logger.error('Sadad invoice generation failed', error);
      return { success: false, message: 'Sadad invoice generation failed' };
    }
  }

  async checkPaymentStatus(invoiceId: string): Promise<any> {
    try {
      const response = await this.api.get(`/invoices/${invoiceId}/status`, {
        headers: { 'x-api-key': config.payment.sadad.apiKey },
      });
      return {
        success: response.data.status === 'PAID',
        status: response.data.status,
        paidAmount: response.data.paidAmount,
        paidAt: response.data.paidAt,
      };
    } catch (error) {
      logger.error('Sadad status check failed', error);
      return { success: false, status: 'UNKNOWN' };
    }
  }

  async refund(invoiceId: string): Promise<boolean> {
    try {
      await this.api.post(`/invoices/${invoiceId}/refund`, {}, {
        headers: { 'x-api-key': config.payment.sadad.apiKey },
      });
      return true;
    } catch (error) {
      logger.error('Sadad refund failed', error);
      return false;
    }
  }
}

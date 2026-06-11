import { SmsaService } from '../integrations/SmsaService';
import logger from '../../utils/logger';

export class SmsaWaybillService {
  private smsaService: SmsaService;

  constructor() {
    this.smsaService = new SmsaService();
  }

  async createWaybill(data: { customerName: string; customerPhone: string; customerEmail?: string; description: string }): Promise<any> {
    try {
      const result = await this.smsaService.createWaybill({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        pickupAddress: 'MUFASAL Shop Address',
        deliveryAddress: 'Customer Address',
        description: data.description,
        weight: 1,
        pieces: 1,
      });

      return {
        waybillNumber: result.waybillNumber || result.id,
        trackingUrl: result.trackingUrl || '',
        estimatedArrival: result.estimatedDelivery || '',
        status: 'PICKED_UP',
      };
    } catch (error) {
      logger.error('SMSA waybill creation failed', error);
      throw new Error('SMSA waybill creation failed');
    }
  }

  async trackWaybill(waybillNumber: string): Promise<any> {
    return this.smsaService.trackWaybill(waybillNumber);
  }

  async cancelWaybill(waybillNumber: string): Promise<boolean> {
    return this.smsaService.cancelWaybill(waybillNumber);
  }

  async printLabel(waybillNumber: string): Promise<string | null> {
    return this.smsaService.printLabel(waybillNumber);
  }
}

import { AramexService } from '../integrations/AramexService';
import logger from '../../utils/logger';

export class AramexWaybillService {
  private aramexService: AramexService;

  constructor() {
    this.aramexService = new AramexService();
  }

  async createShipment(data: { customerName: string; customerPhone: string; customerEmail?: string; description: string }): Promise<any> {
    try {
      const result = await this.aramexService.createShipment({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        pickupAddress: { line1: 'MUFASAL Shop', city: 'Riyadh', country: 'SA' },
        deliveryAddress: { line1: 'Customer Address', city: 'Riyadh', country: 'SA' },
        description: data.description,
        weight: 1,
      });

      return {
        waybillNumber: result.Shipments?.[0]?.ID || result.id,
        trackingUrl: result.TrackingUrl || '',
        estimatedArrival: result.EstimatedDelivery || '',
        status: 'PICKED_UP',
      };
    } catch (error) {
      logger.error('Aramex shipment creation failed', error);
      throw new Error('Aramex shipment failed');
    }
  }

  async trackShipment(waybillNumber: string): Promise<any> {
    return this.aramexService.trackShipment(waybillNumber);
  }

  async cancelShipment(waybillNumber: string): Promise<boolean> {
    return this.aramexService.cancelShipment(waybillNumber);
  }
}

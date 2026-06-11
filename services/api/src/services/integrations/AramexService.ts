import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class AramexService {
  private api = axios.create({
    baseURL: config.delivery.aramex.apiUrl || 'https://ws.aramex.net/shippingapi/v1',
    headers: { 'Content-Type': 'application/json' },
  });

  private getClientInfo() {
    return {
      UserName: config.delivery.aramex.username,
      Password: config.delivery.aramex.password,
      AccountNumber: config.delivery.aramex.accountNumber,
      AccountPin: config.delivery.aramex.accountPin,
      Entity: config.delivery.aramex.entity,
    };
  }

  async createShipment(shipmentData: {
    customerName: string; customerPhone: string; customerEmail?: string;
    pickupAddress: { line1: string; city: string; country: string };
    deliveryAddress: { line1: string; city: string; country: string };
    description: string; weight?: number;
  }): Promise<any> {
    try {
      const response = await this.api.post('/shipments', {
        ClientInfo: this.getClientInfo(),
        Shipments: [{
          Shipper: {
            Name: 'MUFASAL',
            Phone: shipmentData.customerPhone,
            Address: shipmentData.pickupAddress,
          },
          Consignee: {
            Name: shipmentData.customerName,
            Phone: shipmentData.customerPhone,
            Email: shipmentData.customerEmail || '',
            Address: shipmentData.deliveryAddress,
          },
          Details: {
            Description: shipmentData.description,
            Weight: { Value: shipmentData.weight || 1, Unit: 'KG' },
          },
        }],
      });
      return response.data;
    } catch (error) {
      logger.error('Aramex shipment creation failed', error);
      throw new Error('Aramex shipment failed');
    }
  }

  async trackShipment(waybillNumber: string): Promise<any> {
    try {
      const response = await this.api.post('/tracking', {
        ClientInfo: this.getClientInfo(),
        Shipments: [waybillNumber],
      });
      return response.data;
    } catch (error) {
      logger.error('Aramex tracking failed', error);
      return null;
    }
  }

  async cancelShipment(waybillNumber: string): Promise<boolean> {
    try {
      const response = await this.api.post('/shipments/cancel', {
        ClientInfo: this.getClientInfo(),
        ShipmentNumber: waybillNumber,
      });
      return response.data?.HasErrors === false;
    } catch (error) {
      logger.error('Aramex cancellation failed', error);
      return false;
    }
  }

  async getRates(from: { city: string; country: string }, to: { city: string; country: string }, weight: number): Promise<any> {
    try {
      const response = await this.api.post('/rates', {
        ClientInfo: this.getClientInfo(),
        OriginAddress: { City: from.city, CountryCode: from.country },
        DestinationAddress: { City: to.city, CountryCode: to.country },
        ShipmentDetails: { Weight: { Value: weight, Unit: 'KG' } },
      });
      return response.data;
    } catch (error) {
      logger.error('Aramex rate check failed', error);
      return null;
    }
  }
}

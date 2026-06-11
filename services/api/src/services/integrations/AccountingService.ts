import axios from 'axios';
import { config } from '../../config';
import logger from '../../utils/logger';

export class AccountingService {
  private static providers: Record<string, any> = {};

  static async syncInvoice(invoice: any, provider: string = 'QUICKBOOKS'): Promise<any> {
    try {
      switch (provider) {
        case 'QUICKBOOKS':
          return this.syncQuickBooks(invoice);
        case 'QAID':
          return this.syncQaid(invoice);
        case 'QUYOUD':
          return this.syncQuyoud(invoice);
        case 'SAP':
          return this.syncSAP(invoice);
        default:
          logger.warn(`Unknown accounting provider: ${provider}`);
          return null;
      }
    } catch (error) {
      logger.error(`Accounting sync failed for ${provider}`, error);
      return null;
    }
  }

  private static async syncQuickBooks(invoice: any): Promise<any> {
    try {
      const response = await axios.post(
        'https://quickbooks.api.intuit.com/v3/company/123/invoice',
        {
          CustomerRef: { name: invoice.customerName },
          Line: invoice.items?.map((item: any) => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.totalPrice,
            SalesItemLineDetail: { ItemRef: { name: item.name }, Qty: item.quantity, UnitPrice: item.unitPrice },
          })) || [],
          TxnTaxDetail: { TotalTax: invoice.vatAmount },
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accounting.quickbooks?.clientId || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error('QuickBooks sync failed', error);
      return null;
    }
  }

  private static async syncQaid(invoice: any): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.qaid.sa/v1/invoices',
        {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.grandTotal,
          vat: invoice.vatAmount,
          customerName: invoice.customerName,
          customerVat: invoice.customerVat || '',
        },
        {
          headers: {
            'x-api-key': config.accounting.qaid?.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Qaid sync failed', error);
      return null;
    }
  }

  private static async syncQuyoud(invoice: any): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.quyoud.com/v1/invoices',
        {
          reference: invoice.invoiceNumber,
          total: invoice.grandTotal,
          tax: invoice.vatAmount,
          items: invoice.items,
        },
        {
          headers: {
            'x-api-key': config.accounting.quyoud?.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Quyoud sync failed', error);
      return null;
    }
  }

  private static async syncSAP(invoice: any): Promise<any> {
    logger.info('SAP integration - manual sync required', { invoiceNumber: invoice.invoiceNumber });
    return { status: 'MANUAL_SYNC_REQUIRED' };
  }

  static async getInvoiceStatus(providerInvoiceId: string, provider: string): Promise<any> {
    switch (provider) {
      case 'QUICKBOOKS':
        try {
          const response = await axios.get(
            `https://quickbooks.api.intuit.com/v3/company/123/invoice/${providerInvoiceId}`,
            { headers: { 'Authorization': `Bearer ${config.accounting.quickbooks?.clientId || ''}` } }
          );
          return response.data;
        } catch {
          return null;
        }
      default:
        return null;
    }
  }
}

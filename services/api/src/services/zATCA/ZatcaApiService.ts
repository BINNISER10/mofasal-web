import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { config } from '../../config';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { InvoiceXmlGenerator } from './InvoiceXmlGenerator';

export class ZatcaApiService {
  private api: AxiosInstance;
  private complianceApi: AxiosInstance;

  constructor() {
    const baseUrl = config.zatca.apiUrl;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 30000,
    });
    this.complianceApi = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 30000,
    });
  }

  async generateInvoice(invoiceId: string): Promise<any> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: { include: { items: true, customer: true, shop: true } } },
    });
    if (!invoice) throw new Error('Invoice not found');

    const xml = InvoiceXmlGenerator.generate(invoice, invoice.order);
    const qrData = InvoiceXmlGenerator.generateQrCodeData(invoice);
    const qrCode = await QRCode.toDataURL(Buffer.from(qrData).toString('base64'));

    const signedXml = await this.signXml(xml);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { xmlPayload: xml, signedXml: signedXml.toString('base64'), qrCode, zatcaStatus: 'SIGNED' },
    });

    return updatedInvoice;
  }

  async reportInvoice(invoiceId: string): Promise<any> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    try {
      const response = await this.api.post('/invoices/reporting/single', {
        invoiceNumber: invoice.invoiceNumber,
        uuid: invoice.uuid,
        invoice: invoice.signedXml,
        status: 'REPORTED',
      });

      const zatcaUuid = response.data?.uuid || response.data?.invoiceUUID;
      const zatcaHash = response.data?.hash || '';

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { zatcaStatus: 'REPORTED', zatcaUuid, zatcaHash },
      });

      return response.data;
    } catch (error) {
      logger.error('ZATCA reporting failed', error);
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { zatcaStatus: 'REPORTING_FAILED' },
      });
      throw error;
    }
  }

  async clearInvoice(invoiceId: string): Promise<any> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    try {
      const response = await this.api.post('/invoices/clearance/single', {
        invoiceNumber: invoice.invoiceNumber,
        uuid: invoice.uuid,
        invoice: invoice.signedXml,
      });

      const zatcaUuid = response.data?.uuid || response.data?.clearedInvoice?.invoiceUUID;
      const zatcaHash = response.data?.hash || '';
      const clearanceStatus = response.data?.clearanceStatus || 'CLEARED';

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { zatcaStatus: clearanceStatus, zatcaUuid, zatcaHash },
      });

      return response.data;
    } catch (error) {
      logger.error('ZATCA clearance failed', error);
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { zatcaStatus: 'CLEARANCE_FAILED' },
      });
      throw error;
    }
  }

  async complianceCheck(xml: string): Promise<any> {
    try {
      const response = await this.complianceApi.post('/compliance/invoices', {
        invoice: Buffer.from(xml).toString('base64'),
        uuid: crypto.randomUUID(),
      });
      return response.data;
    } catch (error) {
      logger.error('ZATCA compliance check failed', error);
      throw error;
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<any> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    try {
      const response = await this.api.get(`/invoices/${invoice.uuid}/status`);
      return response.data;
    } catch (error) {
      logger.error('ZATCA status check failed', error);
      return { zatcaStatus: invoice.zatcaStatus };
    }
  }

  async generateQrCode(invoiceId: string): Promise<string> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    const qrData = InvoiceXmlGenerator.generateQrCodeData(invoice);
    const base64 = Buffer.from(qrData).toString('base64');
    const qrCode = await QRCode.toDataURL(base64);

    await prisma.invoice.update({ where: { id: invoiceId }, data: { qrCode } });
    return qrCode;
  }

  private async signXml(xml: string): Promise<Buffer> {
    const privateKey = `-----BEGIN PRIVATE KEY-----
${config.zatca.builderId || 'MIGIAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgNC4l+cVeQFw4hSMF'}
-----END PRIVATE KEY-----`;

    const sign = crypto.createSign('SHA256');
    sign.update(xml);
    sign.end();
    return sign.sign(privateKey);
  }

  async getComplianceStatus(): Promise<any> {
    return {
      environment: config.zatca.environment,
      apiUrl: config.zatca.apiUrl,
      sellerName: config.zatca.sellerName,
      vatNumber: config.zatca.vatNumber,
      status: 'CONFIGURED',
    };
  }
}

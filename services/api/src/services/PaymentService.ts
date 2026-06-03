import { nanoid } from 'nanoid';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import socketService from './SocketService';
import { NotificationService } from './NotificationService';
import { LedgerService } from './LedgerService';
import { config } from '../config';

export class PaymentService {
  static async processPayment(data: {
    orderId: string; method: string; amount: number; gatewayData?: any;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { customer: { select: { id: true, name: true, phone: true } } },
    });
    if (!order) throw ApiError.notFound('Order not found');
    if (order.paymentStatus === 'PAID') throw ApiError.conflict('Order already paid');

    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method as any,
        status: 'PROCESSING',
        gatewayResponse: data.gatewayData || {},
      },
    });

    try {
      let gatewayResult: any;

      switch (data.method) {
        case 'MADA':
          gatewayResult = await this.processMada(data.orderId, data.amount, data.gatewayData);
          break;
        case 'VISA_MASTERCARD':
          gatewayResult = await this.processVisaMastercard(data.orderId, data.amount, data.gatewayData);
          break;
        case 'APPLE_PAY':
          gatewayResult = await this.processApplePay(data.orderId, data.amount, data.gatewayData);
          break;
        case 'STC_PAY':
          gatewayResult = await this.processStcPay(data.orderId, data.amount, data.gatewayData);
          break;
        case 'TAMARA':
          gatewayResult = await this.processTamara(data.orderId, data.amount, data.gatewayData);
          break;
        case 'TABBY':
          gatewayResult = await this.processTabby(data.orderId, data.amount, data.gatewayData);
          break;
        case 'SADAD':
          gatewayResult = await this.processSadad(data.orderId, data.amount, data.gatewayData);
          break;
        case 'CASH':
          gatewayResult = { success: true, reference: `CASH-${nanoid(10)}`, status: 'PAID' };
          break;
        default:
          throw ApiError.badRequest(`Unsupported payment method: ${data.method}`);
      }

      if (gatewayResult.success) {
        await prisma.$transaction([
          prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'PAID',
              gatewayReference: gatewayResult.reference,
              gatewayResponse: gatewayResult,
            },
          }),
          prisma.order.update({
            where: { id: data.orderId },
            data: { paymentStatus: 'PAID', paymentMethod: data.method as any },
          }),
        ]);

        socketService.emitPaymentUpdate(data.orderId, 'PAID', { amount: data.amount });
        await NotificationService.sendToUser(order.customerId, 'PAYMENT_UPDATE', {
          title: 'Payment Successful', body: `Payment of SAR ${data.amount} completed`,
        });

        // ترحيل محاسبي تلقائي عند نجاح الدفع (لا يُعطّل تدفّق الدفع أبداً)
        LedgerService.postOrderRevenue({ ...order, paymentMethod: data.method }).catch((err) =>
          logger.error(`Auto ledger posting failed for order ${order.orderNumber}: ${err.message}`)
        );

        return { success: true, transactionId: transaction.id, reference: gatewayResult.reference };
      } else {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', gatewayResponse: gatewayResult },
        });

        return { success: false, transactionId: transaction.id, message: gatewayResult.message || 'Payment failed' };
      }
    } catch (error) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED', gatewayResponse: { error: (error as Error).message } },
      });
      throw error;
    }
  }

  private static async processMada(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { MadaService } = await import('./payment/MadaService');
      return await new MadaService().charge(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`Mada payment failed: ${(err as Error).message}`);
    }
  }

  private static async processVisaMastercard(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { VisaMastercardService } = await import('./payment/VisaMastercardService');
      return await new VisaMastercardService().charge(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`Visa/Mastercard payment failed: ${(err as Error).message}`);
    }
  }

  private static async processApplePay(orderId: string, amount: number, gatewayData: any): Promise<any> {
    throw ApiError.badGateway('Apple Pay gateway not configured');
  }

  private static async processStcPay(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { StcPayService } = await import('./payment/StcPayService');
      return await new StcPayService().charge(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`STC Pay failed: ${(err as Error).message}`);
    }
  }

  private static async processTamara(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { TamaraService } = await import('./payment/TamaraService');
      return await new TamaraService().createSession(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`Tamara payment failed: ${(err as Error).message}`);
    }
  }

  private static async processTabby(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { TabbyService } = await import('./payment/TabbyService');
      return await new TabbyService().createSession(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`Tabby payment failed: ${(err as Error).message}`);
    }
  }

  private static async processSadad(orderId: string, amount: number, gatewayData: any): Promise<any> {
    try {
      const { SadadService } = await import('./payment/SadadService');
      return await new SadadService().generateInvoice(amount, gatewayData);
    } catch (err) {
      throw ApiError.badGateway(`Sadad payment failed: ${(err as Error).message}`);
    }
  }

  static async getTransactions(orderId: string) {
    return prisma.paymentTransaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTransaction(transactionId: string) {
    const tx = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } });
    if (!tx) throw ApiError.notFound('Transaction not found');
    return tx;
  }

  static async handleGatewayWebhook(method: string, payload: any) {
    logger.info(`Webhook received for ${method}`, payload);
    const reference = payload.reference || payload.id;
    if (!reference) return { received: true };

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { gatewayReference: reference },
      include: { order: true },
    });

    if (!transaction) {
      logger.warn(`Transaction not found for reference: ${reference}`);
      return { received: true };
    }

    const status = payload.status === 'captured' || payload.status === 'paid' ? 'PAID' : 'FAILED';
    if (status === 'PAID') {
      await prisma.$transaction([
        prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: 'PAID', gatewayResponse: payload } }),
        prisma.order.update({ where: { id: transaction.orderId }, data: { paymentStatus: 'PAID' } }),
      ]);
      socketService.emitPaymentUpdate(transaction.orderId, 'PAID');
    }

    return { received: true };
  }

  static async initiateRefund(transactionId: string, amount?: number) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { order: true },
    });
    if (!transaction) throw ApiError.notFound('Transaction not found');
    if (transaction.status !== 'PAID') throw ApiError.badRequest('Transaction not paid');

    const refundAmount = amount || transaction.amount;

    await prisma.$transaction([
      prisma.paymentTransaction.create({
        data: {
          orderId: transaction.orderId,
          amount: -refundAmount,
          method: transaction.method,
          status: 'REFUNDED',
          gatewayReference: `REF-${transaction.gatewayReference}`,
        },
      }),
      prisma.order.update({
        where: { id: transaction.orderId },
        data: { paymentStatus: 'REFUNDED' as any },
      }),
    ]);

    return { success: true, refundedAmount: refundAmount };
  }

  static async generateInvoice(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true, shop: true },
    });
    if (!order) throw ApiError.notFound('Order not found');

    const invoiceNumber = `INV-${order.orderNumber}`;
    const uuid = nanoid(32).toUpperCase();

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        shopId: order.shopId,
        customerId: order.customerId,
        invoiceNumber,
        uuid,
        totalAmount: order.totalAmount,
        taxAmount: 0,
        vatAmount: order.vatAmount,
        grandTotal: order.grandTotal,
        zatcaStatus: 'DRAFT',
      },
    });

    return invoice;
  }
}

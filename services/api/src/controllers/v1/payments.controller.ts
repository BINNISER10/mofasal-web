import { Response, NextFunction } from 'express';
import { PaymentService } from '../../services/PaymentService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';

export class PaymentController {
  static async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.processPayment(req.body);
      sendSuccess(res, result, result.success ? 'Payment processed' : 'Payment failed');
    } catch (error) { next(error); }
  }

  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transactions = await PaymentService.getTransactions(req.params.orderId);
      sendSuccess(res, transactions);
    } catch (error) { next(error); }
  }

  static async getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await PaymentService.getTransaction(req.params.id);
      sendSuccess(res, transaction);
    } catch (error) { next(error); }
  }

  static async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.initiateRefund(req.params.transactionId, req.body.amount);
      sendSuccess(res, result, 'Refund initiated');
    } catch (error) { next(error); }
  }

  static async handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.handleGatewayWebhook(req.params.method, req.body);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async generateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await PaymentService.generateInvoice(req.params.orderId);
      sendCreated(res, invoice, 'Invoice generated');
    } catch (error) { next(error); }
  }
}

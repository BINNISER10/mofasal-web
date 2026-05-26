import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import { ZatcaApiService } from '../../services/zATCA/ZatcaApiService';

export class ZatcaController {
  private static zatcaService = new ZatcaApiService();

  static async generateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ZatcaController.zatcaService.generateInvoice(req.params.invoiceId);
      sendSuccess(res, result, 'Invoice generated and signed');
    } catch (error) { next(error); }
  }

  static async reportInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ZatcaController.zatcaService.reportInvoice(req.params.invoiceId);
      sendSuccess(res, result, 'Invoice reported to ZATCA');
    } catch (error) { next(error); }
  }

  static async clearInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ZatcaController.zatcaService.clearInvoice(req.params.invoiceId);
      sendSuccess(res, result, 'Invoice cleared with ZATCA');
    } catch (error) { next(error); }
  }

  static async getInvoiceStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ZatcaController.zatcaService.getInvoiceStatus(req.params.invoiceId);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getComplianceStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ZatcaController.zatcaService.getComplianceStatus();
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getQrCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const qrCode = await ZatcaController.zatcaService.generateQrCode(req.params.invoiceId);
      sendSuccess(res, { qrCode });
    } catch (error) { next(error); }
  }
}

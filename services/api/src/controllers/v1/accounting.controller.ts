import { Response, NextFunction } from 'express';
import { LedgerService } from '../../services/LedgerService';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';

function resolveShopId(req: AuthRequest): string {
  const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
  const queryShopId = (req.query.shopId || req.body?.shopId) as string | undefined;
  const shopId = isAdmin && queryShopId ? queryShopId : req.user?.shopId;
  if (!shopId) throw ApiError.badRequest('No shop associated with this account');
  return shopId;
}

function parseRange(req: AuthRequest) {
  const { startDate, endDate } = req.query;
  return {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  };
}

export class AccountingController {
  static async getAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const accounts = await LedgerService.getAccounts(shopId);
      sendSuccess(res, accounts);
    } catch (error) { next(error); }
  }

  static async seedAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const accounts = await LedgerService.ensureChartOfAccounts(shopId);
      sendCreated(res, accounts, 'Chart of accounts ready');
    } catch (error) { next(error); }
  }

  static async postEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const entry = await LedgerService.postEntry(shopId, {
        description: req.body.description,
        date: req.body.date ? new Date(req.body.date) : undefined,
        lines: req.body.lines,
      });
      sendCreated(res, entry, 'Journal entry posted');
    } catch (error) { next(error); }
  }

  static async getJournal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const journal = await LedgerService.getJournal(shopId, parseRange(req), limit);
      sendSuccess(res, journal);
    } catch (error) { next(error); }
  }

  static async getTrialBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = resolveShopId(req);
      const trialBalance = await LedgerService.getTrialBalance(shopId);
      sendSuccess(res, trialBalance);
    } catch (error) { next(error); }
  }
}

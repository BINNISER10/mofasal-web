import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

interface JournalLineInput {
  accountCode: string;
  debit?: number;
  credit?: number;
}

interface PostEntryInput {
  description: string;
  date?: Date;
  lines: JournalLineInput[];
}

const ACCOUNT_TYPES = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE',
} as const;

const DEFAULT_ACCOUNTS: { code: string; name: string; type: string }[] = [
  { code: '1000', name: 'النقدية', type: ACCOUNT_TYPES.ASSET },
  { code: '1010', name: 'البنك', type: ACCOUNT_TYPES.ASSET },
  { code: '1100', name: 'الذمم المدينة', type: ACCOUNT_TYPES.ASSET },
  { code: '1200', name: 'المخزون', type: ACCOUNT_TYPES.ASSET },
  { code: '2000', name: 'الذمم الدائنة', type: ACCOUNT_TYPES.LIABILITY },
  { code: '2100', name: 'ضريبة القيمة المضافة المستحقة', type: ACCOUNT_TYPES.LIABILITY },
  { code: '3000', name: 'حقوق الملكية', type: ACCOUNT_TYPES.EQUITY },
  { code: '4000', name: 'إيرادات المبيعات', type: ACCOUNT_TYPES.REVENUE },
  { code: '5000', name: 'تكلفة البضاعة المباعة', type: ACCOUNT_TYPES.EXPENSE },
  { code: '5100', name: 'المصروفات التشغيلية', type: ACCOUNT_TYPES.EXPENSE },
];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class LedgerService {
  static async ensureChartOfAccounts(shopId: string) {
    const existing = await prisma.account.findMany({ where: { shopId }, select: { code: true } });
    const existingCodes = new Set(existing.map((a) => a.code));

    const toCreate = DEFAULT_ACCOUNTS.filter((a) => !existingCodes.has(a.code));
    if (toCreate.length > 0) {
      await prisma.account.createMany({
        data: toCreate.map((a) => ({ shopId, code: a.code, name: a.name, type: a.type, balance: 0 })),
      });
    }

    return prisma.account.findMany({ where: { shopId }, orderBy: { code: 'asc' } });
  }

  static async getAccounts(shopId: string) {
    return prisma.account.findMany({ where: { shopId }, orderBy: { code: 'asc' } });
  }

  static async postEntry(shopId: string, input: PostEntryInput) {
    if (!input.lines || input.lines.length < 2) {
      throw ApiError.badRequest('A journal entry requires at least two lines');
    }

    const totalDebit = round2(input.lines.reduce((sum, l) => sum + (l.debit || 0), 0));
    const totalCredit = round2(input.lines.reduce((sum, l) => sum + (l.credit || 0), 0));

    if (totalDebit !== totalCredit) {
      throw ApiError.badRequest(`Journal entry is not balanced (debit ${totalDebit} != credit ${totalCredit})`);
    }
    if (totalDebit === 0) {
      throw ApiError.badRequest('Journal entry total cannot be zero');
    }

    const accounts = await prisma.account.findMany({ where: { shopId } });
    const accountByCode = new Map(accounts.map((a) => [a.code, a]));

    const resolvedLines = input.lines.map((l) => {
      const account = accountByCode.get(l.accountCode);
      if (!account) throw ApiError.badRequest(`Unknown account code: ${l.accountCode}`);
      return { account, debit: round2(l.debit || 0), credit: round2(l.credit || 0) };
    });

    return prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          description: input.description,
          date: input.date || new Date(),
          lines: {
            create: resolvedLines.map((l) => ({
              accountId: l.account.id,
              debit: l.debit,
              credit: l.credit,
            })),
          },
        },
        include: { lines: { include: { account: { select: { code: true, name: true, type: true } } } } },
      });

      for (const line of resolvedLines) {
        await tx.account.update({
          where: { id: line.account.id },
          data: { balance: { increment: round2(line.debit - line.credit) } },
        });
      }

      return entry;
    });
  }

  static async getJournal(shopId: string, range: { startDate?: Date; endDate?: Date }, limit = 100) {
    const where: any = { lines: { some: { account: { shopId } } } };
    if (range.startDate || range.endDate) {
      where.date = {};
      if (range.startDate) where.date.gte = range.startDate;
      if (range.endDate) where.date.lte = range.endDate;
    }

    return prisma.journalEntry.findMany({
      where,
      take: limit,
      orderBy: { date: 'desc' },
      include: { lines: { include: { account: { select: { code: true, name: true, type: true } } } } },
    });
  }

  /**
   * Idempotent automatic posting when an order is paid (revenue recognition):
   *   Dr Cash/Bank (grandTotal)
   *     Cr Sales Revenue (totalAmount + deliveryFee)
   *     Cr VAT Payable (vatAmount)
   * Safe to call multiple times — skips if an entry already exists for the order.
   */
  static async postOrderRevenue(order: {
    orderNumber: string;
    shopId: string;
    totalAmount?: number | null;
    vatAmount?: number | null;
    deliveryFee?: number | null;
    grandTotal?: number | null;
    paymentMethod?: string | null;
  }) {
    if (!order.shopId || !order.grandTotal) return;

    const description = `إيراد الطلب ${order.orderNumber}`;
    const existing = await prisma.journalEntry.findFirst({
      where: { description, lines: { some: { account: { shopId: order.shopId } } } },
      select: { id: true },
    });
    if (existing) return;

    await this.ensureChartOfAccounts(order.shopId);

    const cashCode = order.paymentMethod === 'CASH' ? '1000' : '1010';
    const revenue = round2((order.totalAmount || 0) + (order.deliveryFee || 0));
    const vat = round2(order.vatAmount || 0);
    const total = round2(order.grandTotal);

    const lines = [
      { accountCode: cashCode, debit: total, credit: 0 },
      { accountCode: '4000', debit: 0, credit: revenue },
    ];
    if (vat > 0) lines.push({ accountCode: '2100', debit: 0, credit: vat });

    return this.postEntry(order.shopId, { description, lines });
  }

  static async getTrialBalance(shopId: string) {
    const accounts = await prisma.account.findMany({ where: { shopId }, orderBy: { code: 'asc' } });

    let totalDebit = 0;
    let totalCredit = 0;
    const rows = accounts.map((a) => {
      const balance = round2(a.balance);
      const debit = balance > 0 ? balance : 0;
      const credit = balance < 0 ? -balance : 0;
      totalDebit += debit;
      totalCredit += credit;
      return { code: a.code, name: a.name, type: a.type, debit, credit };
    });

    return { rows, totalDebit: round2(totalDebit), totalCredit: round2(totalCredit) };
  }
}

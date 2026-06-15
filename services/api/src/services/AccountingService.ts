import prisma from '../config/database';
import logger from '../utils/logger';

type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

interface JournalLineInput {
  accountId: string;
  debit: number;
  credit: number;
}

interface JournalEntryInput {
  date?: Date;
  description: string;
  lines: JournalLineInput[];
}

/**
 * خدمة المحاسبة المزدوجة (Double-Entry Accounting)
 * 
 * مبدأ: كل حركة مالية = قيد مزدوج متوازن (مدين = دائن)
 * لا تعديل مباشر على الأرصدة - يتم التحديث عبر القيود
 */
export class AccountingService {
  /**
   * إنشاء قيد دفتر يومية
   * يتحقق من توازن القيد قبل الحفظ
   */
  static async createJournalEntry(
    shopId: string,
    entry: JournalEntryInput
  ): Promise<string> {
    // التحقق من توازن القيد
    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Journal entry not balanced: Debit ${totalDebit} != Credit ${totalCredit}`
      );
    }

    if (totalDebit === 0) {
      throw new Error('Journal entry cannot have zero value');
    }

    // إنشاء القيد
    const journal = await prisma.journalEntry.create({
      data: {
        date: entry.date || new Date(),
        description: entry.description,
        lines: {
          create: entry.lines.map((line) => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
          })),
        },
      },
    });

    // تحديث أرصدة الحسابات
    await this.updateAccountBalances(journal.id);

    logger.info(`[Accounting] Journal entry created: ${journal.id}`);
    return journal.id;
  }

  /**
   * تحديث أرصدة الحسابات بعد قيد
   */
  private static async updateAccountBalances(journalId: string): Promise<void> {
    const lines = await prisma.journalLine.findMany({
      where: { journalId },
      include: { account: true },
    });

    for (const line of lines) {
      const account = line.account;
      const type = account.type as AccountType;

      // حساب التغيير في الرصيد
      let balanceChange = 0;
      if (type === 'ASSET' || type === 'EXPENSE') {
        balanceChange = line.debit - line.credit;
      } else {
        // LIABILITY, EQUITY, REVENUE
        balanceChange = line.credit - line.debit;
      }

      // تحديث الرصيد
      await prisma.account.update({
        where: { id: line.accountId },
        data: {
          balance: account.balance + balanceChange,
        },
      });
    }
  }

  /**
   * الحصول على ميزان المراجعة (Trial Balance)
   */
  static async getTrialBalance(shopId: string, asOfDate?: Date): Promise<{
    accounts: Array<{
      id: string;
      code: string;
      name: string;
      type: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  }> {
    const dateFilter = asOfDate ? { date: { lte: asOfDate } } : {};

    // جلب جميع القيود
    const lines = await prisma.journalLine.findMany({
      where: {
        journal: dateFilter,
        account: { shopId },
      },
      include: { account: true },
    });

    // تجميع الأرصدة لكل حساب
    const accountBalances = new Map<string, { debit: number; credit: number }>();

    for (const line of lines) {
      const accountId = line.accountId;
      if (!accountBalances.has(accountId)) {
        accountBalances.set(accountId, { debit: 0, credit: 0 });
      }
      const balances = accountBalances.get(accountId)!;
      balances.debit += line.debit;
      balances.credit += line.credit;
    }

    // تحويل إلى مصفوفة
    const accounts = await prisma.account.findMany({
      where: { shopId },
    });

    const result = accounts.map((account) => {
      const balances = accountBalances.get(account.id) || { debit: 0, credit: 0 };
      const type = account.type as AccountType;
      let balance = 0;

      if (type === 'ASSET' || type === 'EXPENSE') {
        balance = balances.debit - balances.credit;
      } else {
        balance = balances.credit - balances.debit;
      }

      return {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        debit: balances.debit,
        credit: balances.credit,
        balance,
      };
    });

    const totalDebit = result.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = result.reduce((sum, acc) => sum + acc.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      accounts: result,
      totalDebit,
      totalCredit,
      isBalanced,
    };
  }

  /**
   * الحصول على قائمة الدخل (Income Statement)
   */
  static async getIncomeStatement(
    shopId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    revenue: number;
    expenses: number;
    netIncome: number;
    revenueBreakdown: Array<{ name: string; amount: number }>;
    expenseBreakdown: Array<{ name: string; amount: number }>;
  }> {
    const lines = await prisma.journalLine.findMany({
      where: {
        journal: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        account: { shopId },
      },
      include: { account: true },
    });

    let totalRevenue = 0;
    let totalExpenses = 0;
    const revenueBreakdown = new Map<string, number>();
    const expenseBreakdown = new Map<string, number>();

    for (const line of lines) {
      const account = line.account;
      const type = account.type as AccountType;

      if (type === 'REVENUE') {
        const amount = line.credit - line.debit;
        totalRevenue += amount;
        revenueBreakdown.set(account.name, (revenueBreakdown.get(account.name) || 0) + amount);
      } else if (type === 'EXPENSE') {
        const amount = line.debit - line.credit;
        totalExpenses += amount;
        expenseBreakdown.set(account.name, (expenseBreakdown.get(account.name) || 0) + amount);
      }
    }

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      revenueBreakdown: Array.from(revenueBreakdown.entries()).map(([name, amount]) => ({ name, amount })),
      expenseBreakdown: Array.from(expenseBreakdown.entries()).map(([name, amount]) => ({ name, amount })),
    };
  }

  /**
   * الحصول على الميزانية العمومية (Balance Sheet)
   */
  static async getBalanceSheet(shopId: string, asOfDate?: Date): Promise<{
    assets: number;
    liabilities: number;
    equity: number;
    assetAccounts: Array<{ name: string; balance: number }>;
    liabilityAccounts: Array<{ name: string; balance: number }>;
    equityAccounts: Array<{ name: string; balance: number }>;
  }> {
    const dateFilter = asOfDate ? { date: { lte: asOfDate } } : {};

    const lines = await prisma.journalLine.findMany({
      where: {
        journal: dateFilter,
        account: { shopId },
      },
      include: { account: true },
    });

    const accountBalances = new Map<string, number>();

    for (const line of lines) {
      const account = line.account;
      const type = account.type as AccountType;
      let balanceChange = 0;

      if (type === 'ASSET' || type === 'EXPENSE') {
        balanceChange = line.debit - line.credit;
      } else {
        balanceChange = line.credit - line.debit;
      }

      accountBalances.set(account.id, (accountBalances.get(account.id) || 0) + balanceChange);
    }

    const accounts = await prisma.account.findMany({
      where: { shopId },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assetAccounts: Array<{ name: string; balance: number }> = [];
    const liabilityAccounts: Array<{ name: string; balance: number }> = [];
    const equityAccounts: Array<{ name: string; balance: number }> = [];

    for (const account of accounts) {
      const balance = accountBalances.get(account.id) || 0;
      const type = account.type as AccountType;

      if (type === 'ASSET') {
        totalAssets += balance;
        assetAccounts.push({ name: account.name, balance });
      } else if (type === 'LIABILITY') {
        totalLiabilities += balance;
        liabilityAccounts.push({ name: account.name, balance });
      } else if (type === 'EQUITY') {
        totalEquity += balance;
        equityAccounts.push({ name: account.name, balance });
      }
    }

    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity,
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
    };
  }

  /**
   * إنشاء حساب جديد
   */
  static async createAccount(
    shopId: string,
    code: string,
    name: string,
    type: AccountType
  ): Promise<string> {
    const account = await prisma.account.create({
      data: {
        shopId,
        code,
        name,
        type,
        balance: 0,
      },
    });

    logger.info(`[Accounting] Account created: ${account.id} (${code})`);
    return account.id;
  }

  /**
   * قيد تلقائي عند بيع
   */
  static async recordSale(
    shopId: string,
    orderId: string,
    amount: number,
    cashAccountId: string,
    revenueAccountId: string
  ): Promise<string> {
    return this.createJournalEntry(shopId, {
      description: `Sale - Order ${orderId}`,
      lines: [
        { accountId: cashAccountId, debit: amount, credit: 0 },
        { accountId: revenueAccountId, debit: 0, credit: amount },
      ],
    });
  }

  /**
   * قيد تلقائي عند شراء
   */
  static async recordPurchase(
    shopId: string,
    purchaseOrderId: string,
    amount: number,
    expenseAccountId: string,
    cashAccountId: string
  ): Promise<string> {
    return this.createJournalEntry(shopId, {
      description: `Purchase - PO ${purchaseOrderId}`,
      lines: [
        { accountId: expenseAccountId, debit: amount, credit: 0 },
        { accountId: cashAccountId, debit: 0, credit: amount },
      ],
    });
  }

  /**
   * قيد تلقائي عند دفع راتب
   */
  static async recordSalaryPayment(
    shopId: string,
    employeeId: string,
    amount: number,
    expenseAccountId: string,
    cashAccountId: string
  ): Promise<string> {
    return this.createJournalEntry(shopId, {
      description: `Salary Payment - Employee ${employeeId}`,
      lines: [
        { accountId: expenseAccountId, debit: amount, credit: 0 },
        { accountId: cashAccountId, debit: 0, credit: amount },
      ],
    });
  }

  /**
   * قيد تلقائي عند دفع عمولة
   */
  static async recordCommissionPayment(
    shopId: string,
    amount: number,
    expenseAccountId: string,
    cashAccountId: string
  ): Promise<string> {
    return this.createJournalEntry(shopId, {
      description: 'Commission Payment',
      lines: [
        { accountId: expenseAccountId, debit: amount, credit: 0 },
        { accountId: cashAccountId, debit: 0, credit: amount },
      ],
    });
  }
}

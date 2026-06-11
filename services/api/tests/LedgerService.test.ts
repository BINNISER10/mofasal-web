import { LedgerService } from '../src/services/LedgerService';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    account: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    journalEntry: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

describe('LedgerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postEntry validation', () => {
    it('should throw an error if lines are fewer than 2', async () => {
      await expect(
        LedgerService.postEntry('shop-1', {
          description: 'Test Entry',
          lines: [{ accountCode: '1000', debit: 100 }],
        })
      ).rejects.toThrow('A journal entry requires at least two lines');
    });

    it('should throw an error if debit does not equal credit', async () => {
      await expect(
        LedgerService.postEntry('shop-1', {
          description: 'Unbalanced Entry',
          lines: [
            { accountCode: '1000', debit: 100, credit: 0 },
            { accountCode: '4000', debit: 0, credit: 90 },
          ],
        })
      ).rejects.toThrow('Journal entry is not balanced');
    });

    it('should throw an error if total is 0', async () => {
      await expect(
        LedgerService.postEntry('shop-1', {
          description: 'Zero Entry',
          lines: [
            { accountCode: '1000', debit: 0, credit: 0 },
            { accountCode: '4000', debit: 0, credit: 0 },
          ],
        })
      ).rejects.toThrow('Journal entry total cannot be zero');
    });
  });

  describe('ensureChartOfAccounts', () => {
    it('should query existing accounts and create missing ones', async () => {
      const mockExisting = [{ code: '1000' }, { code: '1010' }];
      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockExisting);
      (prisma.account.createMany as jest.Mock).mockResolvedValue({ count: 8 });

      await LedgerService.ensureChartOfAccounts('shop-1');

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        where: { shopId: 'shop-1' },
        select: { code: true },
      });
      expect(prisma.account.createMany).toHaveBeenCalled();
    });
  });
});

import { apiClient } from './client';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface JournalLine {
  id: string;
  debit: number;
  credit: number;
  account: { code: string; name: string; type: string };
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  lines: JournalLine[];
}

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
}

export interface PostEntryInput {
  description: string;
  date?: string;
  lines: { accountCode: string; debit?: number; credit?: number }[];
}

export const accountingApi = {
  getAccounts: (): Promise<Account[]> =>
    apiClient.get<Account[]>('/accounting/accounts'),

  seedAccounts: (): Promise<Account[]> =>
    apiClient.post<Account[]>('/accounting/accounts/seed'),

  getJournal: (params?: Record<string, string>): Promise<JournalEntry[]> =>
    apiClient.get<JournalEntry[]>('/accounting/journal', { params }),

  postEntry: (data: PostEntryInput): Promise<JournalEntry> =>
    apiClient.post<JournalEntry>('/accounting/journal', data),

  getTrialBalance: (): Promise<TrialBalance> =>
    apiClient.get<TrialBalance>('/accounting/trial-balance'),
};

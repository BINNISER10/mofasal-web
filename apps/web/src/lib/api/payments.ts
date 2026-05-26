import { apiClient } from './client';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: PaymentMethod;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  referenceId: string;
  customerName: string;
  customerPhone: string;
  description: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'MADA'
  | 'VISA'
  | 'MASTERCARD'
  | 'APPLE_PAY'
  | 'STC_PAY'
  | 'TAMARA'
  | 'TABBY'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER';

interface TransactionsResponse {
  transactions: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
}

interface PaymentResponse {
  transaction: PaymentTransaction;
  redirectUrl?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

export const paymentsApi = {
  processPayment: async (data: {
    orderId: string;
    method: PaymentMethod;
    amount: number;
  }): Promise<PaymentResponse> => {
    const transaction = await apiClient.post<PaymentTransaction>('/payments/process', data);
    return { transaction };
  },

  getTransactions: async (params?: Record<string, string>): Promise<TransactionsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/payments/transactions', { params });
    return { transactions: data.items as PaymentTransaction[], total: data.total, page: data.page, limit: data.limit };
  },

  getTransaction: async (id: string): Promise<{ transaction: PaymentTransaction }> => {
    const transaction = await apiClient.get<PaymentTransaction>(`/payments/transactions/${id}`);
    return { transaction };
  },

  getInvoices: async (params?: Record<string, string>): Promise<{ invoices: Invoice[]; total: number }> => {
    return apiClient.get<{ invoices: Invoice[]; total: number }>('/payments/invoices', { params });
  },

  getInvoice: async (id: string): Promise<{ invoice: Invoice }> => {
    const invoice = await apiClient.get<Invoice>(`/payments/invoices/${id}`);
    return { invoice };
  },

  refund: async (transactionId: string, reason: string): Promise<PaymentResponse> => {
    const transaction = await apiClient.post<PaymentTransaction>('/payments/refund', { transactionId, reason });
    return { transaction };
  },
};

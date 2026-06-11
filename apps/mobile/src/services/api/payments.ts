import apiClient from './client';
import { ENDPOINTS } from './config';

export type PaymentMethod =
  | 'mada'
  | 'visa'
  | 'mastercard'
  | 'apple_pay'
  | 'google_pay'
  | 'stc_pay'
  | 'tamara'
  | 'tabby'
  | 'sadad'
  | 'bank_transfer'
  | 'cod';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  nameAr: string;
  icon: string;
  enabled: boolean;
}

export interface ProcessPaymentRequest {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolder: string;
  };
  stcPayPhone?: string;
  installmentPlan?: {
    provider: 'tamara' | 'tabby';
    installments: number;
  };
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  referenceNumber?: string;
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  referenceNumber?: string;
  redirectUrl?: string;
  qrCode?: string;
  message: string;
}

export const paymentsApi = {
  process: async (data: ProcessPaymentRequest): Promise<PaymentResult> => {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS.PROCESS, data);
    return response.data as PaymentResult;
  },

  getMethods: async (): Promise<PaymentMethodInfo[]> => {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS.METHODS);
    return response.data as PaymentMethodInfo[];
  },

  getTransactions: async (): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS.TRANSACTIONS);
    return response.data as PaymentTransaction[];
  },

  confirmPayment: async (transactionId: string): Promise<PaymentResult> => {
    const response = await apiClient.post(ENDPOINTS.PAYMENTS.CONFIRM, {
      transactionId,
    });
    return response.data as PaymentResult;
  },
};

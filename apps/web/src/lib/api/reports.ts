import { apiClient } from './client';

export interface ReportSummary {
  totalRevenue: number;
  totalVat: number;
  totalOrders: number;
  paidOrders: number;
  avgOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  statusBreakdown: Record<string, number>;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface PaymentBreakdown {
  method: string;
  revenue: number;
  count: number;
}

export interface ReportOverview {
  summary: ReportSummary;
  salesTrend: SalesTrendPoint[];
  topProducts: TopProduct[];
  paymentBreakdown: PaymentBreakdown[];
}

export const reportsApi = {
  getOverview: (params?: Record<string, string>): Promise<ReportOverview> =>
    apiClient.get<ReportOverview>('/reports/overview', { params }),

  getSummary: (params?: Record<string, string>): Promise<ReportSummary> =>
    apiClient.get<ReportSummary>('/reports/summary', { params }),

  getSalesTrend: (params?: Record<string, string>): Promise<SalesTrendPoint[]> =>
    apiClient.get<SalesTrendPoint[]>('/reports/sales-trend', { params }),

  getTopProducts: (params?: Record<string, string>): Promise<TopProduct[]> =>
    apiClient.get<TopProduct[]>('/reports/top-products', { params }),

  getPaymentBreakdown: (params?: Record<string, string>): Promise<PaymentBreakdown[]> =>
    apiClient.get<PaymentBreakdown[]>('/reports/payments', { params }),
};

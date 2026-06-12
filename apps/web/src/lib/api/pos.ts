import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  stockQuantity: number;
  category?: { id: string; name: string; nameAr?: string };
  sku: string;
  images: string[];
}

export interface CartItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface POSSession {
  id: string;
  shopId: string;
  cashierId: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalRefunds: number;
  notes?: string;
}

export interface POSOrder {
  id: string;
  sessionId: string;
  orderId?: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export const posApi = {
  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    return apiClient.get<Product[]>('/pos/products', { params });
  },

  // Sessions
  openSession: async (openingBalance?: number): Promise<POSSession> => {
    return apiClient.post<POSSession>('/pos/sessions', { openingBalance });
  },

  closeSession: async (sessionId: string, closingBalance: number): Promise<POSSession> => {
    return apiClient.post<POSSession>(`/pos/sessions/${sessionId}/close`, { closingBalance });
  },

  getSessions: async (params?: { page?: number; limit?: number }): Promise<{
    items: POSSession[];
    total: number;
    page: number;
    limit: number;
  }> => {
    return apiClient.get('/pos/sessions', { params });
  },

  getSession: async (sessionId: string): Promise<POSSession> => {
    return apiClient.get<POSSession>(`/pos/sessions/${sessionId}`);
  },

  // Orders
  createOrder: async (sessionId: string, input: {
    customerId?: string;
    items: CartItem[];
    paymentMethod?: string;
    notes?: string;
  }): Promise<POSOrder> => {
    return apiClient.post<POSOrder>(`/pos/sessions/${sessionId}/orders`, input);
  },

  getOrders: async (sessionId: string): Promise<POSOrder[]> => {
    return apiClient.get<POSOrder[]>(`/pos/sessions/${sessionId}/orders`);
  },
};

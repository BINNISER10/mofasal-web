import { apiClient } from './client';

export interface PurchaseOrder {
  id: string;
  shopId: string;
  supplierId?: string;
  supplier?: { id: string; name: string; nameAr?: string };
  orderNumber: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  expectedDate?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId?: string;
    name: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
}

export interface CreatePurchaseOrderInput {
  supplierId?: string;
  expectedDate?: string;
  notes?: string;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export const procurementApi = {
  getPurchaseOrders: async (params?: { page?: number; limit?: number }): Promise<{
    items: PurchaseOrder[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    return apiClient.get('/procurement', { params: queryParams });
  },

  createPurchaseOrder: async (input: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
    return apiClient.post<PurchaseOrder>('/procurement', input);
  },

  updateStatus: async (id: string, status: string): Promise<PurchaseOrder> => {
    return apiClient.put<PurchaseOrder>(`/procurement/${id}/status`, { status });
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    return apiClient.get<PurchaseOrder>(`/procurement/${id}`);
  },

  deletePurchaseOrder: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/procurement/${id}`);
  },
};

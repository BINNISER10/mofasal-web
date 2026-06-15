import { apiClient } from './client';

export interface FabricSupplyOrderItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  product?: { id: string; name: string; nameAr?: string };
}

export interface FabricSupplyOrder {
  id: string;
  orderNumber: string;
  merchantShopId: string;
  buyerShopId: string;
  buyerUserId: string;
  linkedOrderId?: string;
  deliveryTarget: 'TAILOR_SHOP' | 'CUSTOMER_HOME';
  deliveryAddress?: { label?: string; street?: string; district?: string; city?: string };
  status: 'PENDING' | 'CONFIRMED' | 'ON_WAY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  notes?: string;
  deliveredAt?: string;
  createdAt: string;
  items: FabricSupplyOrderItem[];
  merchantShop?: { id: string; name: string; nameAr?: string; city?: string; phone?: string; address?: string };
  buyerShop?: { id: string; name: string; nameAr?: string; city?: string; phone?: string; address?: string };
  buyerUser?: { id: string; name: string; phone?: string };
  linkedOrder?: { id: string; orderNumber: string; status?: string };
}

export interface FabricMerchant {
  id: string;
  name: string;
  nameAr?: string;
  city?: string;
  rating?: number;
  _count?: { products: number };
}

export const b2bApi = {
  listMerchants: (): Promise<FabricMerchant[]> =>
    apiClient.get<FabricMerchant[]>('/b2b/merchants'),

  list: (params?: Record<string, string>): Promise<{ items: FabricSupplyOrder[]; total: number; page: number; limit: number }> =>
    apiClient.get<{ items: FabricSupplyOrder[]; total: number; page: number; limit: number }>('/b2b', { params }),

  getById: (id: string): Promise<FabricSupplyOrder> =>
    apiClient.get<FabricSupplyOrder>(`/b2b/${id}`),

  create: (data: {
    merchantShopId: string;
    items: Array<{ productId: string; quantity: number }>;
    deliveryTarget?: 'TAILOR_SHOP' | 'CUSTOMER_HOME';
    deliveryAddress?: { label?: string; street?: string; district?: string; city?: string };
    linkedOrderId?: string;
    notes?: string;
  }): Promise<{ order: FabricSupplyOrder }> =>
    apiClient.post<FabricSupplyOrder>('/b2b', data).then((order) => ({ order })),

  updateStatus: (id: string, status: FabricSupplyOrder['status']): Promise<FabricSupplyOrder> =>
    apiClient.patch<FabricSupplyOrder>(`/b2b/${id}/status`, { status }),
};

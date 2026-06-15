import { apiClient } from './client';
import { mapPaymentMethod } from '@mufasal/shared';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  merchantId?: string;
  fabricId?: string;
  fabricName?: string;
  fabricPrice?: number;
  status: OrderStatus;
  items: OrderItem[];
  measurements: MeasurementData;
  totalAmount: number;
  deliveryFee: number;
  vatAmount: number;
  grandTotal: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED' | 'FAILED';
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: Address;
  notes?: string;
  staffId?: string;
  staffName?: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  tracking: TrackingEntry[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'STAFF_ON_WAY'
  | 'TAKING_MEASUREMENTS'
  | 'CUTTING_FABRIC'
  | 'SEWING_ASSEMBLY'
  | 'IRONING_FINISHING'
  | 'PACKING_WRAPPING'
  | 'ON_WAY_TO_CUSTOMER'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'tailoring' | 'fabric' | 'accessory';
}

export interface MeasurementData {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulderWidth?: number;
  sleeveLength?: number;
  armLength?: number;
  neckCircumference?: number;
  shirtLength?: number;
  thighCircumference?: number;
  pantLength?: number;
  inseam?: number;
  outseam?: number;
  kneeCircumference?: number;
  ankleCircumference?: number;
  bicepsCircumference?: number;
  wristCircumference?: number;
  notes?: string;
}

export interface Address {
  label: string;
  street: string;
  district: string;
  city: string;
  building?: string;
  apartment?: string;
  lat?: number;
  lng?: number;
}

export interface TrackingEntry {
  id: string;
  status: OrderStatus;
  note?: string;
  updatedBy: string;
  updatedByName: string;
  timestamp: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

interface OrderResponse {
  order: Order;
}

interface CreateOrderRequest {
  shopId: string;
  fabricId?: string;
  fabricSource?: 'shop' | 'marketplace';
  measurements?: MeasurementData | Record<string, number>;
  items: Array<{ name: string; quantity: number; price?: number; unitPrice?: number; type?: string }>;
  deliveryAddress?: Address;
  deliveryMethod?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  paymentMethod?: string;
  totalAmount?: number;
}

interface UpdateStatusRequest {
  status: OrderStatus;
  note?: string;
}

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const itemsTotal = data.items.reduce(
      (sum, i) => sum + i.quantity * (i.unitPrice ?? i.price ?? 0),
      0
    );
    const payload = {
      shopId: data.shopId,
      fabricId: data.fabricId,
      fabricSource: data.fabricSource,
      totalAmount: data.totalAmount ?? itemsTotal,
      customerNotes: data.notes,
      paymentMethod: data.paymentMethod ? mapPaymentMethod(data.paymentMethod) : undefined,
      measurements: data.measurements
        ? Object.fromEntries(
            Object.entries(data.measurements)
              .filter(([, v]) => v !== undefined && v !== null && v !== '')
              .map(([k, v]) => [k, typeof v === 'number' ? v : parseFloat(String(v))])
              .filter(([, v]) => !Number.isNaN(v))
          )
        : undefined,
      deliveryAddress: data.deliveryAddress
        ? {
            label: data.deliveryAddress.label || 'عنوان العميل',
            street: data.deliveryAddress.street,
            district: data.deliveryAddress.district || '',
            city: data.deliveryAddress.city,
          }
        : undefined,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
      items: data.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice ?? i.price ?? 0,
      })),
    };
    const order = await apiClient.post<Order>('/orders', payload);
    return { order };
  },

  list: async (params?: Record<string, string>): Promise<OrdersResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/orders', { params });
    return { orders: data.items as Order[], total: data.total, page: data.page, limit: data.limit };
  },

  getById: async (id: string): Promise<OrderResponse> => {
    const order = await apiClient.get<Order>(`/orders/${id}`);
    return { order };
  },

  getByCustomer: async (customerId: string, params?: Record<string, string>): Promise<OrdersResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>(`/orders/customer/${customerId}`, { params });
    return { orders: data.items as Order[], total: data.total, page: data.page, limit: data.limit };
  },

  getByShop: async (shopId: string, params?: Record<string, string>): Promise<OrdersResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>(`/orders/shop/${shopId}`, { params });
    return { orders: data.items as Order[], total: data.total, page: data.page, limit: data.limit };
  },

  updateStatus: async (id: string, data: UpdateStatusRequest): Promise<OrderResponse> => {
    const order = await apiClient.patch<Order>(`/orders/${id}/status`, data);
    return { order };
  },

  assignStaff: async (id: string, staffId: string): Promise<OrderResponse> => {
    const order = await apiClient.patch<Order>(`/orders/${id}/assign`, { staffId });
    return { order };
  },

  cancel: async (id: string, reason?: string): Promise<OrderResponse> => {
    const order = await apiClient.post<Order>(`/orders/${id}/cancel`, { reason });
    return { order };
  },

  getTracking: async (id: string): Promise<{ tracking: TrackingEntry[] }> => {
    return apiClient.get<{ tracking: TrackingEntry[] }>(`/orders/${id}/tracking`);
  },

  getConfirmation: async (token: string): Promise<any> => {
    return apiClient.get(`/orders/confirm/${token}`);
  },

  approveConfirmation: async (token: string): Promise<any> => {
    return apiClient.post(`/orders/confirm/${token}/approve`);
  },

  requestChanges: async (token: string, notes: string): Promise<any> => {
    return apiClient.post(`/orders/confirm/${token}/changes`, { notes });
  },
};

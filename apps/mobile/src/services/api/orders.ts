import apiClient from './client';
import { ENDPOINTS } from './config';

export interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  fabricType?: string;
  color?: string;
  pattern?: string;
}

export interface MeasurementData {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  bicep?: number;
  forearm?: number;
  wrist?: number;
  sleeveLength?: number;
  shirtLength?: number;
  waistLower?: number;
  hips?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  inseam?: number;
  outseam?: number;
  trouserLength?: number;
}

export interface CreateOrderRequest {
  shopId: string;
  serviceType: string;
  items?: OrderItem[];
  measurements?: MeasurementData;
  measurementId?: string;
  fabricId?: string;
  deliveryAddressId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  paymentMethod: string;
}

export interface OrderStatusUpdate {
  status: string;
  timestamp: string;
  description?: string;
}

export interface TrackingStep {
  status: string;
  label: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  serviceType: string;
  status: string;
  items: OrderItem[];
  measurements?: MeasurementData;
  totalAmount: number;
  subtotal: number;
  vat: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  confirmedDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tracking: TrackingStep[];
}

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CREATE, data);
    return response.data as Order;
  },

  list: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Order[]> => {
    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST, { params });
    return response.data as Order[];
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAILS(id));
    return response.data as Order;
  },

  updateStatus: async (
    id: string,
    status: string,
  ): Promise<Order> => {
    const response = await apiClient.patch(ENDPOINTS.ORDERS.STATUS(id), {
      status,
    });
    return response.data as Order;
  },

  getTracking: async (id: string): Promise<TrackingStep[]> => {
    const response = await apiClient.get(ENDPOINTS.ORDERS.TRACKING(id));
    return response.data as TrackingStep[];
  },

  submitConfirmation: async (
    id: string,
    data: { confirmed: boolean; changesRequested?: string },
  ): Promise<Order> => {
    const response = await apiClient.post(ENDPOINTS.ORDERS.CONFIRM(id), data);
    return response.data as Order;
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.ORDERS.CANCEL(id));
  },
};

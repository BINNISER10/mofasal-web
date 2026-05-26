import { apiClient } from './client';

export interface DeliveryRequest {
  id: string;
  orderId: string;
  provider: DeliveryProvider;
  status: DeliveryStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  estimatedTime: number;
  actualTime?: number;
  cost: number;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  vehicleType?: string;
  plateNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryProvider =
  | 'SHOP_VEHICLE'
  | 'UBER'
  | 'CAREEN'
  | 'JEENY'
  | 'SMSA'
  | 'ARAMEX';

type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

interface DeliveryResponse {
  delivery: DeliveryRequest;
}

interface TrackDeliveryResponse {
  delivery: DeliveryRequest;
  tracking: { lat: number; lng: number; timestamp: string }[];
}

export const deliveryApi = {
  create: async (data: {
    orderId: string;
    provider: DeliveryProvider;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
  }): Promise<DeliveryResponse> => {
    const delivery = await apiClient.post<DeliveryRequest>('/delivery', data);
    return { delivery };
  },

  track: async (id: string): Promise<TrackDeliveryResponse> => {
    const data = await apiClient.get<{ delivery: DeliveryRequest; tracking: any[] }>(`/delivery/${id}/track`);
    return data as TrackDeliveryResponse;
  },

  getProviders: async (): Promise<{ providers: DeliveryProvider[] }> => {
    return apiClient.get<{ providers: DeliveryProvider[] }>('/delivery/providers');
  },

  cancel: async (id: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/delivery/${id}/cancel`);
  },
};

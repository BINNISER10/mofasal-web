import apiClient from './client';
import { ENDPOINTS } from './config';

export type DeliveryProvider = 'shop_vehicle' | 'uber' | 'careen' | 'jeeny' | 'smsa' | 'aramex';

export interface CreateDeliveryRequest {
  orderId: string;
  pickupAddress: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffAddress: {
    lat: number;
    lng: number;
    address: string;
  };
  preferredProvider?: DeliveryProvider;
}

export interface DeliveryEstimatedFee {
  provider: DeliveryProvider;
  providerName: string;
  fee: number;
  estimatedMinutes: number;
  available: boolean;
}

export interface DeliveryTracking {
  provider: DeliveryProvider;
  providerName: string;
  status: string;
  driverName?: string;
  driverPhone?: string;
  vehicleType?: string;
  plateNumber?: string;
  currentLat?: number;
  currentLng?: number;
  estimatedMinutes: number;
  trackingUrl?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  provider: DeliveryProvider;
  status: string;
  fee: number;
  driverName?: string;
  driverPhone?: string;
  tracking: DeliveryTracking;
  createdAt: string;
}

export const deliveryApi = {
  create: async (data: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await apiClient.post(ENDPOINTS.DELIVERY.CREATE, data);
    return response.data as Delivery;
  },

  track: async (id: string): Promise<DeliveryTracking> => {
    const response = await apiClient.get(ENDPOINTS.DELIVERY.TRACK(id));
    return response.data as DeliveryTracking;
  },

  getProviders: async (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<DeliveryEstimatedFee[]> => {
    const response = await apiClient.get(ENDPOINTS.DELIVERY.PROVIDERS, {
      params: { pickupLat, pickupLng, dropoffLat, dropoffLng },
    });
    return response.data as DeliveryEstimatedFee[];
  },

  estimateFee: async (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<DeliveryEstimatedFee[]> => {
    const response = await apiClient.post(ENDPOINTS.DELIVERY.ESTIMATE, {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    });
    return response.data as DeliveryEstimatedFee[];
  },
};

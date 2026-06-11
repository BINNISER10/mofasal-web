import { apiClient } from './client';

export interface ServiceRequest {
  id: string;
  shopId: string;
  customerId: string;
  serviceType: string;
  status: string;
  locationType?: string;
  addressId?: string;
  customAddress?: string;
  lat?: number;
  lng?: number;
  scheduledDate?: string;
  preferredTime?: string;
  notes?: string;
  createdAt: string;
}

interface ServiceRequestResponse {
  service: ServiceRequest;
}

export const servicesApi = {
  create: async (data: {
    shopId: string;
    serviceType: string;
    customAddress?: string;
    lat?: number;
    lng?: number;
    scheduledDate?: string;
    preferredTime?: string;
    notes?: string;
  }): Promise<ServiceRequestResponse> => {
    const service = await apiClient.post<ServiceRequest>('/services', data);
    return { service };
  },
};

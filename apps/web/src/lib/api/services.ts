import { apiClient } from './client';

export interface ServiceRequest {
  id: string;
  shopId: string;
  customerId: string;
  representativeId?: string;
  serviceType: string;
  status: string;
  locationType?: string;
  addressId?: string;
  customAddress?: string;
  lat?: number;
  lng?: number;
  repLat?: number;
  repLng?: number;
  distanceKm?: number;
  estimatedArrivalMin?: number;
  scheduledDate?: string;
  preferredTime?: string;
  notes?: string;
  assignedAt?: string;
  arrivedAt?: string;
  createdAt: string;
  customer?: { id: string; name: string; phone: string };
  shop?: { id: string; name: string; nameAr?: string; logo?: string };
  representative?: { id: string; name: string; phone: string; avatar?: string };
}

export interface ServiceRequestResponse {
  service: ServiceRequest;
}

export interface AvailableRep {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
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

  getAvailableReps: async (shopId: string): Promise<AvailableRep[]> => {
    return apiClient.get<AvailableRep[]>('/services/reps/available', { params: { shopId } });
  },

  list: async (params?: { status?: string }): Promise<ServiceRequest[]> => {
    const query = params?.status ? `?status=${params.status}` : '';
    return apiClient.get<any[]>(`/services${query}`).then(d => d as unknown as ServiceRequest[]);
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    return apiClient.get<ServiceRequest>(`/services/${id}`);
  },

  getTracking: async (id: string): Promise<any> => {
    return apiClient.get<any>(`/services/${id}/tracking`);
  },

  dispatch: async (id: string): Promise<any> => {
    return apiClient.post<any>(`/services/${id}/dispatch`, {});
  },

  updateLocation: async (id: string, lat: number, lng: number): Promise<any> => {
    return apiClient.patch<any>(`/services/${id}/location`, { lat, lng });
  },

  markArrived: async (id: string): Promise<any> => {
    return apiClient.patch<any>(`/services/${id}/arrive`, {});
  },

  update: async (id: string, data: Record<string, any>): Promise<any> => {
    return apiClient.put<any>(`/services/${id}`, data);
  },

  complete: async (id: string, data: {
    measurements: Record<string, number>;
    notes?: string;
    garmentType?: string;
    fabricId?: string;
    fabricSource?: string;
  }): Promise<any> => {
    return apiClient.post<any>(`/services/${id}/complete`, data);
  },
};

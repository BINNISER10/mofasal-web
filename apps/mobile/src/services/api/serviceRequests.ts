import apiClient from './client';

const BASE = '/services';

export type ServiceRequestType =
  | 'ON_SITE_MEASUREMENT'
  | 'IN_SHOP_MEASUREMENT'
  | 'TAILORING'
  | 'ALTERATION'
  | 'CONSULTATION';

export interface CreateServiceRequest {
  shopId: string;
  serviceType: ServiceRequestType;
  locationType?: 'HOME' | 'WORK' | 'OTHER' | 'SHOP_VISIT';
  customAddress?: string;
  lat?: number;
  lng?: number;
  scheduledDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RepresentativeInfo {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
}

export interface ServiceRequest {
  id: string;
  shopId: string;
  serviceType: string;
  status: string;
  lat?: number;
  lng?: number;
  repLat?: number;
  repLng?: number;
  distanceKm?: number;
  estimatedArrivalMin?: number;
  createdAt: string;
}

export interface TrackingData {
  id: string;
  status: string;
  serviceType: string;
  customerLocation: GeoPoint | null;
  representativeLocation: GeoPoint | null;
  distanceKm: number | null;
  estimatedArrivalMin: number | null;
  assignedAt: string | null;
  arrivedAt: string | null;
  representative: RepresentativeInfo | null;
  shop: { id: string; name: string; nameAr?: string } | null;
}

export const serviceRequestsApi = {
  create: async (data: CreateServiceRequest): Promise<ServiceRequest> => {
    const response = await apiClient.post(BASE, data);
    return response.data as ServiceRequest;
  },

  list: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get(BASE);
    const data = response.data as any;
    if (Array.isArray(data)) return data as ServiceRequest[];
    return (data?.items as ServiceRequest[]) || [];
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient.get(`${BASE}/${id}`);
    return response.data as ServiceRequest;
  },

  // توزيع تلقائي لأقرب مندوب
  dispatch: async (id: string): Promise<{ request: ServiceRequest; representative: RepresentativeInfo }> => {
    const response = await apiClient.post(`${BASE}/${id}/dispatch`);
    return response.data as { request: ServiceRequest; representative: RepresentativeInfo };
  },

  // تتبّع لحظي للعميل
  getTracking: async (id: string): Promise<TrackingData> => {
    const response = await apiClient.get(`${BASE}/${id}/tracking`);
    return response.data as TrackingData;
  },

  // تحديث موقع المندوب (يستخدمه تطبيق المندوب)
  updateLocation: async (id: string, lat: number, lng: number): Promise<ServiceRequest> => {
    const response = await apiClient.patch(`${BASE}/${id}/location`, { lat, lng });
    return response.data as ServiceRequest;
  },

  // تعليم الوصول
  markArrived: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient.patch(`${BASE}/${id}/arrive`);
    return response.data as ServiceRequest;
  },

  // تحديث كامل لبيانات وحالة طلب الخدمة
  update: async (id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const response = await apiClient.put(`${BASE}/${id}`, data);
    return response.data as ServiceRequest;
  },
};

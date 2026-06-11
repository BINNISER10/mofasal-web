import { apiClient } from './client';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  avatar?: string;
  status: string;
  createdAt: string;
  shopId?: string;
  shopName?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  district?: string;
  city: string;
  region?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface Measurement {
  id: string;
  name: string;
  data: Record<string, number>;
  createdAt: string;
}

interface UsersResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

interface AddressesResponse {
  addresses: Address[];
}

export const usersApi = {
  list: async (params?: Record<string, string>): Promise<UsersResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/users', { params });
    return { users: data.items as UserProfile[], total: data.total, page: data.page, limit: data.limit };
  },

  getById: async (id: string): Promise<{ user: UserProfile }> => {
    const user = await apiClient.get<UserProfile>(`/users/${id}`);
    return { user };
  },

  update: async (id: string, data: Partial<UserProfile>): Promise<{ user: UserProfile }> => {
    const user = await apiClient.put<UserProfile>(`/users/${id}`, data);
    return { user };
  },

  getAddresses: async (userId: string): Promise<AddressesResponse> => {
    return apiClient.get<AddressesResponse>(`/users/${userId}/addresses`);
  },

  createAddress: async (userId: string, data: Partial<Address>): Promise<{ address: Address }> => {
    const address = await apiClient.post<Address>(`/users/${userId}/addresses`, data);
    return { address };
  },

  updateAddress: async (userId: string, addressId: string, data: Partial<Address>): Promise<{ address: Address }> => {
    const address = await apiClient.put<Address>(`/users/${userId}/addresses/${addressId}`, data);
    return { address };
  },

  deleteAddress: async (userId: string, addressId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${userId}/addresses/${addressId}`);
  },

  getMeasurements: async (userId: string): Promise<{ measurements: Measurement[] }> => {
    return apiClient.get<{ measurements: Measurement[] }>(`/users/${userId}/measurements`);
  },

  createMeasurement: async (userId: string, data: { name: string; data: Record<string, number> }): Promise<{ measurement: Measurement }> => {
    const measurement = await apiClient.post<Measurement>(`/users/${userId}/measurements`, data);
    return { measurement };
  },

  updateMeasurement: async (userId: string, measurementId: string, data: Partial<Measurement>): Promise<{ measurement: Measurement }> => {
    const measurement = await apiClient.put<Measurement>(`/users/${userId}/measurements/${measurementId}`, data);
    return { measurement };
  },

  deleteMeasurement: async (userId: string, measurementId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${userId}/measurements/${measurementId}`);
  },
};

import apiClient from './client';

export interface UserAddress {
  id: string;
  userId: string;
  label?: string;
  street: string;
  district?: string;
  city: string;
  region?: string;
  country: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  label?: string;
  street: string;
  district?: string;
  city: string;
  region?: string;
  country?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export const addressesApi = {
  list: async (userId: string): Promise<UserAddress[]> => {
    const response = await apiClient.get(`/users/${userId}/addresses`);
    return response.data as UserAddress[];
  },

  create: async (userId: string, data: CreateAddressRequest): Promise<UserAddress> => {
    const response = await apiClient.post(`/users/${userId}/addresses`, data);
    return response.data as UserAddress;
  },

  update: async (userId: string, addressId: string, data: Partial<CreateAddressRequest>): Promise<UserAddress> => {
    const response = await apiClient.put(`/users/${userId}/addresses/${addressId}`, data);
    return response.data as UserAddress;
  },

  delete: async (userId: string, addressId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/addresses/${addressId}`);
  },
};

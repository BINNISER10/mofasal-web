import { apiClient } from './client';

export interface PricingTier {
  id: string;
  productId: string;
  productName?: string;
  minQuantity: number;
  discountPercent: number;
  b2bPrice?: number;
  b2cPrice?: number;
  isActive: boolean;
}

export const pricingApi = {
  getTiers: () => apiClient.get<PricingTier[]>('/pricing/tiers'),
  createTier: (data: {
    productId?: string;
    productName?: string;
    minQuantity: number;
    discountPercent: number;
    b2bPrice?: number;
    b2cPrice?: number;
  }) => apiClient.post<PricingTier>('/pricing/tiers', data),
  updateTier: (id: string, data: Partial<PricingTier>) =>
    apiClient.put<PricingTier>(`/pricing/tiers/${id}`, data),
  deleteTier: (id: string) => apiClient.delete<{ message: string }>(`/pricing/tiers/${id}`),
};

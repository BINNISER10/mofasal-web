import { apiClient } from './client';

export interface Shop {
  id: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  description: string;
  descriptionAr: string;
  descriptionEn?: string;
  logo: string;
  coverImage: string;
  ownerId: string;
  ownerName: string;
  phone: string;
  email: string;
  commercialRegister: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  orderCount: number;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  badges: ShopBadge[];
  workingHours: WorkingHours;
  services: string[];
  categories: string[];
  estimatedDeliveryTime: number;
  deliveryFee: number;
  minOrderAmount: number;
  commission: number;
  createdAt: string;
  distance?: number;
}

type ShopBadge = 'DISTINGUISHED' | 'TOP_RATED' | 'FASTEST' | 'TRUSTED';

interface WorkingHours {
  sat?: DayHours;
  sun?: DayHours;
  mon?: DayHours;
  tue?: DayHours;
  wed?: DayHours;
  thu?: DayHours;
  fri?: DayHours;
}

interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

interface ShopsResponse {
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
}

interface ShopResponse {
  shop: Shop;
}

export const shopsApi = {
  list: async (params?: Record<string, string>): Promise<ShopsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/shops', { params });
    return { shops: data.items as Shop[], total: data.total, page: data.page, limit: data.limit };
  },

  getById: async (id: string): Promise<ShopResponse> => {
    const shop = await apiClient.get<Shop>(`/shops/${id}`);
    return { shop };
  },

  search: async (query: string, params?: Record<string, string>): Promise<ShopsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/shops/search', { params: { q: query, ...params } });
    return { shops: data.items as Shop[], total: data.total, page: data.page, limit: data.limit };
  },

  getNearby: async (lat: number, lng: number, radius?: number): Promise<ShopsResponse> => {
    const params: Record<string, string> = { lat: lat.toString(), lng: lng.toString() };
    if (radius) params.radius = radius.toString();
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/shops/nearby', { params });
    return { shops: data.items as Shop[], total: data.total, page: data.page, limit: data.limit };
  },

  getFeatured: async (): Promise<ShopsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/shops/featured');
    return { shops: data.items as Shop[], total: data.total, page: data.page, limit: data.limit };
  },

  update: async (id: string, data: Partial<Shop>): Promise<ShopResponse> => {
    const shop = await apiClient.put<Shop>(`/shops/${id}`, data);
    return { shop };
  },

  verify: async (id: string): Promise<ShopResponse> => {
    const shop = await apiClient.patch<Shop>(`/shops/${id}/verify`);
    return { shop };
  },

  suspend: async (id: string): Promise<ShopResponse> => {
    const shop = await apiClient.patch<Shop>(`/shops/${id}/suspend`);
    return { shop };
  },

  activate: async (id: string): Promise<ShopResponse> => {
    const shop = await apiClient.patch<Shop>(`/shops/${id}/activate`);
    return { shop };
  },

  updateCommission: async (id: string, commission: number): Promise<ShopResponse> => {
    const shop = await apiClient.patch<Shop>(`/shops/${id}/commission`, { commission });
    return { shop };
  },

  getServices: async (shopId: string): Promise<ShopServiceItem[]> => {
    return apiClient.get<ShopServiceItem[]>(`/shops/${shopId}/services`);
  },
};

export interface ShopServiceItem {
  id: string;
  shopId: string;
  serviceType: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  duration?: number;
  isActive: boolean;
}

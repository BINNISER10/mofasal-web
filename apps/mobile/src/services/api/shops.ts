import apiClient from './client';
import { ENDPOINTS } from './config';

export interface ShopService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export interface ShopReview {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  shopRating?: number;
  tailorRating?: number;
  representativeRating?: number;
}

export interface Shop {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  logo: string;
  coverImage: string;
  rating: number;
  ratingCount: number;
  distance?: number;
  estimatedArrival?: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  phone: string;
  whatsapp?: string;
  openHours: Record<string, { open: string; close: string }>;
  isOpen: boolean;
  isFeatured: boolean;
  services: ShopService[];
  reviews: ShopReview[];
  tags: string[];
  deliveryTime?: string;
  minOrder?: number;
}

export interface ShopListParams {
  lat?: number;
  lng?: number;
  city?: string;
  search?: string;
  sortBy?: 'nearest' | 'rating' | 'fastest';
  page?: number;
  limit?: number;
  tags?: string[];
}

export const shopsApi = {
  list: async (params?: ShopListParams): Promise<Shop[]> => {
    const response = await apiClient.get(ENDPOINTS.SHOPS.LIST, { params });
    return response.data as Shop[];
  },

  getById: async (id: string): Promise<Shop> => {
    const response = await apiClient.get(ENDPOINTS.SHOPS.DETAILS(id));
    return response.data as Shop;
  },

  search: async (query: string, params?: ShopListParams): Promise<Shop[]> => {
    const response = await apiClient.get(ENDPOINTS.SHOPS.SEARCH, {
      params: { ...params, q: query },
    });
    return response.data as Shop[];
  },

  getNearby: async (
    lat: number,
    lng: number,
    radius?: number,
  ): Promise<Shop[]> => {
    const response = await apiClient.get(ENDPOINTS.SHOPS.NEARBY, {
      params: { lat, lng, radius: radius || 50 },
    });
    return response.data as Shop[];
  },

  getReviews: async (shopId: string): Promise<ShopReview[]> => {
    const response = await apiClient.get(ENDPOINTS.SHOPS.REVIEWS(shopId));
    return response.data as ShopReview[];
  },
};

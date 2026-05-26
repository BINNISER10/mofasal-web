import apiClient from './client';
import { ENDPOINTS } from './config';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  images: string[];
  price: number;
  unit: string;
  category: string;
  subcategory?: string;
  merchantId: string;
  merchantName: string;
  merchantLogo?: string;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  stockQuantity: number;
  colors?: string[];
  patterns?: string[];
  composition?: string;
  weight?: string;
  width?: string;
  careInstructions?: string;
  createdAt: string;
}

export interface ProductListParams {
  category?: string;
  search?: string;
  merchantId?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling';
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const productsApi = {
  list: async (params?: ProductListParams): Promise<Product[]> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data as Product[];
  },

  search: async (query: string, params?: ProductListParams): Promise<Product[]> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.SEARCH, {
      params: { ...params, q: query },
    });
    return response.data as Product[];
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAILS(id));
    return response.data as Product;
  },

  getByCategory: async (category: string, params?: ProductListParams): Promise<Product[]> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.CATEGORY(category), {
      params,
    });
    return response.data as Product[];
  },

  getByMerchant: async (merchantId: string): Promise<Product[]> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.MERCHANT(merchantId));
    return response.data as Product[];
  },
};

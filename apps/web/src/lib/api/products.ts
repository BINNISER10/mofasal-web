import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  description: string;
  descriptionAr: string;
  descriptionEn?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  minStock: number;
  category: string;
  images: string[];
  merchantId: string;
  merchantName: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  variants: ProductVariant[];
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

interface ProductResponse {
  product: Product;
}

export const productsApi = {
  list: async (params?: Record<string, string>): Promise<ProductsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/products', { params });
    return { products: data.items as Product[], total: data.total, page: data.page, limit: data.limit };
  },

  getById: async (id: string): Promise<ProductResponse> => {
    const product = await apiClient.get<Product>(`/products/${id}`);
    return { product };
  },

  search: async (query: string, params?: Record<string, string>): Promise<ProductsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/products/search', { params: { q: query, ...params } });
    return { products: data.items as Product[], total: data.total, page: data.page, limit: data.limit };
  },

  getByCategory: async (category: string, params?: Record<string, string>): Promise<ProductsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/products/category', { params: { category, ...params } });
    return { products: data.items as Product[], total: data.total, page: data.page, limit: data.limit };
  },

  getByMerchant: async (merchantId: string, params?: Record<string, string>): Promise<ProductsResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>(`/products/merchant/${merchantId}`, { params });
    return { products: data.items as Product[], total: data.total, page: data.page, limit: data.limit };
  },

  create: async (data: FormData): Promise<ProductResponse> => {
    const product = await apiClient.post<Product>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { product };
  },

  // إنشاء منتج بصيغة JSON (يطابق مخطط Express productSchema)
  createJson: async (data: {
    name: string; nameAr?: string; description?: string; price: number;
    compareAtPrice?: number; stockQuantity?: number; unit?: string;
    images?: string[]; tags?: string; categoryId?: string;
  }): Promise<ProductResponse> => {
    const product = await apiClient.post<Product>('/products', data);
    return { product };
  },

  update: async (id: string, data: FormData | Partial<Product>): Promise<ProductResponse> => {
    const product = await apiClient.put<Product>(`/products/${id}`, data);
    return { product };
  },

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/products/${id}`),

  adjustStock: async (
    id: string,
    type: 'IN' | 'OUT',
    quantity: number,
    notes?: string
  ): Promise<{ id: string; type: string; quantity: number }> => {
    return apiClient.post(`/products/${id}/stock`, { type, quantity, notes });
  },

  toggleVisibility: async (id: string): Promise<ProductResponse> => {
    const product = await apiClient.patch<Product>(`/products/${id}/visibility`);
    return { product };
  },
};

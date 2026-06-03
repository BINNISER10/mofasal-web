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

export interface CartItemData {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface CartData {
  id: string;
  userId: string;
  createdAt: string;
  items: CartItemData[];
}

// استخراج عناصر القائمة من استجابة Express المرقّمة {items,total,page,limit}
function toList<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.items)) return data.items as T[];
  return [];
}

export const productsApi = {
  list: async (params?: ProductListParams): Promise<Product[]> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });
    return toList<Product>(response.data);
  },

  search: async (query: string, params?: ProductListParams): Promise<Product[]> => {
    // Express: GET /products?search= (لا يوجد مسار /search منفصل)
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: { ...params, search: query },
    });
    return toList<Product>(response.data);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAILS(id));
    return response.data as Product;
  },

  getByCategory: async (category: string, params?: ProductListParams): Promise<Product[]> => {
    // Express: GET /products?category=
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: { ...params, category },
    });
    return toList<Product>(response.data);
  },

  getByMerchant: async (merchantId: string): Promise<Product[]> => {
    // Express: GET /products?merchantId=
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: { merchantId },
    });
    return toList<Product>(response.data);
  },

  getCategories: async (): Promise<any[]> => {
    const response = await apiClient.get('/products/categories/list');
    return response.data as any[];
  },

  getCart: async (): Promise<CartData> => {
    const response = await apiClient.get('/products/cart/my');
    return response.data as CartData;
  },

  addToCart: async (productId: string, quantity: number, variantId?: string): Promise<CartItemData> => {
    const response = await apiClient.post('/products/cart/add', { productId, quantity, variantId });
    return response.data as CartItemData;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<any> => {
    const response = await apiClient.put(`/products/cart/item/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/products/cart/item/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/products/cart/clear');
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data as Product;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data as Product;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

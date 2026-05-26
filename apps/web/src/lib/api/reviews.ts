import { apiClient } from './client';

export interface Review {
  id: string;
  orderId: string;
  shopRating?: number;
  tailorRating?: number;
  representativeRating?: number;
  shopReview?: string;
  tailorReview?: string;
  representativeReview?: string;
  createdAt: string;
}

interface ReviewResponse {
  review: Review;
}

interface ShopReviewsResponse {
  reviews: Review[];
  averageRating: number;
  total: number;
}

export const reviewsApi = {
  create: async (data: {
    orderId: string;
    shopRating?: number;
    tailorRating?: number;
    representativeRating?: number;
    shopReview?: string;
    tailorReview?: string;
    representativeReview?: string;
  }): Promise<ReviewResponse> => {
    const review = await apiClient.post<Review>('/reviews', data);
    return { review };
  },

  getByOrder: async (orderId: string): Promise<ReviewResponse> => {
    const review = await apiClient.get<Review>(`/reviews/order/${orderId}`);
    return { review };
  },

  update: async (orderId: string, data: Partial<Review>): Promise<ReviewResponse> => {
    const review = await apiClient.put<Review>(`/reviews/order/${orderId}`, data);
    return { review };
  },

  delete: async (orderId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/reviews/order/${orderId}`);
  },

  getShopReviews: async (shopId: string, params?: Record<string, string>): Promise<ShopReviewsResponse> => {
    return apiClient.get<ShopReviewsResponse>(`/reviews/shop/${shopId}`, { params });
  },

  getMyReviews: async (params?: Record<string, string>): Promise<{ reviews: Review[] }> => {
    return apiClient.get<{ reviews: Review[] }>('/reviews/my/reviews', { params });
  },
};

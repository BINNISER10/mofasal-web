import { apiClient } from './client';

export interface RecommendedProduct {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  images: string[];
  stockQuantity: number;
  recommendationScore?: number;
  shop?: { id: string; name: string; rating: number };
  category?: { id: string; name: string };
}

export interface RecommendationsResult {
  items: RecommendedProduct[];
  personalized: boolean;
  basedOn?: { topCategories: string[]; topShops: string[] };
}

export interface AIProfile {
  exists: boolean;
  insights: string;
  preferences: Record<string, any>;
  lastUpdated?: string;
}

export const aiApi = {
  logBehavior: (actionType: string, actionData?: Record<string, any>): Promise<{ queued: boolean }> =>
    apiClient.post<{ queued: boolean }>('/ai/behavior', { actionType, actionData }),

  getRecommendations: (limit?: number): Promise<RecommendationsResult> =>
    apiClient.get<RecommendationsResult>('/ai/recommendations', { params: limit ? { limit: String(limit) } : undefined }),

  getSimilar: (productId: string, limit?: number): Promise<RecommendedProduct[]> =>
    apiClient.get<RecommendedProduct[]>(`/ai/similar/${productId}`, { params: limit ? { limit: String(limit) } : undefined }),

  getProfile: (): Promise<AIProfile> =>
    apiClient.get<AIProfile>('/ai/profile'),
};

/**
 * Fire-and-forget behavior tracking. Never throws (analytics must not break UX).
 */
export function trackBehavior(actionType: string, actionData?: Record<string, any>): void {
  aiApi.logBehavior(actionType, actionData).catch(() => {});
}

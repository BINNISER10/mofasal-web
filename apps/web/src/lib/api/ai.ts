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
  strategy?: string;
  basedOn?: { topCategories: string[]; topShops: string[]; collaborative?: number };
}

export interface AIProfile {
  exists: boolean;
  insights: string;
  preferences: Record<string, any>;
  lastUpdated?: string;
}

export interface AdvisorResponse {
  answer: string;
  suggestions?: string[];
  relatedProducts?: any[];
  confidence: number;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface AIHealthCheck {
  configured: string;
  active: string;
  providers: {
    gemini: { available: boolean; free: boolean; limits: string };
    ollama: { available: boolean; free: boolean; running: boolean; modelAvailable: boolean };
    openai: { available: boolean; free: boolean };
    deepseek: { available: boolean; free: boolean; cost: string };
  };
  recommendation: string;
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

  // New AI features
  askAdvisor: (question: string, context?: Record<string, any>): Promise<AdvisorResponse> =>
    apiClient.post<AdvisorResponse>('/ai/ask', { question, context }),

  getTrending: (limit?: number): Promise<RecommendedProduct[]> =>
    apiClient.get<RecommendedProduct[]>('/ai/trending', { params: limit ? { limit: String(limit) } : undefined }),

  getShopRecommendations: (limit?: number): Promise<any[]> =>
    apiClient.get<any[]>('/ai/shops', { params: limit ? { limit: String(limit) } : undefined }),

  analyzeSentiment: (text: string): Promise<SentimentResult> =>
    apiClient.post<SentimentResult>('/ai/sentiment', { text }),

  healthCheck: (): Promise<AIHealthCheck> =>
    apiClient.get<AIHealthCheck>('/ai/health'),
};

/**
 * Fire-and-forget behavior tracking. Never throws (analytics must not break UX).
 */
export function trackBehavior(actionType: string, actionData?: Record<string, any>): void {
  aiApi.logBehavior(actionType, actionData).catch(() => {});
}

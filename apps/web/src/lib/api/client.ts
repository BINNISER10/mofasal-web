import { useAuthStore } from '@/lib/stores/authStore';
import { isDemoModeEnabled } from '@/lib/demoAuth';
import { getDemoApiResponse } from '@/lib/demoData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private isDemoSession(): boolean {
    const token = useAuthStore.getState().token;
    return isDemoModeEnabled() && !!token?.startsWith('demo-token');
  }

  private tryDemoResponse<T>(path: string, method = 'GET'): T | undefined {
    if (!isDemoModeEnabled()) return undefined;
    const demo = getDemoApiResponse(path, method);
    return demo !== undefined ? (demo as T) : undefined;
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, method = 'GET', ...restConfig } = config;

    if (this.isDemoSession()) {
      const demo = this.tryDemoResponse<T>(path, method);
      if (demo !== undefined) return demo;
    }

    const url = this.buildUrl(path, params);

    try {
      const response = await fetch(url, {
        ...restConfig,
        method,
        headers: {
          ...this.getHeaders(),
          ...restConfig.headers,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.detail || json.message || `HTTP ${response.status}`);
      }

      return json.data !== undefined ? json.data : json;
    } catch (error) {
      const demo = this.tryDemoResponse<T>(path, method);
      if (demo !== undefined) return demo;
      throw error;
    }
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(BASE_URL);

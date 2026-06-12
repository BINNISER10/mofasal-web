import { useAuthStore } from '@/lib/stores/authStore';
import { isDemoModeEnabled, isDemoToken } from '@/lib/demoAuth';
import { getDemoApiResponse } from '@/lib/demoData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
const FETCH_TIMEOUT_MS = 6000;

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return useAuthStore.getState().token
      ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
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

  private hasDemoToken(): boolean {
    return isDemoToken(this.getToken());
  }

  private isDemoSession(): boolean {
    return this.hasDemoToken() || isDemoModeEnabled();
  }

  private buildDemoPath(path: string, params?: Record<string, string>): string {
    if (!params || !Object.keys(params).length) return path;
    const qs = new URLSearchParams(params).toString();
    return `${path}?${qs}`;
  }

  private tryDemoResponse<T>(path: string, method = 'GET', body?: unknown): T | undefined {
    if (!this.isDemoSession()) return undefined;
    const demo = getDemoApiResponse(path, method, body);
    return demo !== undefined ? (demo as T) : undefined;
  }

  private shouldUseDemo(path: string): boolean {
    if (this.hasDemoToken()) return true;
    if (isDemoModeEnabled()) return true;
    return path.split('?')[0].startsWith('/auth/');
  }

  private async fetchWithTimeout(url: string, config: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      return await fetch(url, { ...config, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, method = 'GET', body: reqBody, ...restConfig } = config;
    const demoPath = this.buildDemoPath(path, params);
    const parsedBody = reqBody ? JSON.parse(typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody)) : undefined;

    if (this.shouldUseDemo(demoPath)) {
      const demo = this.tryDemoResponse<T>(demoPath, method, parsedBody);
      if (demo !== undefined) return demo;
      // في وضع العرض: أي mutation غير معرّفة تنجح بدلاً من كسر الأزرار
      if (this.isDemoSession() && method !== 'GET') {
        return { success: true, updated: true } as T;
      }
    }

    const url = this.buildUrl(path, params);

    try {
      const response = await this.fetchWithTimeout(url, {
        ...restConfig,
        method,
        body: reqBody,
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
      const demo = this.tryDemoResponse<T>(demoPath, method, parsedBody);
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

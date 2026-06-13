import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../storage/secureStorage';
import { API_BASE_URL, API_TIMEOUT, API_HEADERS } from './config';

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: API_HEADERS,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token not available
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    // فكّ غلاف Express الموحّد {success, message, data}
    const body = response.data as any;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // axios خام (بدون interceptor)، لذا نفكّ الغلاف يدوياً
        // Express يُرجع access_token / refresh_token (snake_case)
        const payload = (response.data?.data ?? response.data) as {
          access_token: string;
          refresh_token: string;
        };
        const accessToken = payload.access_token;
        const newRefreshToken = payload.refresh_token;
        await secureStorage.setItem('auth_token', accessToken);
        await secureStorage.setItem('refresh_token', newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await secureStorage.removeItem('auth_token');
        await secureStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = async (token: string) => {
  await secureStorage.setItem('auth_token', token);
};

export const setRefreshToken = async (token: string) => {
  await secureStorage.setItem('refresh_token', token);
};

export const clearTokens = async () => {
  await secureStorage.removeItem('auth_token');
  await secureStorage.removeItem('refresh_token');
};

export const getAuthToken = async (): Promise<string | null> => {
  return secureStorage.getItem('auth_token');
};

export default apiClient;

import { apiClient } from './client';

export interface AdminDashboardStats {
  totalUsers: number;
  totalShops: number;
  totalMerchants: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  recentUsers: any[];
  revenueByMonth: { name: string; value: number }[];
  ordersByStatus: { name: string; value: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  ordersCount: number;
}

export interface SiteConfig {
  key: string;
  value: string;
  type: string;
  category: string;
  label: string;
  labelAr: string;
  description?: string;
  descriptionAr?: string;
  isEnabled: boolean;
}

export interface Module {
  key: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  isEnabled: boolean;
  parentModuleKey?: string;
  order: number;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  getDashboard: async (): Promise<{ dashboard: AdminDashboardStats }> => {
    return apiClient.get<{ dashboard: AdminDashboardStats }>('/admin/dashboard');
  },

  getUsers: async (params?: Record<string, string>): Promise<UsersResponse> => {
    const data = await apiClient.get<{ items: any[]; total: number; page: number; limit: number }>('/admin/users', { params });
    return { users: data.items as AdminUser[], total: data.total, page: data.page, limit: data.limit };
  },

  updateUserStatus: async (userId: string, status: string): Promise<{ user: AdminUser }> => {
    const user = await apiClient.put<AdminUser>(`/admin/users/${userId}/status`, { status });
    return { user };
  },

  getConfigs: async (): Promise<{ configs: SiteConfig[] }> => {
    return apiClient.get<{ configs: SiteConfig[] }>('/admin/config');
  },

  getConfig: async (key: string): Promise<{ config: SiteConfig }> => {
    const config = await apiClient.get<SiteConfig>(`/admin/config/${key}`);
    return { config };
  },

  updateConfig: async (key: string, data: Partial<SiteConfig>): Promise<{ config: SiteConfig }> => {
    const config = await apiClient.put<SiteConfig>(`/admin/config/${key}`, data);
    return { config };
  },

  toggleConfig: async (key: string): Promise<{ config: SiteConfig }> => {
    const config = await apiClient.patch<SiteConfig>(`/admin/config/${key}/toggle`);
    return { config };
  },

  deleteConfig: (key: string) =>
    apiClient.delete<{ message: string }>(`/admin/config/${key}`),

  getModules: async (): Promise<{ modules: Module[] }> => {
    return apiClient.get<{ modules: Module[] }>('/admin/modules');
  },

  createModule: async (data: Partial<Module>): Promise<{ module: Module }> => {
    const mod = await apiClient.post<Module>('/admin/modules', data);
    return { module: mod };
  },

  updateModule: async (key: string, data: Partial<Module>): Promise<{ module: Module }> => {
    const mod = await apiClient.put<Module>(`/admin/modules/${key}`, data);
    return { module: mod };
  },

  toggleModule: async (key: string): Promise<{ module: Module }> => {
    const mod = await apiClient.patch<Module>(`/admin/modules/${key}/toggle`);
    return { module: mod };
  },

  getOrderReports: (params?: Record<string, string>) =>
    apiClient.get<any>('/admin/reports/orders', { params }),

  getRevenueReports: (params?: Record<string, string>) =>
    apiClient.get<any>('/admin/reports/revenue', { params }),

  getShopReports: (params?: Record<string, string>) =>
    apiClient.get<any>('/admin/reports/shops', { params }),

  getAuditLogs: async (params?: Record<string, string>): Promise<{ logs: any[]; total: number }> => {
    const data = await apiClient.get<{ items: any[]; total: number }>('/admin/audit-logs', { params });
    return { logs: data.items, total: data.total };
  },
};

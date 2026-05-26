import { apiClient } from './client';

export interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'payment' | 'review' | 'system' | 'alert';
  title: string;
  message: string;
  data?: any;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export const notificationsApi = {
  list: async (params?: Record<string, string>): Promise<NotificationsResponse> => {
    return apiClient.get<NotificationsResponse>('/notifications', { params });
  },

  markAsRead: async (id: string): Promise<{ notification: Notification }> => {
    const notification = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return { notification };
  },

  markAllAsRead: () =>
    apiClient.patch<{ message: string }>('/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/notifications/${id}`),
};

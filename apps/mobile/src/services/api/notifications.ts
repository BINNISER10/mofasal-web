import apiClient from './client';
import { ENDPOINTS } from './config';

export interface AppNotification {
  id: string;
  type:
    | 'order_status'
    | 'order_confirmed'
    | 'order_shipped'
    | 'order_delivered'
    | 'new_message'
    | 'promotional'
    | 'measurement_reminder'
    | 'payment_received'
    | 'driver_assigned'
    | 'changes_requested'
    | 'rating_request';
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AppNotification[]> => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, {
      params,
    });
    const data = response.data as any;
    if (Array.isArray(data)) return data as AppNotification[];
    return (data?.items as AppNotification[]) || [];
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};

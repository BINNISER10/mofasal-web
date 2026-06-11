'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useNotificationStore, Notification } from '@/lib/stores/notificationStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { notificationsApi } from '@/lib/api/notifications';
import { generateId } from '@/lib/utils/formatting';

export function useNotifications() {
  const store = useNotificationStore();
  const token = useAuthStore((s) => s.token);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      store.setNotifications([]);
      return;
    }
    store.setLoading(true);
    try {
      const res = await notificationsApi.list({ limit: '50' });
      const items = (res as any).notifications ?? (res as any).items ?? [];
      store.setNotifications(
        items.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message || n.body || '',
          type: n.type || 'system',
          isRead: Boolean(n.isRead),
          createdAt: n.createdAt,
          link: n.link || n.actionUrl,
        }))
      );
    } catch {
      store.setNotifications([]);
    } finally {
      store.setLoading(false);
    }
  }, [store, token]);

  const addLocalNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      store.addNotification({
        ...notification,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    },
    [store]
  );

  useEffect(() => {
    fetchNotifications();
    if (!token) return;
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications, token]);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    addNotification: addLocalNotification,
  };
}

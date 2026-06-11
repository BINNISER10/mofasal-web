'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useNotificationStore, Notification } from '@/lib/stores/notificationStore';
import { generateId } from '@/lib/utils/formatting';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'طلب جديد',
    message: 'تم استلام طلب جديد برقم #ORD-2024-001',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/dashboard/tailor/orders/1',
  },
  {
    id: '2',
    title: 'تم التوصيل',
    message: 'تم توصيل الطلب #ORD-2024-002 بنجاح',
    type: 'order',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/dashboard/tailor/orders/2',
  },
  {
    id: '3',
    title: 'تحديث المخزون',
    message: 'القماش الأسود أوشك على النفاد (متبقي 2 متر فقط)',
    type: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    title: 'تنبيه دفع',
    message: 'تم تأكيد دفع مبلغ 450 ريال للطلب #ORD-2024-003',
    type: 'payment',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export function useNotifications() {
  const store = useNotificationStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    store.setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      store.setNotifications(MOCK_NOTIFICATIONS);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      store.setLoading(false);
    }
  }, [store]);

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
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    addNotification: addLocalNotification,
  };
}

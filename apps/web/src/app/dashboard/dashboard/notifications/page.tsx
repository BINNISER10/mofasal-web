'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { Bell, ShoppingBag, Truck, CreditCard, Star, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { notificationsApi, Notification } from '@/lib/api/notifications';
import toast from 'react-hot-toast';

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingBag size={18} />,
  delivery: <Truck size={18} />,
  payment: <CreditCard size={18} />,
  review: <Star size={18} />,
  system: <Info size={18} />,
  alert: <AlertTriangle size={18} />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationsApi.list();
        setNotifications(res.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(isRTL ? 'تم تعليم الكل كمقروء' : 'All marked as read');
    } catch (err) {
      toast.error(isRTL ? 'فشل تحديث الإشعارات' : 'Failed to update notifications');
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (link) router.push(link);
    } catch (err) {
      console.error('Failed to mark as read', err);
      if (link) router.push(link);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الإشعارات' : 'Notifications'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? `${notifications.length} إشعار` : `${notifications.length} notifications`}{unreadCount > 0 ? ` (${unreadCount} ${isRTL ? 'غير مقروء' : 'unread'})` : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck size={16} />} onClick={handleMarkAllRead}>
            {isRTL ? 'تعليم الكل مقروء' : 'Mark All Read'}
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4"><Bell size={28} className="text-gray-400" /></div>
          <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
        </Card>
      ) : (
      <div className="space-y-2">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            hover
            className={cn('p-4 transition-colors cursor-pointer', !notif.isRead && 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-primary-600')}
            onClick={() => handleMarkRead(notif.id, notif.link)}
          >
            <div className="flex items-start gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', notif.type === 'alert' ? 'bg-red-50 text-red-600' : notif.type === 'payment' ? 'bg-green-50 text-green-600' : notif.type === 'system' ? 'bg-blue-50 text-blue-600' : 'bg-primary-50 text-primary-600')}>
                {typeIcons[notif.type] || <Bell size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn('text-sm', notif.isRead ? 'text-gray-800 dark:text-slate-200' : 'font-bold text-gray-900 dark:text-slate-100')}>{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap">{notif.createdAt}</span>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

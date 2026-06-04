'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatCurrency, getRelativeTime } from '@/lib/utils/formatting';
import { ShoppingBag, Clock, Heart, Ruler, RefreshCw, Package, Plus, Store, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { usersApi } from '@/lib/api/users';

const STATUS_LABELS: Record<string, string> = {
  SEWING_ASSEMBLY: 'خياطة', TAKING_MEASUREMENTS: 'مقاسات', ON_WAY_TO_CUSTOMER: 'توصيل',
  PENDING: 'قيد الانتظار', CONFIRMED: 'مؤكد', DELIVERED: 'تم التسليم', CANCELLED: 'ملغي',
};

export default function CustomerDashboardPage() {
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ active: 0, past: 0, measurements: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      ordersApi.getByCustomer(user.id, { limit: '5' }),
      usersApi.getMeasurements(user.id),
    ]).then(([ordersRes, measRes]) => {
      if (!active) return;
      const orders = ordersRes?.orders || [];
      const activeOrders = orders.filter((o: any) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status));
      const pastOrders = orders.filter((o: any) => ['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status));
      setStats({ active: activeOrders.length, past: pastOrders.length, measurements: measRes?.measurements?.length || 0 });
      setRecentOrders(activeOrders.slice(0, 3));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{isRTL ? 'مرحباً بك في مفصل 👋' : 'Welcome to Mufasal 👋'}</h2>
          <p className="text-primary-200 text-sm">{isRTL ? 'اطلب تفصيل ملابسك من أفضل الخياطين' : 'Get your clothes tailored by the best tailors'}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => router.push('/dashboard/customer/orders/new')}>
              {isRTL ? 'طلب جديد' : 'New Order'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/shops')}>
              {isRTL ? 'تصفح المتاجر' : 'Browse Shops'}
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2">
          <a href="/shops" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
            <Store size={15} />
            <span>{isRTL ? 'المتاجر' : 'Shops'}</span>
            {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </a>
          <a href="/marketplace" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
            <Package size={15} />
            <span>{isRTL ? 'سوق الأقمشة' : 'Marketplace'}</span>
            {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value={String(stats.active)} color="primary" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'الطلبات السابقة' : 'Past Orders'} value={String(stats.past)} color="info" />
        <StatsCard icon={<Heart size={22} />} label={isRTL ? 'المتاجر المفضلة' : 'Favorite Shops'} value="-" color="danger" />
        <StatsCard icon={<Ruler size={22} />} label={isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'} value={String(stats.measurements)} color="gold" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الطلبات النشطة' : 'Active Orders'}</h3>
          <a href="/dashboard/customer/orders" className="text-sm text-primary-700 font-semibold">{isRTL ? 'عرض الكل' : 'View All'}</a>
        </div>
        {recentOrders.map((order: any) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{order.shopName || order.shop}</p>
                <Badge variant={order.status === 'ON_WAY_TO_CUSTOMER' ? 'info' : 'gold'} size="sm">{STATUS_LABELS[order.status] || order.status}</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">#{order.orderNumber || order.id?.slice(0, 6)} - {getRelativeTime(order.createdAt)}</p>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
              <a href={`/dashboard/customer/orders/${order.id}`} className="text-xs text-primary-700">{isRTL ? 'تتبع' : 'Track'}</a>
            </div>
          </div>
        ))}
        {recentOrders.length === 0 && (
          <div className="py-8 text-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا توجد طلبات نشطة' : 'No active orders'}</div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">{isRTL ? 'إعادة طلب سريع' : 'Quick Re-order'}</h3>
          <div className="space-y-3">
            <div className="py-8 text-center text-gray-400 dark:text-slate-500">{isRTL ? 'اطلب أول قياس لك لبدء الطلبات' : 'Place your first order to get started'}</div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">{isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'}</h3>
          <div className="space-y-3">
            {stats.measurements > 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? `${stats.measurements} مقاس محفوظ` : `${stats.measurements} saved measurements`}</div>
            ) : (
              <div className="py-8 text-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا توجد مقاسات محفوظة' : 'No saved measurements'}</div>
            )}
          </div>
        </Card>
      </div>
      </>
      )}
    </div>
  );
}

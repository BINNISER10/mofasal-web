'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency, getRelativeTime } from '@/lib/utils/formatting';
import { ShoppingBag, Clock, Heart, Ruler, RefreshCw, Package, Plus, Store, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';
import { usersApi } from '@/lib/api/users';

const STATUS_LABELS: Record<string, string> = {
  SEWING_ASSEMBLY: 'خياطة', TAKING_MEASUREMENTS: 'مقاسات', ON_WAY_TO_CUSTOMER: 'توصيل',
  PENDING: 'قيد الانتظار', CONFIRMED: 'مؤكد', DELIVERED: 'تم التسليم', CANCELLED: 'ملغي',
};

export default function CustomerDashboardPage() {
  const { isRTL } = useAppStore();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ active: 0, past: 0, measurements: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    Promise.all([
      ordersApi.list({ limit: '5' }),
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
  }, [user, authLoading]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
            {isRTL ? 'ثلاث خطوات' : 'Three steps'}
          </p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-2 tracking-tight">
            {isRTL ? 'مرحباً — اطلب ثوبك' : 'Welcome — order your thobe'}
          </h2>
          <p className="text-neutral-500 text-sm max-w-md">
            {isRTL ? 'اختر · أكد · تابع — مثل طلب الطعام' : 'Choose · Confirm · Track — like food delivery'}
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => router.push('/dashboard/customer/orders/new')}>
              {isRTL ? 'طلب جديد' : 'New Order'}
            </Button>
            <Button variant="gold" size="sm" icon={<Ruler size={14} />} onClick={() => router.push('/dashboard/customer/book-measurement')}>
              {isRTL ? 'قياس منزلي' : 'Home Measurement'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/shops')}>
              {isRTL ? 'المتاجر' : 'Shops'}
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 w-full sm:w-auto">
          <Link href="/shops" className="flex items-center justify-between gap-4 rounded-xl border border-[#E8E8E8] dark:border-white/10 px-4 py-3 text-sm hover:bg-[#FAFAFA] dark:hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2 text-[#0A0A0A] dark:text-white"><Store size={15} />{isRTL ? 'المتاجر' : 'Shops'}</span>
            {isRTL ? <ArrowLeft size={14} className="text-neutral-400" /> : <ArrowRight size={14} className="text-neutral-400" />}
          </Link>
          <Link href="/marketplace" className="flex items-center justify-between gap-4 rounded-xl border border-[#E8E8E8] dark:border-white/10 px-4 py-3 text-sm hover:bg-[#FAFAFA] dark:hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2 text-[#0A0A0A] dark:text-white"><Package size={15} />{isRTL ? 'الأقمشة' : 'Fabrics'}</span>
            {isRTL ? <ArrowLeft size={14} className="text-neutral-400" /> : <ArrowRight size={14} className="text-neutral-400" />}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value={String(stats.active)} color="primary" href="/dashboard/customer/orders" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'الطلبات السابقة' : 'Past Orders'} value={String(stats.past)} color="info" href="/dashboard/customer/orders" />
        <StatsCard icon={<Heart size={22} />} label={isRTL ? 'المتاجر المفضلة' : 'Favorite Shops'} value="-" color="danger" href="/shops" />
        <StatsCard icon={<Ruler size={22} />} label={isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'} value={String(stats.measurements)} color="gold" href="/dashboard/customer/measurements" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الطلبات النشطة' : 'Active Orders'}</h3>
          <Link href="/dashboard/customer/orders" className="text-sm text-primary-700 font-semibold">{isRTL ? 'عرض الكل' : 'View All'}</Link>
        </div>
        {recentOrders.map((order: any) => (
          <Link
            key={order.id}
            href={`/dashboard/customer/orders/${order.id}`}
            className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{order.shopName || order.shop}</p>
                <Badge variant={order.status === 'ON_WAY_TO_CUSTOMER' ? 'info' : 'gold'} size="sm">{STATUS_LABELS[order.status] || order.status}</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">#{order.orderNumber || order.id?.slice(0, 6)} - {getRelativeTime(order.createdAt)}</p>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
              <span className="text-xs text-primary-700">{isRTL ? 'تتبع ←' : 'Track →'}</span>
            </div>
          </Link>
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

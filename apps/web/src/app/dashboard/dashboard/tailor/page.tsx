'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { ordersApi } from '@/lib/api/orders';
import { DEMO_ORDERS } from '@/lib/demoData';
import { isDemoToken } from '@/lib/demoAuth';
import { ShoppingBag, Clock, Users, DollarSign, Plus, UserPlus, Package } from 'lucide-react';
import { CHART_COLORS } from '@/lib/chartColors';
import { formatCurrency } from '@/lib/utils/formatting';
import Link from 'next/link';

const MufasalBarChart = dynamic(
  () => import('@/components/shared/Charts').then((m) => m.MufasalBarChart),
  {
    ssr: false,
    loading: () => <div className="h-[190px] rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />,
  }
);

const weeklyOrders = [
  { name: 'سبت', value: 18 },
  { name: 'أحد', value: 22 },
  { name: 'إثن', value: 15 },
  { name: 'ثلث', value: 28 },
  { name: 'أربع', value: 21 },
  { name: 'خميس', value: 31 },
  { name: 'جمعة', value: 12 },
];

function mapRecentOrders(orders: any[]) {
  return orders.slice(0, 4).map((o) => ({
    orderId: o.id,
    id: `#${o.orderNumber || o.id?.slice(0, 6)}`,
    customer: o.customerName || o.customer?.name || '—',
    status: o.status || 'PENDING',
    amount: o.totalAmount || 0,
    time: o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar') : '',
  }));
}

function calcStats(orders: any[]) {
  const today = new Date().toDateString();
  const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const revenue = orders
    .filter((o) => new Date(o.createdAt).toDateString() === today)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  return { today: todayCount, pending, revenue };
}

function readDemoOrders() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return isDemoToken(token) ? DEMO_ORDERS : null;
}

export default function TailorDashboardPage() {
  const { isRTL } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, pending: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<ReturnType<typeof mapRecentOrders>>([]);

  useEffect(() => {
    let active = true;

    const demo = readDemoOrders();
    if (demo?.length) {
      setStats(calcStats(demo));
      setRecentOrders(mapRecentOrders(demo));
      setLoading(false);
      return;
    }

    const safety = setTimeout(() => {
      if (active) setLoading(false);
    }, 3000);

    ordersApi
      .list({ limit: '50' })
      .then((res) => {
        if (!active) return;
        const orders = res.orders ?? [];
        if (orders.length) {
          setStats(calcStats(orders));
          setRecentOrders(mapRecentOrders(orders));
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(safety);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(safety);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-[#111] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
            {isRTL ? 'ERP محل خياطة' : 'Tailor shop ERP'}
          </p>
          <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'لوحة الخياط' : 'Tailor Dashboard'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/tailor/orders/new">
            <Button variant="primary" icon={<Plus size={18} />}>{isRTL ? 'طلب جديد' : 'New Order'}</Button>
          </Link>
          <Link href="/dashboard/tailor/staff">
            <Button variant="outline" icon={<UserPlus size={18} />}>{isRTL ? 'الموظفون' : 'Staff'}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'طلبات اليوم' : "Today's Orders"} value={String(stats.today)} trend={8.5} color="primary" href="/dashboard/tailor/orders" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'قيد الانتظار' : 'Pending Orders'} value={String(stats.pending)} trend={-3.2} color="gold" href="/dashboard/tailor/orders" />
        <StatsCard icon={<Users size={22} />} label={isRTL ? 'الموظفين' : 'Staff on Duty'} value="8" color="accent" href="/dashboard/tailor/staff" />
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إيرادات اليوم' : "Today's Revenue"} value={formatCurrency(stats.revenue)} trend={15.3} color="success" href="/dashboard/finances" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'آخر الطلبات' : 'Recent Orders'}</h3>
              <Link href="/dashboard/tailor/orders" className="text-sm text-primary-700 font-semibold">{isRTL ? 'عرض الكل' : 'View All'}</Link>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'لا توجد طلبات حالياً' : 'No orders yet'}</p>
            ) : recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/tailor/orders/${order.orderId}`}
                className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{order.customer}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{order.id} - {order.time}</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                  <Badge variant={order.status === 'PENDING' ? 'gold' : order.status === 'SEWING_ASSEMBLY' ? 'gold' : 'primary'} size="sm">
                    {isRTL ? ({ PENDING: 'قيد الانتظار', TAKING_MEASUREMENTS: 'أخذ مقاسات', SEWING_ASSEMBLY: 'خياطة', ON_WAY_TO_CUSTOMER: 'توصيل' } as Record<string, string>)[order.status] || order.status : order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'أداء الطلبات الأسبوعي' : 'Weekly Order Performance'}</h3>
            <MufasalBarChart
              data={weeklyOrders}
              color={CHART_COLORS.primary}
              label1={isRTL ? 'عدد الطلبات' : 'Orders'}
              height={190}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button href="/dashboard/tailor/orders/new" variant="primary" size="lg" fullWidth icon={<Plus size={18} />}>
              {isRTL ? 'طلب جديد' : 'New Order'}
            </Button>
            <Button href="/dashboard/tailor/orders" variant="gold" size="lg" fullWidth icon={<ShoppingBag size={18} />}>
              {isRTL ? 'لوحة الطلبات' : 'Orders Board'}
            </Button>
            <Button href="/dashboard/inventory" variant="outline" size="lg" fullWidth icon={<Package size={18} />}>
              {isRTL ? 'جرد المخزون' : 'Inventory Check'}
            </Button>
          </div>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">{isRTL ? 'التنبيهات' : 'Alerts'}</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl text-sm">
                <p className="font-semibold text-red-700">{isRTL ? 'مخزون منخفض' : 'Low Stock'}</p>
                <p className="text-red-600 text-xs">{isRTL ? 'القماش الأسود - متبقي 2 متر' : 'Black fabric - 2m remaining'}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl text-sm">
                <p className="font-semibold text-yellow-700">{isRTL ? 'طلبات متأخرة' : 'Delayed Orders'}</p>
                <p className="text-yellow-600 text-xs">{isRTL ? 'طلبين متجاوزين المدة المحددة' : '2 orders past due date'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

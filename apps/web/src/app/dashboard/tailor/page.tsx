'use client';
import React, { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { ordersApi } from '@/lib/api/orders';
import { ShoppingBag, Clock, Users, DollarSign, Plus, UserPlus, Package, TrendingUp } from 'lucide-react';
import { MufasalBarChart, CHART_COLORS } from '@/components/shared/Charts';
import { formatCurrency } from '@/lib/utils/formatting';
import DashboardLoading from '../loading';

const weeklyOrders = [
  { name: 'سبت', value: 18 },
  { name: 'أحد', value: 22 },
  { name: 'إثن', value: 15 },
  { name: 'ثلث', value: 28 },
  { name: 'أربع', value: 21 },
  { name: 'خميس', value: 31 },
  { name: 'جمعة', value: 12 },
];

const FALLBACK_ORDERS = [
  { id: '#ORD-1284', customer: 'أحمد محمد', status: 'PENDING', amount: 1200, time: 'منذ 30 دقيقة' },
  { id: '#ORD-1283', customer: 'سعد عبدالله', status: 'TAKING_MEASUREMENTS', amount: 850, time: 'منذ ساعتين' },
  { id: '#ORD-1282', customer: 'خالد عمر', status: 'SEWING_ASSEMBLY', amount: 2300, time: 'منذ 5 ساعات' },
  { id: '#ORD-1281', customer: 'فيصل علي', status: 'ON_WAY_TO_CUSTOMER', amount: 540, time: 'منذ يوم' },
];

export default function TailorDashboardPage() {
  const { isRTL } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ today: 12, pending: 5, revenue: 4500 });
  const [recentOrders, setRecentOrders] = useState<any[]>(FALLBACK_ORDERS);

  useEffect(() => {
    setMounted(true);
    let active = true;
    ordersApi.list({ limit: '50' })
      .then((res) => {
        if (!active || !res.orders?.length) return;
        const orders: any[] = res.orders;
        const today = new Date().toDateString();
        const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
        const pending = orders.filter((o) => o.status === 'PENDING').length;
        const revenue = orders
          .filter((o) => new Date(o.createdAt).toDateString() === today)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats({ today: todayCount, pending, revenue });
        setRecentOrders(orders.slice(0, 4).map((o) => ({
          id: `#${o.orderNumber || o.id?.slice(0, 6)}`,
          customer: o.customerName || o.customer?.name || '—',
          status: o.status || 'PENDING',
          amount: o.totalAmount || 0,
          time: o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar') : '',
        })));
      })
      .catch(() => { /* الإبقاء على القالب الاحتياطي */ });
    return () => { active = false; };
  }, []);

  if (!mounted) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'طلبات اليوم' : "Today's Orders"} value={String(stats.today)} trend={8.5} color="primary" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'قيد الانتظار' : 'Pending Orders'} value={String(stats.pending)} trend={-3.2} color="gold" />
        <StatsCard icon={<Users size={22} />} label={isRTL ? 'الموظفين' : 'Staff on Duty'} value="8" color="info" />
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إيرادات اليوم' : "Today's Revenue"} value={formatCurrency(stats.revenue)} trend={15.3} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'آخر الطلبات' : 'Recent Orders'}</h3>
              <a href="/dashboard/tailor/orders" className="text-sm text-primary-700 font-semibold">{isRTL ? 'عرض الكل' : 'View All'}</a>
            </div>
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{order.customer}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{order.id} - {order.time}</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                  <Badge variant={order.status === 'PENDING' ? 'warning' : order.status === 'TAKING_MEASUREMENTS' ? 'info' : order.status === 'SEWING_ASSEMBLY' ? 'gold' : 'info'} size="sm">
                    {isRTL ? ({ PENDING: 'قيد الانتظار', TAKING_MEASUREMENTS: 'أخذ مقاسات', SEWING_ASSEMBLY: 'خياطة', ON_WAY_TO_CUSTOMER: 'توصيل' } as Record<string, string>)[order.status] || order.status : order.status}
                  </Badge>
                </div>
              </div>
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
            <Button variant="primary" size="lg" fullWidth icon={<Plus size={18} />}>
              {isRTL ? 'طلب جديد' : 'New Order'}
            </Button>
            <Button variant="gold" size="lg" fullWidth icon={<UserPlus size={18} />}>
              {isRTL ? 'إضافة موظف' : 'Add Staff'}
            </Button>
            <Button variant="outline" size="lg" fullWidth icon={<Package size={18} />}>
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

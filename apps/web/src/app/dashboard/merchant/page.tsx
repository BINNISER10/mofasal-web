'use client';
import React, { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { ordersApi } from '@/lib/api/orders';
import { productsApi } from '@/lib/api/products';
import { Package, ShoppingBag, DollarSign, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MufasalAreaChart, CHART_COLORS } from '@/components/shared/Charts';

const MONTHS_AR = ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'];

function buildMonthlySales(orders: any[]) {
  const now = new Date();
  const buckets: { name: string; value: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ name: MONTHS_AR[d.getMonth()], value: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += o.totalAmount || o.grandTotal || 0;
  });
  return buckets.map(({ name, value }) => ({ name, value }));
}

const FALLBACK_ORDERS = [
  { id: '#ORD-1290', customer: 'أحمد محمد', product: 'قماش صوف إيطالي', qty: 3, amount: 540, status: 'PENDING' },
  { id: '#ORD-1289', customer: 'خالد عمر', product: 'حرير طبيعي', qty: 2, amount: 780, status: 'DELIVERED' },
  { id: '#ORD-1288', customer: 'سعد عبدالله', product: 'قطن مصري', qty: 5, amount: 325, status: 'DELIVERED' },
];

export default function MerchantDashboardPage() {
  const { isRTL } = useAppStore();
  const [stats, setStats] = useState({ products: 234, active: 18, dailySales: 12500, lowStock: 7 });
  const [recentOrders, setRecentOrders] = useState<any[]>(FALLBACK_ORDERS);
  const [monthlySales, setMonthlySales] = useState(() => buildMonthlySales([]));

  useEffect(() => {
    let active = true;
    productsApi.list({ limit: '100' })
      .then((res) => {
        if (!active || !res.products) return;
        const products: any[] = res.products;
        const lowStock = products.filter((p) => (p.stock ?? p.stockQuantity ?? 99) < 10).length;
        setStats((s) => ({ ...s, products: res.total || products.length, lowStock }));
      })
      .catch(() => { /* احتياطي */ });
    ordersApi.list({ limit: '50' })
      .then((res) => {
        if (!active || !res.orders?.length) return;
        const orders: any[] = res.orders;
        const today = new Date().toDateString();
        const activeCount = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
        const dailySales = orders
          .filter((o) => new Date(o.createdAt).toDateString() === today)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats((s) => ({ ...s, active: activeCount, dailySales: dailySales || s.dailySales }));
        setMonthlySales(buildMonthlySales(orders));
        setRecentOrders(orders.slice(0, 3).map((o) => ({
          id: `#${o.orderNumber || o.id?.slice(0, 6)}`,
          customer: o.customerName || o.customer?.name || '—',
          product: o.items?.[0]?.serviceName || o.fabricName || '—',
          qty: o.items?.length || 1,
          amount: o.totalAmount || 0,
          status: o.status || 'PENDING',
        })));
      })
      .catch(() => { /* احتياطي */ });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-[#111] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
            {isRTL ? 'ERP تاجر أقمشة' : 'Fabric merchant ERP'}
          </p>
          <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'لوحة التاجر' : 'Merchant Dashboard'}
          </h2>
        </div>
        <Button variant="primary" icon={<Plus size={18} />}>{isRTL ? 'إضافة منتج' : 'Add Product'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Package size={22} />} label={isRTL ? 'المنتجات' : 'Products'} value={String(stats.products)} trend={5.2} color="primary" />
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value={String(stats.active)} trend={-2.1} color="gold" />
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'المبيعات اليومية' : 'Daily Sales'} value={formatCurrency(stats.dailySales)} trend={15.8} color="success" />
        <StatsCard icon={<AlertTriangle size={22} />} label={isRTL ? 'منتجات منخفضة' : 'Low Stock'} value={String(stats.lowStock)} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المبيعات الشهرية' : 'Monthly Sales'}</h3>
            <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-lg">{isRTL ? 'آخر 6 أشهر' : 'Last 6 months'}</span>
          </div>
          <MufasalAreaChart
            data={monthlySales}
            color={CHART_COLORS.gold}
            label={isRTL ? 'المبيعات' : 'Sales'}
            prefix="﷼"
            height={200}
          />
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'آخر الطلبات' : 'Recent Orders'}</h3>
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-700 last:border-0">
              <div>
                <p className="text-sm font-semibold">{order.customer}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{order.product} x{order.qty}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                <Badge variant={order.status === 'DELIVERED' ? 'success' : 'warning'} size="sm">{order.status}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

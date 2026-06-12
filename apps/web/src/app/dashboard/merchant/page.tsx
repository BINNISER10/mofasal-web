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
import Link from 'next/link';
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

export default function MerchantDashboardPage() {
  const { isRTL } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, active: 0, dailySales: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState(() => buildMonthlySales([]));

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      productsApi.list({ limit: '100' }),
      ordersApi.list({ limit: '50' }),
    ]).then(([productsResult, ordersResult]) => {
      if (!active) return;
      if (productsResult.status === 'fulfilled' && productsResult.value.products) {
        const products: any[] = productsResult.value.products;
        const lowStock = products.filter((p) => (p.stock ?? p.stockQuantity ?? 99) < 10).length;
        setStats((s) => ({
          ...s,
          products: productsResult.value.total || products.length,
          lowStock,
        }));
      }
      if (ordersResult.status === 'fulfilled' && ordersResult.value.orders?.length) {
        const orders: any[] = ordersResult.value.orders;
        const today = new Date().toDateString();
        const activeCount = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
        const dailySales = orders
          .filter((o) => new Date(o.createdAt).toDateString() === today)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats((s) => ({ ...s, active: activeCount, dailySales }));
        setMonthlySales(buildMonthlySales(orders));
        setRecentOrders(orders.slice(0, 3).map((o) => ({
          orderId: o.id,
          id: `#${o.orderNumber || o.id?.slice(0, 6)}`,
          customer: o.customerName || o.customer?.name || '—',
          product: o.items?.[0]?.serviceName || o.fabricName || '—',
          qty: o.items?.length || 1,
          amount: o.totalAmount || 0,
          status: o.status || 'PENDING',
        })));
      }
    }).finally(() => { if (active) setLoading(false); });
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
        <Button variant="primary" icon={<Plus size={18} />} href="/dashboard/merchant/products/add">{isRTL ? 'إضافة منتج' : 'Add Product'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Package size={22} />} label={isRTL ? 'المنتجات' : 'Products'} value={String(stats.products)} trend={5.2} color="primary" href="/dashboard/merchant/products" />
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value={String(stats.active)} trend={-2.1} color="gold" href="/dashboard/merchant/orders" />
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'المبيعات اليومية' : 'Daily Sales'} value={formatCurrency(stats.dailySales)} trend={15.8} color="success" href="/dashboard/merchant/finances" />
        <StatsCard icon={<AlertTriangle size={22} />} label={isRTL ? 'منتجات منخفضة' : 'Low Stock'} value={String(stats.lowStock)} color="danger" href="/dashboard/merchant/inventory" />
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
          {loading ? (
            <p className="text-sm text-gray-400 py-4 text-center">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{isRTL ? 'لا توجد طلبات حالياً' : 'No orders yet'}</p>
          ) : recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/merchant/orders`}
              className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-sm font-semibold">{order.customer}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{order.product} x{order.qty}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                <Badge variant={order.status === 'DELIVERED' ? 'success' : 'warning'} size="sm">{order.status}</Badge>
              </div>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

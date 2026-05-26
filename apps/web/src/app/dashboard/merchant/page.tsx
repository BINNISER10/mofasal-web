'use client';
import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Package, ShoppingBag, DollarSign, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MufasalAreaChart, CHART_COLORS } from '@/components/shared/Charts';

const monthlySales = [
  { name: 'ينا', value: 145000 },
  { name: 'فبر', value: 182000 },
  { name: 'مار', value: 163000 },
  { name: 'أبر', value: 210000 },
  { name: 'ماي', value: 195000 },
  { name: 'يون', value: 248000 },
];

export default function MerchantDashboardPage() {
  const { isRTL } = useAppStore();

  const recentOrders = [
    { id: '#ORD-1290', customer: 'أحمد محمد', product: 'قماش صوف إيطالي', qty: 3, amount: 540, status: 'PENDING' },
    { id: '#ORD-1289', customer: 'خالد عمر', product: 'حرير طبيعي', qty: 2, amount: 780, status: 'DELIVERED' },
    { id: '#ORD-1288', customer: 'سارة أحمد', product: 'قطن مصري', qty: 5, amount: 325, status: 'DELIVERED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'لوحة التاجر' : 'Merchant Dashboard'}</h2>
        <Button variant="primary" icon={<Plus size={18} />}>{isRTL ? 'إضافة منتج' : 'Add Product'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Package size={22} />} label={isRTL ? 'المنتجات' : 'Products'} value="234" trend={5.2} color="primary" />
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value="18" trend={-2.1} color="gold" />
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'المبيعات اليومية' : 'Daily Sales'} value={formatCurrency(12500)} trend={15.8} color="success" />
        <StatsCard icon={<AlertTriangle size={22} />} label={isRTL ? 'منتجات منخفضة' : 'Low Stock'} value="7" color="danger" />
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

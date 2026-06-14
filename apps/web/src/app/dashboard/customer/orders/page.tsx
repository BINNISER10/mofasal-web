'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { ordersApi, Order } from '@/lib/api/orders';
import { getCustomerStageLabel } from '@mufasal/shared';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const { isRTL } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      try {
        const params: Record<string, string> = {};
        if (filter !== 'ALL') params.status = filter;
        const res = await ordersApi.list(params);
        setOrders(res.orders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
            {isRTL ? 'تابع' : 'Track'}
          </p>
          <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'طلباتي' : 'My orders'}
          </h2>
        </div>
        <Button href="/dashboard/customer/orders/new" variant="primary" size="sm">
          {isRTL ? '+ طلب جديد' : '+ New order'}
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {['ALL', 'PENDING', 'CONFIRMED', 'SEWING_ASSEMBLY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              filter === f
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A]'
                : 'border-[#E8E8E8] text-neutral-600 hover:border-[#00373E]/30'
            )}
          >
            {isRTL
              ? { ALL: 'الكل', PENDING: 'جديد', CONFIRMED: 'مؤكد', SEWING_ASSEMBLY: 'تصنيع', OUT_FOR_DELIVERY: 'توصيل', DELIVERED: 'مكتمل', CANCELLED: 'ملغي' }[f] || f
              : f}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-slate-400 mb-4">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</p>
          <Button href="/dashboard/customer/orders/new" variant="primary">{isRTL ? 'طلب جديد' : 'New Order'}</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/dashboard/customer/orders/${order.id}`}>
              <Card hover className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">#{order.orderNumber || order.id}</p>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : order.status === 'PENDING' ? 'warning' : 'info'} size="sm">
                        {getCustomerStageLabel(order.status, isRTL)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{order.shopName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{order.createdAt}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-primary-700">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{order.paymentMethod}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

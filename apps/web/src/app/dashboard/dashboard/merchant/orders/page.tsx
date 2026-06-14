'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { ordersApi, Order } from '@/lib/api/orders';

export default function MerchantOrdersPage() {
  const { isRTL } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
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
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'طلبات القماش' : 'Fabric Orders'}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'DELIVERED', 'CANCELLED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', filter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600')}>
              {isRTL ? { ALL: 'الكل', PENDING: 'قيد الانتظار', DELIVERED: 'مكتمل', CANCELLED: 'ملغي' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</Card>
      ) : (
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">#{order.orderNumber || order.id}</p>
                  <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'warning'} size="sm">{order.status}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{order.customerName}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{order.createdAt}</p>
                {(order.items || []).map((item: any, i: number) => (
                  <p key={i} className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.name} x{item.quantity || 1} - {formatCurrency(item.price || item.unitPrice)}</p>
                ))}
              </div>
              <p className="font-bold text-primary-700">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

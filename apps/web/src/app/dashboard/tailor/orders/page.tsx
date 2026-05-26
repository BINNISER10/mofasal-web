'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { Search, Eye, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { ordersApi, Order } from '@/lib/api/orders';
import Link from 'next/link';

export default function TailorOrdersPage() {
  const { isRTL } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة الطلبات' : 'Order Management'}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'TAKING_MEASUREMENTS', 'SEWING_ASSEMBLY', 'ON_WAY_TO_CUSTOMER', 'DELIVERED', 'CANCELLED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', filter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600')}>
              {isRTL ? { ALL: 'الكل', PENDING: 'قيد الانتظار', TAKING_MEASUREMENTS: 'أخذ مقاسات', SEWING_ASSEMBLY: 'خياطة', ON_WAY_TO_CUSTOMER: 'توصيل', DELIVERED: 'مكتمل', CANCELLED: 'ملغي' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : (
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/dashboard/tailor/orders/${order.id}`}>
            <Card hover className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">{order.customerName?.charAt(0) || '?'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">#{order.orderNumber || order.id}</p>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : order.status === 'PENDING' ? 'warning' : 'info'} size="sm">{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{order.customerName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{order.createdAt}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary-700">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{order.customerPhone}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {orders.length === 0 && (
          <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</Card>
        )}
      </div>
      )}
    </div>
  );
}

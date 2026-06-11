'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Search, Filter, Eye, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ordersApi, Order } from '@/lib/api/orders';

const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'TAKING_MEASUREMENTS', 'SEWING_ASSEMBLY', 'ON_WAY_TO_CUSTOMER', 'DELIVERED', 'CANCELLED'];
const statusLabels: Record<string, string> = { DELIVERED: 'مكتمل', ON_WAY_TO_CUSTOMER: 'في الطريق', PENDING: 'قيد الانتظار', CONFIRMED: 'مؤكد', TAKING_MEASUREMENTS: 'أخذ المقاسات', SEWING_ASSEMBLY: 'خياطة', CANCELLED: 'ملغي' };

export default function AdminOrdersPage() {
  const { isRTL } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        const res = await ordersApi.list(params);
        setOrders(res.orders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة الطلبات' : 'Orders Management'}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', statusFilter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600')}
            >
              {isRTL ? { ALL: 'الكل', PENDING: 'قيد الانتظار', CONFIRMED: 'مؤكد', TAKING_MEASUREMENTS: 'أخذ المقاسات', SEWING_ASSEMBLY: 'خياطة', ON_WAY_TO_CUSTOMER: 'في الطريق', DELIVERED: 'مكتمل', CANCELLED: 'ملغي' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'رقم الطلب' : 'Order'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'العميل' : 'Customer'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المتجر' : 'Shop'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المنتجات' : 'Items'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'طريقة الدفع' : 'Payment'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300 transition-colors">
                  <td className="px-4 py-3 font-semibold">#{order.orderNumber || order.id}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.shopName}</td>
                  <td className="px-4 py-3">{(order.items || []).length}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : order.status === 'PENDING' ? 'warning' : 'info'} size="sm">
                      {isRTL ? (statusLabels[order.status] || order.status) : order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:text-primary-600"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={isRTL ? 'تفاصيل الطلب' : 'Order Details'} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'رقم الطلب' : 'Order'}</p><p className="font-semibold dark:text-slate-200">#{selectedOrder.orderNumber || selectedOrder.id}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'التاريخ' : 'Date'}</p><p className="font-semibold dark:text-slate-200">{selectedOrder.createdAt}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'العميل' : 'Customer'}</p><p className="font-semibold dark:text-slate-200">{selectedOrder.customerName}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'المتجر' : 'Shop'}</p><p className="font-semibold dark:text-slate-200">{selectedOrder.shopName}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'المبلغ' : 'Amount'}</p><p className="font-semibold text-primary-700">{formatCurrency(selectedOrder.totalAmount || selectedOrder.grandTotal || 0)}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'طريقة الدفع' : 'Payment'}</p><p className="font-semibold dark:text-slate-200">{selectedOrder.paymentMethod}</p></div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-gray-500 dark:text-slate-400 text-xs mb-1">{isRTL ? 'الحالة الحالية' : 'Current Status'}</p>
              <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : 'info'} size="md">{selectedOrder.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

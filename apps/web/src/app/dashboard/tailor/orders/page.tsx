'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { DEMO_ORDERS } from '@/lib/demoData';
import { isDemoToken } from '@/lib/demoAuth';
import toast from 'react-hot-toast';
import Link from 'next/link';

// أعمدة اللوحة بحالات Express + ألوانها (مراحل التصنيع التفصيلية)
const COLUMNS: { status: string; labelAr: string; labelEn: string; color: string }[] = [
  { status: 'PENDING', labelAr: 'قيد الانتظار', labelEn: 'Pending', color: '#E65100' },
  { status: 'CONFIRMED', labelAr: 'مؤكّد', labelEn: 'Confirmed', color: '#1565C0' },
  { status: 'STAFF_ON_WAY', labelAr: 'المندوب في الطريق', labelEn: 'Staff on Way', color: '#7B1FA2' },
  { status: 'TAKING_MEASUREMENTS', labelAr: 'أخذ المقاسات', labelEn: 'Taking Measurements', color: '#0097A7' },
  { status: 'CUTTING_FABRIC', labelAr: 'قص القماش', labelEn: 'Cutting Fabric', color: '#F57C00' },
  { status: 'SEWING_ASSEMBLY', labelAr: 'الخياطة والتجميع', labelEn: 'Sewing Assembly', color: '#735B4D' },
  { status: 'IRONING_FINISHING', labelAr: 'الكي والتشطيب', labelEn: 'Ironing & Finishing', color: '#00373E' },
  { status: 'PACKING_WRAPPING', labelAr: 'التغليف والتعبئة', labelEn: 'Packing & Wrapping', color: '#1A6470' },
  { status: 'ON_WAY_TO_CUSTOMER', labelAr: 'في الطريق إليك', labelEn: 'On Way to You', color: '#2E7D32' },
  { status: 'DELIVERED', labelAr: 'تم التوصيل', labelEn: 'Delivered', color: '#2E7D32' },
];

// الانتقال التقدّمي التالي (يطابق STATUS_FLOW في الخادم)
const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'STAFF_ON_WAY',
  STAFF_ON_WAY: 'TAKING_MEASUREMENTS',
  TAKING_MEASUREMENTS: 'CUTTING_FABRIC',
  CUTTING_FABRIC: 'SEWING_ASSEMBLY',
  SEWING_ASSEMBLY: 'IRONING_FINISHING',
  IRONING_FINISHING: 'PACKING_WRAPPING',
  PACKING_WRAPPING: 'ON_WAY_TO_CUSTOMER',
  ON_WAY_TO_CUSTOMER: 'DELIVERED',
  DELIVERED: 'COMPLETED',
};

function readDemoOrders() {
  if (typeof window === 'undefined') return null;
  return isDemoToken(localStorage.getItem('token')) ? DEMO_ORDERS : null;
}

export default function TailorOrdersPage() {
  const { isRTL } = useAppStore();
  const demoOrders = readDemoOrders();
  const [orders, setOrders] = useState<any[]>(demoOrders ?? []);
  const [loading, setLoading] = useState(!demoOrders);
  const [movingId, setMovingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (readDemoOrders()) return;
    setLoading(true);
    const safety = setTimeout(() => setLoading(false), 3000);
    try {
      const res = await ordersApi.list({ limit: '100' });
      setOrders(res.orders ?? []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    } finally {
      clearTimeout(safety);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const advance = async (order: any) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setMovingId(order.id);
    // تحديث متفائل
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    try {
      await ordersApi.updateStatus(order.id, { status: next as any });
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
    } catch (e: any) {
      // تراجع عند الفشل
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o)));
      toast.error(e?.message || (isRTL ? 'تعذّر التحديث' : 'Failed'));
    } finally {
      setMovingId(null);
    }
  };

  const cancel = async (order: any) => {
    setMovingId(order.id);
    try {
      await ordersApi.updateStatus(order.id, { status: 'CANCELLED' as any });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o)));
      toast.success(isRTL ? 'تم الإلغاء' : 'Cancelled');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الإلغاء' : 'Failed'));
    } finally {
      setMovingId(null);
    }
  };

  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'لوحة الطلبات' : 'Orders Board'}</h2>
        <span className="text-sm text-gray-400 dark:text-slate-500">{orders.length} {isRTL ? 'طلب' : 'orders'}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                    <h3 className="font-bold text-sm text-gray-700 dark:text-slate-200">{isRTL ? col.labelAr : col.labelEn}</h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{colOrders.length}</span>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  {colOrders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="h-1 rounded-full mb-3" style={{ background: col.color }} />
                      <Link href={`/dashboard/tailor/orders/${order.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">#{order.orderNumber || order.id?.slice(0, 6)}</p>
                          <p className="font-bold text-sm text-primary-700">{formatCurrency(order.totalAmount || order.grandTotal || 0)}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{order.customer?.name || order.customerName || '—'}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{order.items?.length || 0} {isRTL ? 'صنف' : 'items'}</p>
                      </Link>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-slate-700">
                        {NEXT_STATUS[order.status] && (
                          <button
                            onClick={() => advance(order)}
                            disabled={movingId === order.id}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white rounded-lg py-1.5 disabled:opacity-50"
                            style={{ background: col.color }}
                          >
                            {movingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <><Arrow size={12} />{isRTL ? 'التالي' : 'Next'}</>}
                          </button>
                        )}
                        <button onClick={() => cancel(order)} disabled={movingId === order.id} className="text-red-400 hover:text-red-600 p-1"><XCircle size={16} /></button>
                      </div>
                    </Card>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="text-center text-xs text-gray-300 dark:text-slate-600 py-6 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl">
                      {isRTL ? 'لا طلبات' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

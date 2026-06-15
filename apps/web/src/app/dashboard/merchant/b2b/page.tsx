'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import { StatsCard } from '@/components/shared/StatsCard';
import { b2bApi, FabricSupplyOrder } from '@/lib/api/b2b';
import {
  ShoppingCart, Package, Truck, CheckCircle2, Clock,
  XCircle, DollarSign, Building2,
} from 'lucide-react';

const STATUS_MAP = {
  PENDING:   { ar: 'قيد الانتظار', en: 'Pending',   variant: 'warning' as const, icon: <Clock size={14} /> },
  CONFIRMED: { ar: 'مؤكد',        en: 'Confirmed', variant: 'info' as const,    icon: <CheckCircle2 size={14} /> },
  ON_WAY:    { ar: 'في الطريق',   en: 'On The Way',variant: 'info' as const,    icon: <Truck size={14} /> },
  DELIVERED: { ar: 'تم التسليم',  en: 'Delivered', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
  CANCELLED: { ar: 'ملغي',        en: 'Cancelled', variant: 'error' as const,   icon: <XCircle size={14} /> },
};

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'ON_WAY' | 'DELIVERED' | 'CANCELLED';

export default function B2BPage() {
  const { isRTL } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<FabricSupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await b2bApi.list({ limit: '100' });
      setOrders(res.items || []);
    } catch (err) {
      console.error('Failed to fetch B2B orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );
  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((a, b) => a + b.grandTotal, 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const updateLocal = (id: string, status: FabricSupplyOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handleStatus = async (id: string, status: FabricSupplyOrder['status'], msgOk: string, msgErr: string) => {
    try {
      await b2bApi.updateStatus(id, status);
      updateLocal(id, status);
      toast.success(msgOk);
    } catch {
      toast.error(msgErr);
    }
  };

  const FILTER_TABS: { key: FilterType; ar: string; en: string }[] = [
    { key: 'ALL', ar: 'الكل', en: 'All' },
    { key: 'PENDING', ar: 'انتظار', en: 'Pending' },
    { key: 'CONFIRMED', ar: 'مؤكد', en: 'Confirmed' },
    { key: 'ON_WAY', ar: 'في الطريق', en: 'On Way' },
    { key: 'DELIVERED', ar: 'مسلّم', en: 'Delivered' },
  ];

  const deliveryLabel = (order: FabricSupplyOrder) => {
    if (order.deliveryTarget === 'CUSTOMER_HOME') {
      return isRTL ? 'توصيل لبيت العميل' : 'Deliver to customer';
    }
    return isRTL ? 'توصيل لمحل الخياط' : 'Deliver to tailor shop';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{isRTL ? 'طلبات التوريد B2B' : 'B2B Supply Orders'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {isRTL ? 'طلبات الخياطين لشراء أقمشة من متجرك' : 'Tailor shops ordering fabric from your store'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'} value={`${totalRevenue.toLocaleString()} ر.س`} icon={<DollarSign size={20} />} href="/dashboard/merchant/finances" />
        <StatsCard label={isRTL ? 'انتظار الموافقة' : 'Awaiting Approval'} value={pendingCount.toString()} icon={<Clock size={20} />} href="/dashboard/merchant/b2b" />
        <StatsCard label={isRTL ? 'إجمالي الطلبات' : 'Total Orders'} value={orders.length.toString()} icon={<ShoppingCart size={20} />} href="/dashboard/merchant/b2b" />
        <StatsCard label={isRTL ? 'مسلّمة' : 'Delivered'} value={orders.filter((o) => o.status === 'DELIVERED').length.toString()} icon={<Building2 size={20} />} href="/dashboard/merchant/b2b" />
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              {isRTL ? `${pendingCount} طلب/طلبات تنتظر موافقتك` : `${pendingCount} order(s) awaiting approval`}
            </p>
          </div>
          <Button size="sm" variant="warning" onClick={() => setFilter('PENDING')}>
            {isRTL ? 'عرض' : 'View'}
          </Button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {isRTL ? tab.ar : tab.en}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">{isRTL ? 'لا توجد طلبات توريد' : 'No supply orders'}</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusInfo = STATUS_MAP[order.status];
            const isOpen = expanded === order.id;
            const buyerName = order.buyerShop?.nameAr || order.buyerShop?.name || order.buyerUser?.name || '—';
            return (
              <Card key={order.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 text-start hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{buyerName}</p>
                      <Badge variant={statusInfo.variant} size="sm">{isRTL ? statusInfo.ar : statusInfo.en}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {order.orderNumber} • {order.createdAt?.slice(0, 10)} • {deliveryLabel(order)}
                    </p>
                  </div>
                  <p className="font-black text-primary-700 flex-shrink-0">{order.grandTotal.toLocaleString()} ر.س</p>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50 dark:border-slate-700">
                    <div className="py-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              {item.quantity} {item.unit === 'meter' ? (isRTL ? 'متر' : 'm') : item.unit} × {item.unitPrice} ر.س
                            </p>
                          </div>
                          <p className="font-bold">{item.totalPrice.toLocaleString()} ر.س</p>
                        </div>
                      ))}
                      {order.deliveryAddress && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                          <span className="font-bold">{isRTL ? 'التوصيل: ' : 'Delivery: '}</span>
                          {[order.deliveryAddress.city, order.deliveryAddress.street].filter(Boolean).join(' — ')}
                        </p>
                      )}
                      {order.linkedOrder && (
                        <p className="text-xs text-primary-700">
                          {isRTL ? 'مرتبط بطلب تفصيل:' : 'Linked order:'} #{order.linkedOrder.orderNumber}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-gray-500">{order.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {order.status === 'PENDING' && (
                        <>
                          <Button variant="outline" size="sm" icon={<XCircle size={14} />} onClick={() => handleStatus(order.id, 'CANCELLED', isRTL ? 'تم الرفض' : 'Rejected', isRTL ? 'فشل الرفض' : 'Failed')}>
                            {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                          <Button variant="primary" size="sm" icon={<CheckCircle2 size={14} />} onClick={() => handleStatus(order.id, 'CONFIRMED', isRTL ? 'تم التأكيد' : 'Confirmed', isRTL ? 'فشل التأكيد' : 'Failed')}>
                            {isRTL ? 'قبول وتجهيز' : 'Accept'}
                          </Button>
                        </>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button variant="primary" size="sm" icon={<Truck size={14} />} onClick={() => handleStatus(order.id, 'ON_WAY', isRTL ? 'خرج للتوصيل' : 'Shipped', isRTL ? 'فشل' : 'Failed')}>
                          {isRTL ? 'إرسال للتوصيل' : 'Mark shipped'}
                        </Button>
                      )}
                      {order.status === 'ON_WAY' && (
                        <Button variant="primary" size="sm" icon={<CheckCircle2 size={14} />} onClick={() => handleStatus(order.id, 'DELIVERED', isRTL ? 'تم التسليم' : 'Delivered', isRTL ? 'فشل' : 'Failed')}>
                          {isRTL ? 'تأكيد التسليم' : 'Mark delivered'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import { StatsCard } from '@/components/shared/StatsCard';
import { ordersApi } from '@/lib/api/orders';
import {
  ShoppingCart, Package, Truck, CheckCircle2, Clock,
  XCircle, DollarSign, Building2, Plus,
} from 'lucide-react';

interface SupplyOrder {
  id: string;
  tailorShop: string;
  items: { name: string; qty: number; unit: string; price: number }[];
  total: number;
  status: string;
  date: string;
  notes: string;
}

const STATUS_MAP = {
  PENDING:   { ar: 'قيد الانتظار', en: 'Pending',   variant: 'warning' as const, icon: <Clock size={14} /> },
  CONFIRMED: { ar: 'مؤكد',        en: 'Confirmed', variant: 'info' as const,    icon: <CheckCircle2 size={14} /> },
  ON_WAY:    { ar: 'في الطريق',   en: 'On The Way',variant: 'info' as const,    icon: <Truck size={14} /> },
  DELIVERED: { ar: 'تم التسليم',  en: 'Delivered', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
  CANCELLED: { ar: 'ملغي',        en: 'Cancelled', variant: 'error' as const,   icon: <XCircle size={14} /> },
};

function mapStatus(status: string): keyof typeof STATUS_MAP {
  if (status === 'CONFIRMED') return 'CONFIRMED';
  if (status === 'DELIVERED') return 'DELIVERED';
  if (status === 'CANCELLED' || status === 'RETURNED') return 'CANCELLED';
  if (status === 'PENDING') return 'PENDING';
  return 'ON_WAY';
}

type FilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'ON_WAY' | 'DELIVERED' | 'CANCELLED';

export default function B2BPage() {
  const { isRTL } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersApi.list({ limit: '100' });
        const mapped: SupplyOrder[] = (res.orders || []).map((o: any) => ({
          id: o.id,
          tailorShop: o.customerName || o.shopName || (isRTL ? 'عميل' : 'Customer'),
          items: (o.items || []).map((it: any) => ({
            name: it.name,
            qty: it.quantity || 1,
            unit: isRTL ? 'قطعة' : 'pc',
            price: it.price || it.unitPrice || 0,
          })),
          total: o.grandTotal || o.totalAmount || 0,
          status: mapStatus(o.status),
          date: (o.createdAt || '').slice(0, 10),
          notes: o.notes || '',
        }));
        setOrders(mapped);
      } catch (err) {
        console.error('Failed to fetch B2B orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isRTL]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );
  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((a, b) => a + b.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleAccept = async (id: string) => {
    try {
      await ordersApi.updateStatus(id, { status: 'CONFIRMED' });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'CONFIRMED' } : o)));
      toast.success(isRTL ? 'تم تأكيد الطلب' : 'Order confirmed');
    } catch {
      toast.error(isRTL ? 'فشل تأكيد الطلب' : 'Failed to confirm order');
    }
  };
  const handleReject = async (id: string) => {
    try {
      await ordersApi.cancel(id, isRTL ? 'رفض من المتجر' : 'Rejected by store');
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' } : o)));
      toast.success(isRTL ? 'تم رفض الطلب' : 'Order rejected');
    } catch {
      toast.error(isRTL ? 'فشل رفض الطلب' : 'Failed to reject order');
    }
  };

  const FILTER_TABS: { key: FilterType; ar: string; en: string }[] = [
    { key: 'ALL', ar: 'الكل', en: 'All' },
    { key: 'PENDING', ar: 'انتظار', en: 'Pending' },
    { key: 'CONFIRMED', ar: 'مؤكد', en: 'Confirmed' },
    { key: 'ON_WAY', ar: 'في الطريق', en: 'On Way' },
    { key: 'DELIVERED', ar: 'مسلّم', en: 'Delivered' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{isRTL ? 'طلبات التوريد B2B' : 'B2B Supply Orders'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{isRTL ? 'طلبات الخياطين لشراء أقمشة ومواد منك مباشرة' : 'Tailors ordering fabrics & materials directly from you'}</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={16} />}>
          {isRTL ? 'عرض منتجات' : 'Add Products'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'} value={`${totalRevenue.toLocaleString()} ر.س`} icon={<DollarSign size={20} />} trend={18} href="/dashboard/merchant/finances" />
        <StatsCard label={isRTL ? 'انتظار الموافقة' : 'Awaiting Approval'} value={pendingCount.toString()} icon={<Clock size={20} />} href="/dashboard/merchant/b2b?filter=PENDING" />
        <StatsCard label={isRTL ? 'إجمالي الطلبات' : 'Total Orders'} value={orders.length.toString()} icon={<ShoppingCart size={20} />} href="/dashboard/merchant/b2b" />
        <StatsCard label={isRTL ? 'مسلّمة' : 'Delivered'} value={orders.filter((o) => o.status === 'DELIVERED').length.toString()} icon={<Building2 size={20} />} href="/dashboard/merchant/b2b" />
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              {isRTL ? `${pendingCount} طلب/طلبات تنتظر موافقتك` : `${pendingCount} order(s) awaiting your approval`}
            </p>
          </div>
          <Button size="sm" variant="warning" onClick={() => setFilter('PENDING')}>
            {isRTL ? 'عرض' : 'View'}
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
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

      {/* Orders */}
      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد طلبات توريد' : 'No supply orders found'}</Card>
      ) : (
      <div className="space-y-3">
        {filtered.map(order => {
          const statusInfo = STATUS_MAP[order.status as keyof typeof STATUS_MAP];
          const isOpen = expanded === order.id;
          return (
            <Card key={order.id} className="dark:bg-slate-800/60 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center gap-4 p-4 text-start hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{order.tailorShop}</p>
                    <Badge variant={statusInfo.variant} size="sm">{isRTL ? statusInfo.ar : statusInfo.en}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{order.id} • {order.date} • {order.items.length} {isRTL ? 'منتج' : 'products'}</p>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="font-black text-primary-700 dark:text-primary-400">{order.total.toLocaleString()} ر.س</p>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-50 dark:border-slate-700">
                  <div className="py-3 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{item.qty} {item.unit} × {item.price} ر.س</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-slate-100">{(item.qty * item.price).toLocaleString()} ر.س</p>
                      </div>
                    ))}
                    {order.notes && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <span className="font-bold">{isRTL ? 'ملاحظات: ' : 'Notes: '}</span>{order.notes}
                      </div>
                    )}
                  </div>
                  {order.status === 'PENDING' && (
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="sm" fullWidth icon={<XCircle size={14} />} onClick={() => handleReject(order.id)}>
                        {isRTL ? 'رفض' : 'Reject'}
                      </Button>
                      <Button variant="primary" size="sm" fullWidth icon={<CheckCircle2 size={14} />} onClick={() => handleAccept(order.id)}>
                        {isRTL ? 'قبول وتجهيز' : 'Accept & Prepare'}
                      </Button>
                    </div>
                  )}
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

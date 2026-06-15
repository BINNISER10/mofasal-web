'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderTrackingTimeline } from '@/components/shared/OrderTrackingTimeline';
import { useAppStore } from '@/lib/stores/appStore';
import { ordersApi } from '@/lib/api/orders';
import { getCustomerStageLabel } from '@mufasal/shared';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ShoppingBag, Package, ChevronLeft, ChevronRight, Star, RefreshCw, Calendar, MapPin,
} from 'lucide-react';

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await ordersApi.getById(id as string);
      setOrder(res.order);
    } catch {
      toast.error(isRTL ? 'فشل تحميل الطلب' : 'Failed to load order');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, isRTL]);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(() => loadOrder(true), 30000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  if (loading) {
    return <LoadingSpinner fullScreen text={isRTL ? 'جاري تحميل الطلب...' : 'Loading order...'} />;
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag size={40} className="text-neutral-200 mx-auto mb-4" />
          <p className="text-neutral-500">{isRTL ? 'الطلب غير موجود' : 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const status = order.status || 'PENDING';
  const stageLabel = getCustomerStageLabel(status, isRTL);
  const deliveryAddr = order.deliveryAddress as { street?: string; city?: string; district?: string } | undefined;
  const fabricMeta = order.orderMeasurements?.[0]?.measurementData as { fabricId?: string; fabricSource?: string } | undefined;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-[#FAFAFA] dark:hover:bg-white/5"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400">
              {isRTL ? 'تابع طلبك' : 'Track order'}
            </p>
            <h1 className="text-xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
              #{order.orderNumber || order.id?.slice(0, 8)}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadOrder(true)}
            className="p-2 rounded-xl border border-[#E8E8E8] hover:bg-[#FAFAFA]"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {status === 'DELIVERED' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Star size={16} />}
              onClick={() => router.push(`/dashboard/customer/orders/${id}/rate`)}
            >
              {isRTL ? 'تقييم' : 'Rate'}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-5 border border-[#E8E8E8] dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-white">
            {isRTL ? 'حالة الطلب' : 'Order status'}
          </h3>
          <Badge variant={status === 'DELIVERED' ? 'success' : status === 'CANCELLED' ? 'error' : 'info'} size="sm">
            {stageLabel}
          </Badge>
        </div>
        <OrderTrackingTimeline status={status} isRTL={isRTL} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5 border border-[#E8E8E8]">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#0A0A0A]">
              <Package size={18} /> {isRTL ? 'عناصر الطلب' : 'Items'}
            </h3>
            {(order.items || []).length === 0 ? (
              <p className="text-sm text-neutral-400">{isRTL ? 'لا توجد عناصر' : 'No items'}</p>
            ) : (
              order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-3 border-b border-[#E8E8E8] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-neutral-500">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    ﷼{(item.unitPrice ?? item.price ?? 0).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 border border-[#E8E8E8]">
            <h3 className="font-semibold mb-3 text-sm text-neutral-500">{isRTL ? 'الملخص' : 'Summary'}</h3>
            <div className="flex justify-between text-lg font-semibold">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span>﷼{(order.grandTotal ?? order.totalAmount ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {order.shop?.nameAr || order.shop?.name || order.shopName || ''}
            </p>
          </Card>
          <Card className="p-5 border border-[#E8E8E8]">
            <h3 className="font-semibold mb-2 text-sm">{isRTL ? 'الدفع' : 'Payment'}</h3>
            <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
              {order.paymentStatus === 'PAID' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'غير مدفوع' : 'Unpaid')}
            </Badge>
          </Card>
          {(order.estimatedDeliveryDate || deliveryAddr) && (
            <Card className="p-5 border border-[#E8E8E8] space-y-2 text-sm">
              <h3 className="font-semibold mb-1">{isRTL ? 'التوصيل' : 'Delivery'}</h3>
              {order.estimatedDeliveryDate && (
                <p className="flex items-center gap-2 text-neutral-600">
                  <Calendar size={14} />
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              )}
              {deliveryAddr?.street && (
                <p className="flex items-start gap-2 text-neutral-600">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{[deliveryAddr.city, deliveryAddr.street].filter(Boolean).join(' — ')}</span>
                </p>
              )}
              {fabricMeta?.fabricSource && (
                <p className="text-xs text-neutral-400">
                  {isRTL ? 'مصدر القماش:' : 'Fabric:'} {fabricMeta.fabricSource === 'marketplace' ? (isRTL ? 'السوق' : 'Marketplace') : (isRTL ? 'المتجر' : 'Shop')}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

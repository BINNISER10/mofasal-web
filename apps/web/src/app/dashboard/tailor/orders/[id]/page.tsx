'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';
import { ordersApi } from '@/lib/api/orders';
import type { OrderStatus } from '@/lib/api/orders';
import { ArrowRight, User, Ruler, Scissors, Package, Calendar, Phone, MapPin, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function TailorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [nextStatus, setNextStatus] = useState('');

  const STAGES = [
    { key: 'PENDING',            emoji: '📩', ar: 'تم استلام الطلب',       en: 'Order Received' },
    { key: 'CONFIRMED',          emoji: '✅', ar: 'تم تأكيد الطلب',        en: 'Order Confirmed' },
    { key: 'IN_PROGRESS',        emoji: '🧵', ar: 'قيد التنفيذ والخياطة', en: 'In Progress & Sewing' },
    { key: 'READY_FOR_DELIVERY', emoji: '📦', ar: 'جاهز للتوصيل',        en: 'Ready for Delivery' },
    { key: 'OUT_FOR_DELIVERY',   emoji: '🚗', ar: 'في الطريق للتسليم',     en: 'Out for Delivery' },
    { key: 'DELIVERED',          emoji: '🤝', ar: 'تم التسليم بنجاح',      en: 'Delivered' },
    { key: 'COMPLETED',          emoji: '🎉', ar: 'مكتمل ومرحّل',         en: 'Completed' },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getById(orderId);
      setOrder(res.order);
      
      try {
        const trackingRes = await ordersApi.getTracking(orderId);
        const trackData = Array.isArray(trackingRes) ? trackingRes : (trackingRes as any).tracking || [];
        setTracking(trackData);
      } catch (trackErr) {
        console.error('Failed to load tracking data', trackErr);
      }
    } catch (err: any) {
      console.error('Failed to load order details', err);
      toast.error(err?.message || (isRTL ? 'عذراً، فشل تحميل تفاصيل الطلب' : 'Failed to load order details'));
    } finally {
      setLoading(false);
    }
  }, [orderId, isRTL]);

  useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId, fetchData]);

  const currentStatus = order?.status || 'PENDING';
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);
  const nextStage = STAGES[currentIdx + 1];

  const advanceStage = async () => {
    if (!nextStage) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, { status: nextStage.key as OrderStatus });
      toast.success(isRTL ? `✅ تم التحديث إلى: ${nextStage.ar}` : `✅ Updated to: ${nextStage.en}`);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update stage', err);
      toast.error(err?.message || (isRTL ? 'عذراً، فشل تحديث حالة الطلب' : 'Failed to update order status'));
    } finally {
      setUpdating(false);
      setShowStatusConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center p-6">
        <AlertCircle className="text-red-500" size={48} />
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">{isRTL ? 'الطلب غير موجود' : 'Order Not Found'}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
          {isRTL ? 'تعذر العثور على الطلب المطلوب، يرجى التأكد من المعرّف والمحاولة لاحقاً.' : 'We could not find the requested order. Please verify the ID and try again.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard/tailor/orders')}>
          {isRTL ? 'العودة لقائمة الطلبات' : 'Back to Orders'}
        </Button>
      </div>
    );
  }

  // extract measurements
  const measurements = order.orderMeasurements?.[0]?.measurementData || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <a href="/dashboard/tailor/orders" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <ArrowRight size={20} className="text-gray-500 dark:text-slate-400" />
          </a>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
              {isRTL ? `طلب #${order.orderNumber || order.id.slice(0, 8)}` : `Order #${order.orderNumber || order.id.slice(0, 8)}`}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isRTL ? `تاريخ الطلب: ${formatDate(order.createdAt)}` : `Ordered at: ${formatDate(order.createdAt)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="md">
            {isRTL ? (STAGES[currentIdx]?.ar || currentStatus) : (STAGES[currentIdx]?.en || currentStatus)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Stages Progress */}
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Package size={18} className="text-primary-600" />
              {isRTL ? 'مراحل الإنتاج والتوصيل' : 'Production & Delivery Stages'}
            </h3>
            <div className="space-y-2">
              {STAGES.map((stage, idx) => {
                const isDone = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isPending = idx > currentIdx;
                return (
                  <div key={stage.key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrent ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                    : isDone ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-slate-700/30 opacity-50'
                  }`}>
                    <div className="text-xl w-8 text-center flex-shrink-0">{stage.emoji}</div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        isCurrent ? 'text-primary-700 dark:text-primary-300'
                        : isDone ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-400 dark:text-slate-500'
                      }`}>{isRTL ? stage.ar : stage.en}</p>
                    </div>
                    {isDone && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                    {isCurrent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">{isRTL ? 'الحالية' : 'Current'}</span>}
                  </div>
                );
              })}
            </div>

            {nextStage && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'المرحلة التالية' : 'Next Stage'}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-0.5">{nextStage.emoji} {isRTL ? nextStage.ar : nextStage.en}</p>
                  </div>
                  <Button variant="primary" icon={updating ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />} disabled={updating} onClick={() => { setNextStatus(nextStage.key); setShowStatusConfirm(true); }}>
                    {isRTL ? 'تحديث المرحلة' : 'Advance Stage'}
                  </Button>
                </div>
              </div>
            )}
            {!nextStage && currentStatus === 'COMPLETED' && (
              <div className="mt-4 text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-700 dark:text-green-400">{isRTL ? 'اكتمل الطلب وتم تسليمه بنجاح!' : 'Order completed and delivered successfully!'}</p>
              </div>
            )}
          </Card>

          {/* Timeline History */}
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Package size={18} className="text-primary-600" />
              {isRTL ? 'سجل التتبع والمحطات الكلية' : 'Tracking Log & Milestones'}
            </h3>
            <OrderTimeline tracking={tracking} locale={isRTL ? 'ar' : 'en'} />
          </Card>

          {/* Measurements */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Ruler size={18} className="text-primary-600" />{isRTL ? 'مقاسات التفصيل' : 'Measurements'}</h3>} className="p-5">
            {order.orderMeasurements?.[0] && (order.orderMeasurements[0].customerType || order.orderMeasurements[0].garmentType) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {order.orderMeasurements[0].customerType && (
                  <Badge variant="info" className="bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800">
                    {isRTL ? 'نوع العميل: ' : 'Customer: '}
                    {order.orderMeasurements[0].customerType === 'man' || order.orderMeasurements[0].customerType === 'MAN' ? (isRTL ? 'رجل' : 'Man') : (isRTL ? 'طفل' : 'Child')}
                    {order.orderMeasurements[0].customerAge ? ` (${order.orderMeasurements[0].customerAge} ${isRTL ? 'سنة' : 'years'})` : ''}
                  </Badge>
                )}
                {order.orderMeasurements[0].garmentType && (
                  <Badge variant="gold" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    {isRTL ? 'نوع القطعة: ' : 'Garment: '}
                    {order.orderMeasurements[0].garmentType.toUpperCase()}
                  </Badge>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(measurements).map(([key, val]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{key}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{val as string} <span className="text-xs text-gray-400 dark:text-slate-500">سم</span></p>
                </div>
              ))}
              {Object.keys(measurements).length === 0 && (
                <div className="col-span-full py-6 text-center text-sm text-gray-400">
                  {isRTL ? 'لم يتم تسجيل مقاسات مخصصة للطلب بعد' : 'No custom measurements recorded for this order.'}
                </div>
              )}
            </div>
          </Card>

          {/* Order Items & Fabric */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Scissors size={18} className="text-primary-600" />{isRTL ? 'الأصناف والأقمشة المطلوبة' : 'Order Items & Fabrics'}</h3>} className="p-5">
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'الكمية:' : 'Quantity:'} {item.quantity}</p>
                  </div>
                  <p className="font-bold text-primary-700 dark:text-primary-400">{formatCurrency(item.totalPrice || (item.unitPrice * item.quantity))}</p>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center">{isRTL ? 'لا توجد تفاصيل أصناف' : 'No items found.'}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info Card */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><User size={18} className="text-primary-600" />{isRTL ? 'معلومات العميل' : 'Customer Info'}</h3>} className="p-5">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/80 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  {order.customer?.name?.charAt(0) || 'ع'}
                </div>
                <div>
                  <p className="font-semibold dark:text-slate-200">{order.customer?.name || (isRTL ? 'عميل مفصل' : 'Mufasal Customer')}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400" dir="ltr">{order.customer?.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                <Phone size={14} />
                <span>{order.customer?.phone || '—'}</span>
              </div>
              {order.estimatedDeliveryDate && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                  <Calendar size={14} />
                  <span>{isRTL ? 'تاريخ الاستلام المتوقع:' : 'Estimated delivery:'} {formatDate(order.estimatedDeliveryDate)}</span>
                </div>
              )}
              <div className="pt-2">
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'error'}>
                  {order.paymentStatus === 'PAID' ? (isRTL ? 'تم سداد الفاتورة' : 'Paid') : (isRTL ? 'غير مدفوع' : 'Unpaid')}
                  {order.paymentMethod ? ` - ${order.paymentMethod}` : ''}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Delivery Address Card */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-primary-600" />{isRTL ? 'تفاصيل الاستلام والتوصيل' : 'Delivery Address'}</h3>} className="p-5">
            <div className="text-sm space-y-1">
              <p className="font-semibold dark:text-slate-200">
                {order.deliveryMethod === 'DELIVERY' ? (isRTL ? 'توصيل للمنزل' : 'Home Delivery') : (isRTL ? 'استلام حضوري من المعرض' : 'Shop Pickup')}
              </p>
              <p className="text-gray-600 dark:text-slate-400">
                {order.customerNotes ? `${isRTL ? 'ملاحظات العميل:' : 'Notes:'} ${order.customerNotes}` : ''}
              </p>
            </div>
          </Card>

          {/* Price Summary Card */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'ملخص الفاتورة' : 'Price Summary'}</h3>} className="p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-semibold dark:text-slate-200">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                <span className="font-semibold dark:text-slate-200">{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">{isRTL ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                <span className="font-semibold dark:text-slate-200">{formatCurrency(order.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary-700 dark:text-primary-400 border-t border-gray-100 dark:border-slate-800 pt-2 mt-2">
                <span>{isRTL ? 'الإجمالي الشامل' : 'Grand Total'}</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </Card>

          {/* Staff Card */}
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الموظف المسؤول' : 'Assigned Staff'}</h3>} className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {order.staffName?.charAt(0) || 'خ'}
              </div>
              <div>
                <p className="font-semibold dark:text-slate-200">
                  {order.staffName || (isRTL ? 'خياط المعمل الرئيسي' : 'Master Tailor')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {isRTL ? 'المسؤول عن القص والتجميع' : 'Responsible for cutting & assembly'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 transition-transform">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">
              {isRTL ? 'تأكيد تحديث الحالة' : 'Confirm Status Update'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              {isRTL 
                ? `هل أنت متأكد من تحديث حالة الطلب إلى "${STAGES.find(s => s.key === nextStatus)?.ar || nextStatus}"؟` 
                : `Are you sure you want to update the status to "${STAGES.find(s => s.key === nextStatus)?.en || nextStatus}"?`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowStatusConfirm(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="primary" fullWidth onClick={advanceStage}>
                {isRTL ? 'تأكيد' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

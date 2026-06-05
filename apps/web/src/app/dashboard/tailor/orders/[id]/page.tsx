'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { ordersApi } from '@/lib/api/orders';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ShoppingBag, Clock, User, Phone, MapPin, Ruler, Package,
  ChevronLeft, ChevronRight, CheckCircle2, Truck, Scissors,
  ArrowLeft, Printer, MessageSquare,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: React.ReactNode }> = {
  PENDING: { labelAr: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-[#D4AF37]/10 text-[#B8960A]', icon: <Clock size={14} /> },
  CONFIRMED: { labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'bg-[#00373E]/10 text-[#00373E]', icon: <CheckCircle2 size={14} /> },
  IN_PROGRESS: { labelAr: 'قيد التنفيذ', labelEn: 'In Progress', color: 'bg-[#00373E]/10 text-[#00373E]', icon: <Scissors size={14} /> },
  READY_FOR_DELIVERY: { labelAr: 'جاهز للتوصيل', labelEn: 'Ready', color: 'bg-[#735B4D]/10 text-[#735B4D]', icon: <Package size={14} /> },
  OUT_FOR_DELIVERY: { labelAr: 'في الطريق', labelEn: 'Out for Delivery', color: 'bg-[#D4AF37]/10 text-[#B8960A]', icon: <Truck size={14} /> },
  DELIVERED: { labelAr: 'تم التوصيل', labelEn: 'Delivered', color: 'bg-[#00373E]/10 text-[#00373E]', icon: <CheckCircle2 size={14} /> },
  COMPLETED: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'bg-[#00373E]/10 text-[#00373E]', icon: <CheckCircle2 size={14} /> },
  CANCELLED: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-[#481719]/10 text-[#481719]', icon: <Clock size={14} /> },
};

export default function TailorOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi.getById(id)
      .then((res) => setOrder(res.order))
      .catch((err) => {
        console.error('Failed to fetch order', err);
        toast.error(isRTL ? 'فشل تحميل الطلب' : 'Failed to load order');
      })
      .finally(() => setLoading(false));
  }, [id, isRTL]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await ordersApi.updateStatus(id, { status: newStatus as any });
      setOrder({ ...order, status: newStatus });
      toast.success(isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error(isRTL ? 'فشل تحديث الحالة' : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text={isRTL ? 'جاري تحميل الطلب...' : 'Loading order...'} />;
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag size={48} className="text-[#735B4D]/30 mx-auto mb-4" />
          <p className="text-[#735B4D]/60">{isRTL ? 'الطلب غير موجود' : 'Order not found'}</p>
          <Button variant="ghost" onClick={() => router.back()} className="mt-4" icon={<ArrowLeft size={16} />}>
            {isRTL ? 'رجوع' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F2E8D4]/30 transition-colors">
            {isRTL ? <ChevronRight size={20} className="text-[#735B4D]" /> : <ChevronLeft size={20} className="text-[#735B4D]" />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#00373E]">
              {isRTL ? 'طلب' : 'Order'} #{order.orderNumber || order.id?.slice(0, 8)}
            </h1>
            <Badge variant="primary" size="sm" className="mt-1">
              <span className="flex items-center gap-1">{statusConfig.icon} {isRTL ? statusConfig.labelAr : statusConfig.labelEn}</span>
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<Printer size={16} />}>
          {isRTL ? 'طباعة' : 'Print'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2">
              <User size={18} className="text-[#D4AF37]" />
              {isRTL ? 'معلومات العميل' : 'Customer Info'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#735B4D]/60">{isRTL ? 'الاسم' : 'Name'}</p>
                <p className="text-sm font-semibold text-[#00373E]">{order.customer?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#735B4D]/60">{isRTL ? 'الهاتف' : 'Phone'}</p>
                <p className="text-sm font-semibold text-[#00373E]">{order.customer?.phone || '—'}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#D4AF37]" />
              {isRTL ? 'عناصر الطلب' : 'Order Items'}
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#D0D6D7]/10 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-[#00373E]">{item.name}</p>
                    <p className="text-xs text-[#735B4D]/60">{isRTL ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#00373E]">{item.unitPrice?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</p>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p className="text-sm text-[#735B4D]/60 text-center py-4">{isRTL ? 'لا توجد عناصر' : 'No items'}</p>
              )}
            </div>
          </Card>

          {/* Notes */}
          {order.customerNotes && (
            <Card className="p-5">
              <h3 className="font-bold text-[#00373E] mb-2 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#D4AF37]" />
                {isRTL ? 'ملاحظات العميل' : 'Customer Notes'}
              </h3>
              <p className="text-sm text-[#735B4D]">{order.customerNotes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#735B4D]">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="text-sm font-semibold text-[#00373E]">{order.totalAmount?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#735B4D]">{isRTL ? 'ضريبة القيمة المضافة' : 'VAT'}</span>
                <span className="text-sm font-semibold text-[#00373E]">{order.vatAmount?.toLocaleString() || '0'} {isRTL ? 'ريال' : 'SAR'}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#735B4D]">{isRTL ? 'رسوم التوصيل' : 'Delivery'}</span>
                  <span className="text-sm font-semibold text-[#00373E]">{order.deliveryFee?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-[#D0D6D7]/20">
                <span className="text-sm font-bold text-[#00373E]">{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-lg font-bold text-[#00373E]">{order.grandTotal?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span>
              </div>
            </div>
          </Card>

          {/* Status Update */}
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'تحديث الحالة' : 'Update Status'}</h3>
            <div className="space-y-2">
              {['CONFIRMED', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating || order.status === status}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      order.status === status
                        ? 'bg-[#00373E] text-white'
                        : 'bg-[#F2E8D4]/20 text-[#00373E] hover:bg-[#F2E8D4]/40'
                    } disabled:opacity-50`}
                  >
                    {config.icon}
                    {isRTL ? config.labelAr : config.labelEn}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Payment Status */}
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-2">{isRTL ? 'حالة الدفع' : 'Payment Status'}</h3>
            <Badge variant={order.paymentStatus === 'PAID' ? 'primary' : 'danger'} size="md">
              {order.paymentStatus === 'PAID' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'غير مدفوع' : 'Unpaid')}
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}

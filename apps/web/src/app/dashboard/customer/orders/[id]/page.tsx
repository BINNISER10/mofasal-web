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
import { ShoppingBag, Clock, CheckCircle2, Truck, Scissors, Package, ChevronLeft, ChevronRight, Star, MessageSquare, ArrowLeft } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING', labelAr: 'قيد الانتظار', labelEn: 'Pending', icon: <Clock size={16} /> },
  { key: 'CONFIRMED', labelAr: 'مؤكد', labelEn: 'Confirmed', icon: <CheckCircle2 size={16} /> },
  { key: 'IN_PROGRESS', labelAr: 'قيد التنفيذ', labelEn: 'In Progress', icon: <Scissors size={16} /> },
  { key: 'READY_FOR_DELIVERY', labelAr: 'جاهز', labelEn: 'Ready', icon: <Package size={16} /> },
  { key: 'OUT_FOR_DELIVERY', labelAr: 'في الطريق', labelEn: 'On the Way', icon: <Truck size={16} /> },
  { key: 'DELIVERED', labelAr: 'تم التوصيل', labelEn: 'Delivered', icon: <CheckCircle2 size={16} /> },
];

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersApi.getById(id as string)
      .then((res) => setOrder(res.order))
      .catch(() => toast.error(isRTL ? 'فشل تحميل الطلب' : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id, isRTL]);

  if (loading) return <LoadingSpinner fullScreen text={isRTL ? 'جاري تحميل الطلب...' : 'Loading order...'} />;
  if (!order) return <div className="flex items-center justify-center py-20"><div className="text-center"><ShoppingBag size={48} className="text-[#735B4D]/30 mx-auto mb-4" /><p className="text-[#735B4D]/60">{isRTL ? 'الطلب غير موجود' : 'Order not found'}</p></div></div>;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F2E8D4]/30">
            {isRTL ? <ChevronRight size={20} className="text-[#735B4D]" /> : <ChevronLeft size={20} className="text-[#735B4D]" />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#00373E]">{isRTL ? 'طلب' : 'Order'} #{order.orderNumber || order.id?.slice(0, 8)}</h1>
            <p className="text-xs text-[#735B4D]/60 mt-1">{new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
          </div>
        </div>
        {order.status === 'DELIVERED' && <Button variant="gold" size="sm" icon={<Star size={16} />} onClick={() => router.push(/dashboard/customer/orders//rate)}>{isRTL ? 'تقييم' : 'Rate'}</Button>}
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'تتبع الطلب' : 'Order Tracking'}</h3>
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={w-10 h-10 rounded-full flex items-center justify-center }>{step.icon}</div>
                <p className={	ext-[10px] mt-1.5 text-center }>{isRTL ? step.labelAr : step.labelEn}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2"><Package size={18} className="text-[#D4AF37]" />{isRTL ? 'عناصر الطلب' : 'Order Items'}</h3>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#D0D6D7]/10 last:border-0">
                <div><p className="text-sm font-semibold text-[#00373E]">{item.name}</p><p className="text-xs text-[#735B4D]/60">{isRTL ? 'الكمية:' : 'Qty:'} {item.quantity}</p></div>
                <p className="text-sm font-bold text-[#00373E]">{item.unitPrice?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</p>
              </div>
            ))}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</h3>
            <div className="flex justify-between pt-3 border-t border-[#D0D6D7]/20">
              <span className="text-sm font-bold text-[#00373E]">{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-lg font-bold text-[#00373E]">{order.grandTotal?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-2">{isRTL ? 'حالة الدفع' : 'Payment'}</h3>
            <Badge variant={order.paymentStatus === 'PAID' ? 'primary' : 'danger'} size="md">{order.paymentStatus === 'PAID' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'غير مدفوع' : 'Unpaid')}</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
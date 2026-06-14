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
import { ShoppingBag, User, Package, ChevronLeft, ChevronRight, ArrowLeft, Printer } from 'lucide-react';

export default function TailorOrderDetailPage() {
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

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag size={48} className="text-[#735B4D]/30 mx-auto mb-4" />
          <p className="text-[#735B4D]/60">{isRTL ? 'الطلب غير موجود' : 'Order not found'}</p>
          <Button variant="ghost" onClick={() => router.back()} className="mt-4" icon={<ArrowLeft size={16} />}>{isRTL ? 'رجوع' : 'Back'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F2E8D4]/30">
            {isRTL ? <ChevronRight size={20} className="text-[#735B4D]" /> : <ChevronLeft size={20} className="text-[#735B4D]" />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#00373E]">{isRTL ? 'طلب' : 'Order'} #{order.orderNumber || order.id?.slice(0, 8)}</h1>
            <Badge variant="primary" size="sm" className="mt-1">{order.status}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<Printer size={16} />}>{isRTL ? 'طباعة' : 'Print'}</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2"><User size={18} className="text-[#D4AF37]" />{isRTL ? 'معلومات العميل' : 'Customer Info'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[#735B4D]/60">{isRTL ? 'الاسم' : 'Name'}</p><p className="text-sm font-semibold text-[#00373E]">{order.customer?.name || '—'}</p></div>
              <div><p className="text-xs text-[#735B4D]/60">{isRTL ? 'الهاتف' : 'Phone'}</p><p className="text-sm font-semibold text-[#00373E]">{order.customer?.phone || '—'}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2"><Package size={18} className="text-[#D4AF37]" />{isRTL ? 'عناصر الطلب' : 'Order Items'}</h3>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#D0D6D7]/10 last:border-0">
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
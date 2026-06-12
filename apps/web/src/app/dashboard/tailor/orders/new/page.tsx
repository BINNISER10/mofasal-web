'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { shopsApi } from '@/lib/api/shops';
import { ordersApi } from '@/lib/api/orders';
import toast from 'react-hot-toast';
import { User, Phone, Scissors, Loader2, CheckCircle2 } from 'lucide-react';

export default function TailorNewOrderPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const shopId = user?.shopId || 'shop-riyadh-1';

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    shopsApi.getServices(shopId)
      .then((res) => {
        const list = (Array.isArray(res) ? res : []).map((s: any) => ({
          id: s.id,
          nameAr: s.nameAr || s.name,
          price: s.price,
        }));
        setServices(list);
        if (list.length > 0) setServiceId(list[0].id);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [shopId]);

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !serviceId) {
      toast.error(isRTL ? 'أكمل بيانات العميل والخدمة' : 'Complete customer and service details');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ordersApi.create({
        shopId,
        items: [{
          name: selectedService?.nameAr || 'تفصيل',
          quantity: 1,
          unitPrice: selectedService?.price || 850,
        }],
        deliveryAddress: {
          label: 'استلام من المحل',
          street: 'المحل',
          district: '—',
          city: 'الرياض',
        },
        notes: [customerName.trim(), customerPhone.trim(), notes].filter(Boolean).join(' | '),
        paymentMethod: 'cash',
      });
      toast.success(isRTL ? 'تم إنشاء الطلب' : 'Order created');
      router.push(`/dashboard/tailor/orders/${res.order.id}`);
    } catch (err: any) {
      toast.error(err?.message || (isRTL ? 'تعذر إنشاء الطلب' : 'Failed to create order'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
          {isRTL ? 'طلب حضوري' : 'Walk-in order'}
        </p>
        <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white">
          {isRTL ? 'طلب جديد' : 'New order'}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {isRTL ? 'سجّل طلب عميل حضوري في المحل' : 'Register a walk-in customer order'}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={isRTL ? 'اسم العميل' : 'Customer name'}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            icon={<User size={18} />}
            required
          />
          <Input
            label={isRTL ? 'جوال العميل' : 'Customer phone'}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
            icon={<Phone size={18} />}
            placeholder="9665XXXXXXXX"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Scissors size={16} /> {isRTL ? 'الخدمة' : 'Service'}
            </label>
            {loadingServices ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setServiceId(svc.id)}
                    className={`p-3 rounded-xl border text-right transition-colors ${
                      serviceId === svc.id ? 'border-[#00373E] bg-[#00373E]/5' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <span className="font-medium text-sm">{svc.nameAr}</span>
                    <span className="text-xs text-[#00373E] font-semibold mr-2">﷼{svc.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-[#00373E]/40"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => router.push('/dashboard/tailor/orders')}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting || loadingServices}
              icon={submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            >
              {submitting ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء الطلب' : 'Create order')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

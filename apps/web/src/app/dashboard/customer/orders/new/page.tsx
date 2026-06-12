'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderTrackingTimeline } from '@/components/shared/OrderTrackingTimeline';
import { useAppStore } from '@/lib/stores/appStore';
import { shopsApi } from '@/lib/api/shops';
import { ordersApi } from '@/lib/api/orders';
import { WIZARD_STEPS } from '@mufasal/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThobeSpecSelector, DEFAULT_THOBE_SPEC, ThobeSpec } from '@/components/shared/ThobeSpecSelector';
import { FabricPicker, SelectedFabric } from '@/components/shared/FabricPicker';
import {
  Store, Scissors, Ruler, Package, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, Search, Star, MapPin, Clock, Check, Truck,
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'mada', labelAr: 'بطاقة مدى', icon: '💳' },
  { id: 'applepay', labelAr: 'Apple Pay', icon: '🍎' },
  { id: 'stcpay', labelAr: 'STC Pay', icon: '📱' },
  { id: 'tamara', labelAr: 'تمارا', icon: '📆' },
  { id: 'tabby', labelAr: 'تابي', icon: '📆' },
];

const MEASURE_FIELDS = [
  { key: 'chest', label: 'الصدر (سم)' },
  { key: 'waist', label: 'الخصر (سم)' },
  { key: 'shoulder', label: 'عرض الكتف (سم)' },
  { key: 'sleeve', label: 'طول الكم (سم)' },
  { key: 'height', label: 'الطول (سم)' },
  { key: 'neck', label: 'محيط الرقبة (سم)' },
];

interface OrderState {
  shopId: string | null;
  serviceId: string | null;
  measurements: Record<string, string>;
  fabricChoice: 'shop' | 'marketplace' | null;
  fabric: SelectedFabric;
  thobeSpec: ThobeSpec;
  notes: string;
  deliveryAddress: string;
  deliveryCity: string;
  paymentMethod: string | null;
}

const initialOrder: OrderState = {
  shopId: null,
  serviceId: null,
  measurements: {},
  fabricChoice: null,
  fabric: { type: 'shop' },
  thobeSpec: { ...DEFAULT_THOBE_SPEC },
  notes: '',
  deliveryAddress: '',
  deliveryCity: 'الرياض',
  paymentMethod: null,
};

const STEP_ICONS = [Store, CreditCard, Truck];

function NewOrderPageContent() {
  const { isRTL } = useAppStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState<OrderState>(initialOrder);
  const [search, setSearch] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryShopId = searchParams.get('shop');
    const queryServiceId = searchParams.get('service');
    if (queryShopId) setOrder((p) => ({ ...p, shopId: queryShopId }));
    if (queryServiceId) setOrder((p) => ({ ...p, serviceId: queryServiceId }));
    if (searchParams.get('fabric')) setOrder((p) => ({ ...p, fabricChoice: 'marketplace' }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    shopsApi.list({ limit: '50' })
      .then((res) => {
        if (!active) return;
        setShops((res.shops || []).map((s: any) => ({
          id: s.id,
          nameAr: s.nameAr || s.name,
          rating: s.rating || 0,
          city: s.city || '',
          delivery: s.deliveryDays || 7,
          minPrice: s.minOrderAmount || 0,
        })));
      })
      .catch(() => setShops([]))
      .finally(() => { if (active) setLoadingShops(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!order.shopId) {
      setServices([]);
      return;
    }
    setLoadingServices(true);
    shopsApi.getServices(String(order.shopId))
      .then((res) => {
        setServices((res || []).map((s: any) => ({
          id: s.id,
          nameAr: s.nameAr || s.name,
          price: s.price,
          days: s.duration || 5,
          icon: '✂️',
        })));
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [order.shopId]);

  const selectedShop = shops.find((s) => s.id === order.shopId);
  const selectedService = services.find((s) => s.id === order.serviceId);

  const canProceed = () => {
    if (step === 1) {
      return order.shopId && order.serviceId && order.fabricChoice && order.deliveryAddress.length > 3;
    }
    if (step === 2) return order.paymentMethod !== null && !submitting;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const measurements: Record<string, number> = {};
      Object.entries(order.measurements).forEach(([k, v]) => {
        const n = parseFloat(v);
        if (!isNaN(n)) measurements[k] = n;
      });

      const res = await ordersApi.create({
        shopId: String(order.shopId),
        fabricSource: order.fabricChoice || undefined,
        fabricId: order.fabric.productId || undefined,
        measurements,
        items: [{
          name: selectedService?.nameAr || 'خدمة تفصيل',
          quantity: 1,
          unitPrice: (order.fabric.productPrice || 0) + (selectedService?.price || 0),
        }],
        deliveryAddress: {
          label: 'عنوان العميل',
          street: order.deliveryAddress,
          city: order.deliveryCity || selectedShop?.city || 'الرياض',
        },
        notes: order.notes || undefined,
        paymentMethod: order.paymentMethod || undefined,
        thobeSpec: order.thobeSpec,
      });
      setCreatedOrder(res.order);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || (isRTL ? 'تعذر إنشاء الطلب' : 'Failed to create order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) handleSubmit();
  };

  const handleBack = () => {
    if (step === 1) router.push('/dashboard/customer/orders');
    else if (step > 1 && step < 3) setStep(step - 1);
  };

  if (step === 3 && createdOrder) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-emerald-600" />
          </div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
            {isRTL ? 'الخطوة ٣ — تابع' : 'Step 3 — Track'}
          </p>
          <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'طلبك قيد المتابعة' : 'Your order is on track'}
          </h2>
          <p className="text-neutral-500 text-sm mt-2">
            #{createdOrder.orderNumber || createdOrder.id?.slice(0, 8)}
          </p>
        </div>

        <Card className="p-5 border border-[#E8E8E8]">
          <OrderTrackingTimeline status="PENDING" isRTL={isRTL} />
        </Card>

        <div className="rounded-2xl border border-[#E8E8E8] p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500">{isRTL ? 'المتجر' : 'Shop'}</span>
            <span className="font-medium">{selectedShop?.nameAr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">{isRTL ? 'الخدمة' : 'Service'}</span>
            <span className="font-medium">{selectedService?.nameAr}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-[#E8E8E8]">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span>﷼{selectedService?.price}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(`/dashboard/customer/orders/${createdOrder.id}`)}
          >
            {isRTL ? 'تتبع مباشر' : 'Live tracking'}
          </Button>
          <Button variant="outline" fullWidth onClick={() => router.push('/dashboard/customer')}>
            {isRTL ? 'الرئيسية' : 'Home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
          {isRTL ? 'ثلاث خطوات' : 'Three steps'}
        </p>
        <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
          {isRTL ? 'طلب جديد' : 'New order'}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {isRTL ? 'اختر · أكد · تابع' : 'Choose · Confirm · Track'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {WIZARD_STEPS.slice(0, 2).map((s, i) => {
          const Icon = STEP_ICONS[i];
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done ? 'bg-[#00373E] border-[#00373E] text-white'
                      : active ? 'border-[#00373E] text-[#00373E]'
                      : 'border-[#E8E8E8] text-neutral-400'
                  }`}
                >
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-[#0A0A0A]' : 'text-neutral-400'}`}>
                  {isRTL ? s.labelAr : s.labelEn}
                </span>
              </div>
              {i < 1 && (
                <div className={`h-0.5 flex-1 mb-4 ${done ? 'bg-[#00373E]' : 'bg-[#E8E8E8]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="p-6 border border-[#E8E8E8] dark:border-white/10">
        {step === 1 && (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-white mb-3 flex items-center gap-2">
                <Store size={16} /> {isRTL ? 'المتجر' : 'Shop'}
              </h3>
              <div className="flex items-center gap-2 rounded-full border border-[#E8E8E8] px-3 py-2 mb-3">
                <Search size={14} className="text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRTL ? 'ابحث...' : 'Search...'}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loadingShops ? (
                  <p className="text-sm text-neutral-400 text-center py-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : shops.filter((s) => !search || s.nameAr.includes(search)).map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setOrder({ ...order, shopId: shop.id, serviceId: null })}
                    className={`w-full p-3 rounded-xl border text-right transition-colors ${
                      order.shopId === shop.id
                        ? 'border-[#00373E] bg-[#00373E]/5'
                        : 'border-[#E8E8E8] hover:border-[#00373E]/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Star size={10} className="fill-[#B8963E] text-[#B8963E]" />
                        {shop.rating}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{shop.nameAr}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 justify-end mt-0.5">
                          <MapPin size={10} />{shop.city}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {order.shopId && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Scissors size={16} /> {isRTL ? 'الخدمة' : 'Service'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(loadingServices ? [] : services).map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setOrder({ ...order, serviceId: svc.id })}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        order.serviceId === svc.id ? 'border-[#00373E] bg-[#00373E]/5' : 'border-[#E8E8E8]'
                      }`}
                    >
                      <p className="text-sm font-medium">{svc.nameAr}</p>
                      <p className="text-xs text-[#00373E] font-semibold mt-1">﷼{svc.price}</p>
                      <p className="text-[10px] text-neutral-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Clock size={9} />{svc.days} {isRTL ? 'ي' : 'd'}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package size={16} /> {isRTL ? 'القماش' : 'Fabric'}
              </h3>
              <FabricPicker
                value={order.fabric}
                onChange={(fabric) => setOrder({ ...order, fabric, fabricChoice: fabric.type })}
                shopId={order.shopId || undefined}
                compact
              />
            </section>

            {order.serviceId && services.find(s => s.id === order.serviceId)?.nameAr?.includes('ثوب') && (
              <section>
                <ThobeSpecSelector
                  value={order.thobeSpec}
                  onChange={(spec) => setOrder({ ...order, thobeSpec: spec })}
                />
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Ruler size={16} /> {isRTL ? 'المقاسات (اختياري)' : 'Measurements (optional)'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {MEASURE_FIELDS.map((f) => (
                  <input
                    key={f.key}
                    type="number"
                    placeholder={f.label}
                    value={order.measurements[f.key] || ''}
                    onChange={(e) => setOrder({ ...order, measurements: { ...order.measurements, [f.key]: e.target.value } })}
                    className="border border-[#E8E8E8] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00373E]/40"
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">{isRTL ? 'عنوان التوصيل' : 'Delivery address'}</h3>
              <input
                value={order.deliveryCity}
                onChange={(e) => setOrder({ ...order, deliveryCity: e.target.value })}
                placeholder={isRTL ? 'المدينة' : 'City'}
                className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-sm mb-2 outline-none"
              />
              <input
                value={order.deliveryAddress}
                onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })}
                placeholder={isRTL ? 'الحي، الشارع، رقم المبنى...' : 'District, street...'}
                className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00373E]/40"
              />
            </section>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-[#0A0A0A] flex items-center gap-2">
              <CreditCard size={18} /> {isRTL ? 'أكد طلبك' : 'Confirm your order'}
            </h3>

            <div className="rounded-xl border border-[#E8E8E8] p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">{isRTL ? 'المتجر' : 'Shop'}</span><span>{selectedShop?.nameAr}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">{isRTL ? 'الخدمة' : 'Service'}</span><span>{selectedService?.nameAr}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">{isRTL ? 'العنوان' : 'Address'}</span><span className="truncate max-w-[180px]">{order.deliveryAddress}</span></div>
              <div className="flex justify-between font-semibold pt-2 border-t border-[#E8E8E8]">
                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span>﷼{selectedService?.price}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{isRTL ? 'طريقة الدفع' : 'Payment'}</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setOrder({ ...order, paymentMethod: pm.id })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      order.paymentMethod === pm.id ? 'border-[#00373E] bg-[#00373E]/5' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <span>{pm.icon}</span>
                    <span className="text-sm font-medium">{pm.labelAr}</span>
                    {order.paymentMethod === pm.id && <Check size={16} className="ms-auto text-[#00373E]" />}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={order.notes}
              onChange={(e) => setOrder({ ...order, notes: e.target.value })}
              placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
              className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-sm resize-none outline-none"
            />
          </div>
        )}
      </Card>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={submitting}
          icon={isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        >
          {step === 1 ? (isRTL ? 'إلغاء' : 'Cancel') : (isRTL ? 'رجوع' : 'Back')}
        </Button>
        <span className="text-xs text-neutral-400">
          {isRTL ? `خطوة ${step} من 2` : `Step ${step} of 2`}
        </span>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
          icon={step === 2 ? <CheckCircle2 size={16} /> : isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        >
          {step === 2
            ? submitting ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'أكد واطلب' : 'Confirm & order')
            : (isRTL ? 'التالي' : 'Next')}
        </Button>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-neutral-400">...</div>}>
      <NewOrderPageContent />
    </Suspense>
  );
}

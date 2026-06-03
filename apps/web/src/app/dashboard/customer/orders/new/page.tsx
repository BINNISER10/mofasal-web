'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { shopsApi } from '@/lib/api/shops';
import { ordersApi } from '@/lib/api/orders';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  Scissors,
  Ruler,
  Package,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  MapPin,
  Clock,
  Check,
} from 'lucide-react';

const STEPS = [
  { id: 1, iconAr: 'المتجر', iconEn: 'Shop', icon: Store },
  { id: 2, iconAr: 'الخدمة', iconEn: 'Service', icon: Scissors },
  { id: 3, iconAr: 'المقاسات', iconEn: 'Measurements', icon: Ruler },
  { id: 4, iconAr: 'التفاصيل', iconEn: 'Details', icon: Package },
  { id: 5, iconAr: 'الدفع', iconEn: 'Payment', icon: CreditCard },
];

const mockShops = [
  { id: 1, nameAr: 'خياطة الرجال الراقية', rating: 4.9, city: 'الرياض', delivery: 7, minPrice: 450, category: 'رجالي' },
  { id: 2, nameAr: 'بيت البشوت الفاخر', rating: 4.8, city: 'جدة', delivery: 5, minPrice: 380, category: 'رجالي' },
  { id: 3, nameAr: 'خياطة الأطفال السعيدة', rating: 4.7, city: 'الرياض', delivery: 4, minPrice: 220, category: 'أطفال' },
  { id: 4, nameAr: 'بيت الثوب التقليدي', rating: 4.9, city: 'مكة', delivery: 6, minPrice: 300, category: 'رجالي' },
];

const mockServices = [
  { id: 'thobe', nameAr: 'ثوب رجالي', price: 350, days: 5, icon: '👘' },
  { id: 'suit', nameAr: 'بدلة رسمية', price: 850, days: 10, icon: '🤵' },
  { id: 'shirt', nameAr: 'قميص رسمي', price: 180, days: 3, icon: '👔' },
  { id: 'bisht', nameAr: 'بشت / مشلح', price: 800, days: 6, icon: '�' },
  { id: 'thobe_winter', nameAr: 'ثوب شتوي', price: 420, days: 7, icon: '🧥' },
  { id: 'kids', nameAr: 'ثوب أطفال', price: 150, days: 4, icon: '👕' },
];

const PAYMENT_METHODS = [
  { id: 'mada', labelAr: 'بطاقة مدى', icon: '💳' },
  { id: 'applepay', labelAr: 'Apple Pay', icon: '🍎' },
  { id: 'stcpay', labelAr: 'STC Pay', icon: '📱' },
  { id: 'tamara', labelAr: 'تقسيط - تمارا', icon: '📆' },
  { id: 'tabby', labelAr: 'تقسيط - تابي', icon: '📆' },
];

interface OrderState {
  shopId: string | number | null;
  serviceId: string | null;
  measurements: { [key: string]: string };
  fabricChoice: 'shop' | 'marketplace' | null;
  notes: string;
  deliveryAddress: string;
  paymentMethod: string | null;
}

const initialOrder: OrderState = {
  shopId: null,
  serviceId: null,
  measurements: {},
  fabricChoice: null,
  notes: '',
  deliveryAddress: '',
  paymentMethod: null,
};

const MEASUREMENT_FIELDS_AR = [
  { key: 'height', label: 'الطول (سم)', placeholder: '175' },
  { key: 'chest', label: 'الصدر (سم)', placeholder: '100' },
  { key: 'waist', label: 'الخصر (سم)', placeholder: '90' },
  { key: 'hip', label: 'الأرداف (سم)', placeholder: '95' },
  { key: 'shoulder', label: 'عرض الكتف (سم)', placeholder: '44' },
  { key: 'sleeve', label: 'طول الكم (سم)', placeholder: '62' },
  { key: 'inseam', label: 'داخل الساق (سم)', placeholder: '75' },
  { key: 'neck', label: 'محيط الرقبة (سم)', placeholder: '38' },
];

function NewOrderPageContent() {
  const { isRTL } = useAppStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState<OrderState>(initialOrder);
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [shops, setShops] = useState<any[]>(mockShops);
  const [services, setServices] = useState<any[]>(mockServices);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryShopId = searchParams.get('shop');
    const queryFabricId = searchParams.get('fabric');
    const queryServiceId = searchParams.get('service');

    if (queryShopId) {
      setOrder(prev => ({ ...prev, shopId: queryShopId }));
      setStep(2);
    }
    if (queryServiceId) {
      setOrder(prev => ({ ...prev, serviceId: queryServiceId }));
      setStep(3);
    }
    if (queryFabricId) {
      setOrder(prev => ({ ...prev, fabricChoice: 'marketplace' }));
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    shopsApi.list({ limit: '50' })
      .then((res) => {
        if (!active || !res.shops?.length) return;
        setShops(res.shops.map((s: any) => ({
          id: s.id,
          nameAr: s.nameAr || s.name,
          rating: s.rating || 0,
          city: s.city || '',
          delivery: s.deliveryDays || 7,
          minPrice: s.minOrderAmount || 0,
          category: 'رجالي',
        })));
      })
      .catch(() => { /* الإبقاء على الاحتياطي */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!order.shopId) {
      setServices(mockServices);
      return;
    }
    setLoadingServices(true);
    shopsApi.getServices(String(order.shopId))
      .then((resServices) => {
        if (resServices && resServices.length > 0) {
          setServices(resServices.map((s: any) => ({
            id: s.id,
            nameAr: s.nameAr || s.name,
            price: s.price,
            days: s.duration || 5,
            icon: s.serviceType === 'TAILORING' ? '👘' : '🧵',
          })));
        } else {
          setServices(mockServices);
        }
      })
      .catch(() => {
        setServices(mockServices);
      })
      .finally(() => {
        setLoadingServices(false);
      });
  }, [order.shopId]);

  const selectedShop = shops.find((s) => s.id === order.shopId);
  const selectedService = services.find((s) => s.id === order.serviceId) || mockServices.find((s) => s.id === order.serviceId);

  const canProceed = () => {
    if (step === 1) return order.shopId !== null;
    if (step === 2) return order.serviceId !== null;
    if (step === 3) return Object.values(order.measurements).filter(Boolean).length >= 4;
    if (step === 4) return order.fabricChoice !== null && order.deliveryAddress.length > 3;
    if (step === 5) return order.paymentMethod !== null && !submitting;
    return false;
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/dashboard/customer/orders');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const measurements: any = {};
      Object.entries(order.measurements).forEach(([key, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          measurements[key] = num;
        }
      });

      const requestData = {
        shopId: String(order.shopId),
        measurements,
        items: [
          {
            name: selectedService?.nameAr || 'خدمة تفصيل',
            quantity: 1,
            price: selectedService?.price || 0,
            type: 'tailoring' as const,
          }
        ],
        deliveryAddress: {
          label: 'عنوان العميل',
          street: order.deliveryAddress,
          district: '',
          city: selectedShop?.city || '',
        },
        deliveryMethod: 'DELIVERY',
        notes: order.notes || undefined,
      };

      const res = await ordersApi.create(requestData);
      setCreatedOrder(res.order);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isRTL ? 'حدث خطأ أثناء إنشاء الطلب' : 'An error occurred while creating the order'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          {isRTL ? 'تم إرسال طلبك بنجاح!' : 'Order Submitted Successfully!'}
        </h2>
        <p className="text-gray-500 dark:text-slate-400">
          {isRTL
            ? 'سيتواصل معك المتجر خلال 24 ساعة لتأكيد الطلب وتحديد موعد أخذ المقاسات'
            : 'The shop will contact you within 24 hours to confirm and schedule measurements'}
        </p>
        <div className="bg-primary-50 rounded-2xl p-4 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'رقم الطلب' : 'Order ID'}</span>
            <span className="font-bold text-primary-700">#{createdOrder?.orderNumber || createdOrder?.id || 'ORD-NEW'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المتجر' : 'Shop'}</span>
            <span className="font-semibold dark:text-slate-200">{selectedShop?.nameAr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'الخدمة' : 'Service'}</span>
            <span className="font-semibold dark:text-slate-200">{selectedService?.nameAr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المبلغ' : 'Amount'}</span>
            <span className="font-bold text-primary-700">﷼{selectedService?.price}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" fullWidth onClick={() => router.push('/dashboard/customer/orders')}>
            {isRTL ? 'متابعة طلباتي' : 'Track My Orders'}
          </Button>
          <Button variant="outline" fullWidth onClick={() => router.push('/dashboard/customer')}>
            {isRTL ? 'الرئيسية' : 'Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'طلب جديد' : 'New Order'}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isRTL ? 'أتبع الخطوات لإنشاء طلبك' : 'Follow the steps to create your order'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  s.id < step
                    ? 'bg-green-500 text-white'
                    : s.id === step
                    ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                }`}
              >
                {s.id < step ? <Check size={16} /> : <s.icon size={16} />}
              </div>
              <span className={`text-[10px] font-medium ${s.id === step ? 'text-primary-700' : 'text-gray-400 dark:text-slate-500'}`}>
                {isRTL ? s.iconAr : s.iconEn}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 ${s.id < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">

        {/* Step 1: Choose Shop */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{isRTL ? 'اختر المتجر' : 'Choose a Shop'}</h3>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? 'ابحث عن متجر...' : 'Search shops...'}
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>
            <div className="space-y-3">
              {shops
                .filter((s) => !search || s.nameAr.includes(search))
                .map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => setOrder({ ...order, shopId: shop.id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      order.shopId === shop.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          {shop.nameAr[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800 dark:text-slate-200">{shop.nameAr}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            <MapPin size={10} />
                            <span>{shop.city}</span>
                            <span>·</span>
                            <Clock size={10} />
                            <span>{shop.delivery} {isRTL ? 'أيام' : 'days'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-0.5 mb-1">
                          <Star size={11} className="fill-gold-400 text-gold-400" />
                          <span className="text-xs font-bold">{shop.rating}</span>
                        </div>
                        <p className="text-xs text-primary-700 font-semibold">﷼{shop.minPrice}+</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Service */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{isRTL ? 'اختر الخدمة' : 'Choose Service'}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{selectedShop?.nameAr}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loadingServices ? (
                <div className="col-span-2 text-center py-8 text-gray-500">{isRTL ? 'جاري تحميل الخدمات...' : 'Loading services...'}</div>
              ) : services.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">{isRTL ? 'لا توجد خدمات متاحة لهذا المتجر' : 'No services available for this shop'}</div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setOrder({ ...order, serviceId: service.id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                      order.serviceId === service.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-slate-700 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-slate-200">{service.nameAr}</p>
                    <p className="text-primary-700 text-sm font-bold mt-1">﷼{service.price}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">{service.days} {isRTL ? 'أيام' : 'days'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Measurements */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{isRTL ? 'المقاسات' : 'Measurements'}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isRTL ? 'أدخل مقاساتك أو سيرسل المتجر فنياً لأخذها' : 'Enter your measurements or the shop will send a technician'}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
              <span className="text-base mt-0.5">ℹ️</span>
              <span>{isRTL ? 'يمكنك ترك الحقول فارغة وسيتم إرسال فني لأخذ مقاساتك في الموقع' : 'You can leave fields empty and a technician will measure you on-site'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MEASUREMENT_FIELDS_AR.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1">{field.label}</label>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={order.measurements[field.key] || ''}
                    onChange={(e) =>
                      setOrder({
                        ...order,
                        measurements: { ...order.measurements, [field.key]: e.target.value },
                      })
                    }
                    className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{isRTL ? 'تفاصيل الطلب' : 'Order Details'}</h3>

            {/* Fabric Choice */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-2">
                {isRTL ? 'مصدر القماش' : 'Fabric Source'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'shop' as const, labelAr: 'من المتجر', labelEn: 'From Shop', descAr: 'المتجر يختار القماش المناسب', icon: '🏪' },
                  { id: 'marketplace' as const, labelAr: 'من السوق', labelEn: 'From Marketplace', descAr: 'أنا أختار من سوق الأقمشة', icon: '🛍️' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setOrder({ ...order, fabricChoice: opt.id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                      order.fabricChoice === opt.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <p className="font-semibold text-sm">{isRTL ? opt.labelAr : opt.labelEn}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{isRTL ? opt.descAr : opt.labelEn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-2">
                {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
              </label>
              <input
                type="text"
                placeholder={isRTL ? 'الرياض - حي العليا، شارع التحلية...' : 'Enter your delivery address...'}
                value={order.deliveryAddress}
                onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-2">
                {isRTL ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (optional)'}
              </label>
              <textarea
                rows={3}
                placeholder={isRTL ? 'مثال: أريد اللون الأبيض، مقاس فضفاض قليلاً...' : 'e.g., White color, slightly loose fit...'}
                value={order.notes}
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{isRTL ? 'تأكيد ودفع' : 'Confirm & Pay'}</h3>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 text-sm">
              <p className="font-bold text-gray-700 dark:text-slate-300 mb-2">{isRTL ? 'ملخص الطلب' : 'Order Summary'}</p>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المتجر' : 'Shop'}</span>
                <span className="font-medium dark:text-slate-200">{selectedShop?.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'الخدمة' : 'Service'}</span>
                <span className="font-medium dark:text-slate-200">{selectedService?.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'وقت التنفيذ' : 'Lead time'}</span>
                <span className="font-medium dark:text-slate-200">{selectedService?.days} {isRTL ? 'أيام' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'القماش' : 'Fabric'}</span>
                <span className="font-medium dark:text-slate-200">{order.fabricChoice === 'shop' ? (isRTL ? 'من المتجر' : 'From shop') : (isRTL ? 'من السوق' : 'Marketplace')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'العنوان' : 'Address'}</span>
                <span className="font-medium dark:text-slate-200 text-left max-w-[160px] truncate">{order.deliveryAddress}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-base">
                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-primary-700">﷼{selectedService?.price}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setOrder({ ...order, paymentMethod: pm.id })}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      order.paymentMethod === pm.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xl">{pm.icon}</span>
                    <span className="font-medium text-sm text-gray-800 dark:text-slate-200">{pm.labelAr}</span>
                    {order.paymentMethod === pm.id && (
                      <Check size={16} className="text-primary-500 ms-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={handleBack} disabled={submitting} icon={isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}>
          {step === 1 ? (isRTL ? 'إلغاء' : 'Cancel') : (isRTL ? 'السابق' : 'Back')}
        </Button>
        <div className="flex-1 text-center text-xs text-gray-400 dark:text-slate-500">
          {isRTL ? `الخطوة ${step} من ${STEPS.length}` : `Step ${step} of ${STEPS.length}`}
        </div>
        <Button
          variant={step === 5 ? 'gold' : 'primary'}
          onClick={handleNext}
          disabled={!canProceed() || submitting}
          icon={step === 5 ? <CheckCircle2 size={16} /> : isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        >
          {step === 5
            ? submitting
              ? (isRTL ? 'جاري الإرسال...' : 'Submitting...')
              : (isRTL ? 'تأكيد الطلب' : 'Confirm Order')
            : isRTL ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
      <NewOrderPageContent />
    </React.Suspense>
  );
}

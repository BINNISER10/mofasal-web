'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import {
  CreditCard, Smartphone, Wallet, Banknote, Building2,
  Truck, Shield, ChevronRight, CheckCircle2, Lock, Clock,
  Package, Tag, Scissors,
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
  installments?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'mada', labelAr: 'مدى', labelEn: 'Mada', icon: <CreditCard size={22} />, color: '#006C35', badge: 'الأكثر استخداماً' },
  { id: 'apple_pay', labelAr: 'Apple Pay', labelEn: 'Apple Pay', icon: <Smartphone size={22} />, color: '#000000' },
  { id: 'stc_pay', labelAr: 'STC Pay', labelEn: 'STC Pay', icon: <Smartphone size={22} />, color: '#6700A0' },
  { id: 'visa', labelAr: 'فيزا / ماستركارد', labelEn: 'Visa / Mastercard', icon: <CreditCard size={22} />, color: '#1A1F71' },
  { id: 'tamara', labelAr: 'تمارا - 3 دفعات', labelEn: 'Tamara - 3 Payments', icon: <Wallet size={22} />, color: '#00D4A8', badge: 'بدون فوائد', installments: true },
  { id: 'tabby', labelAr: 'تابي - 4 دفعات', labelEn: 'Tabby - 4 Payments', icon: <Wallet size={22} />, color: '#3DBDC4', badge: 'بدون فوائد', installments: true },
  { id: 'sadad', labelAr: 'سداد', labelEn: 'SADAD', icon: <Building2 size={22} />, color: '#007AFF' },
  { id: 'bank_transfer', labelAr: 'تحويل بنكي', labelEn: 'Bank Transfer', icon: <Building2 size={22} />, color: '#34495E' },
  { id: 'cod', labelAr: 'الدفع عند الاستلام', labelEn: 'Cash on Delivery', icon: <Banknote size={22} />, color: '#27AE60' },
];

const ORDER_SUMMARY = {
  items: [
    { name: 'بدلة رسمية كاملة', qty: 1, price: 1200 },
    { name: 'قماش صوف إيطالي - كحلي (3م)', qty: 1, price: 1050 },
  ],
  subtotal: 2250,
  delivery: 35,
  vat: 337.5,
  total: 2622.5,
  shopName: 'خياطة الرجال الراقية',
};

function CheckoutContent() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [selected, setSelected] = useState<string>('mada');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selected);

  const handlePay = async () => {
    setStep('processing');
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsProcessing(false);
    setStep('success');
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">{isRTL ? 'جاري معالجة الدفع...' : 'Processing Payment...'}</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{isRTL ? 'لا تغلق هذه الصفحة' : 'Do not close this page'}</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">{isRTL ? 'تم الدفع بنجاح!' : 'Payment Successful!'}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">{isRTL ? 'تم تأكيد طلبك' : 'Your order has been confirmed'}</p>
          <p className="text-primary-600 dark:text-primary-400 font-bold mb-6">ORD-{Math.floor(Math.random() * 9000) + 1000}</p>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-slate-400 mb-1">
              <span>{isRTL ? 'المبلغ المدفوع' : 'Amount Paid'}</span>
              <span className="font-bold text-gray-900 dark:text-slate-100">{ORDER_SUMMARY.total.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-slate-400">
              <span>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</span>
              <span>{selectedMethod?.labelAr}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" fullWidth onClick={() => router.push('/dashboard/customer/orders')}>
              {isRTL ? 'تتبع طلبك' : 'Track Your Order'}
            </Button>
            <Button variant="outline" fullWidth onClick={() => router.push('/dashboard/invoices/INV-001')}>
              {isRTL ? 'عرض الفاتورة' : 'View Invoice'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-32">
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-6">{isRTL ? 'إتمام الدفع' : 'Checkout'}</h1>

        {/* Order Summary */}
        <Card className="p-4 mb-4 dark:bg-slate-800/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Scissors size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'المتجر' : 'Shop'}</p>
              <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{ORDER_SUMMARY.shopName}</p>
            </div>
          </div>
          {ORDER_SUMMARY.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0 text-sm">
              <span className="text-gray-700 dark:text-slate-300">{item.name}</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">{item.price.toLocaleString()} ر.س</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>{isRTL ? 'المجموع' : 'Subtotal'}</span><span>{ORDER_SUMMARY.subtotal.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>{isRTL ? 'التوصيل' : 'Delivery'}</span><span>{ORDER_SUMMARY.delivery} ر.س</span></div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>{isRTL ? 'ضريبة 15%' : 'VAT 15%'}</span><span>{ORDER_SUMMARY.vat.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between font-black text-lg text-gray-900 dark:text-slate-100 pt-2 border-t border-gray-100 dark:border-slate-700">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-primary-700 dark:text-primary-400">{ORDER_SUMMARY.total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <h2 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-3">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</h2>
        <div className="space-y-2 mb-4">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelected(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-start ${
                selected === method.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: method.color }}>
                {method.icon}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${selected === method.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-slate-200'}`}>
                  {isRTL ? method.labelAr : method.labelEn}
                </p>
                {method.installments && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {method.id === 'tamara'
                      ? `${(ORDER_SUMMARY.total / 3).toFixed(0)} ر.س × 3`
                      : `${(ORDER_SUMMARY.total / 4).toFixed(0)} ر.س × 4`}
                  </p>
                )}
              </div>
              {method.badge && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  {method.badge}
                </span>
              )}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === method.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-slate-600'
              }`}>
                {selected === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-4">
          <Lock size={14} />
          <span>{isRTL ? 'جميع المعاملات مشفرة ومؤمنة بـ SSL 256-bit' : 'All transactions secured with SSL 256-bit encryption'}</span>
        </div>
      </div>

      {/* Fixed Pay Button */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="primary" fullWidth size="lg" isLoading={isProcessing} onClick={handlePay}
            icon={<Shield size={18} />}>
            {isRTL
              ? `ادفع ${ORDER_SUMMARY.total.toLocaleString()} ر.س عبر ${selectedMethod?.labelAr}`
              : `Pay ${ORDER_SUMMARY.total.toLocaleString()} SAR via ${selectedMethod?.labelEn}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}

'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import {
  CheckCircle2, XCircle, Scissors, Ruler, Package,
  Calendar, DollarSign, AlertTriangle, Clock, MessageSquare,
  User, Phone, ChevronDown, ChevronUp, Shield,
} from 'lucide-react';

const mockConfirmation = {
  token: 'CONF-2024-XK8M',
  orderId: 'ORD-1284',
  shopName: 'خياطة الرجال الراقية',
  shopLogo: 'خ',
  shopPhone: '+966 55 123 4567',
  representativeName: 'ماجد الشمري',
  representativePhone: '+966 55 789 0123',
  customerName: 'أحمد محمد',
  measurements: {
    chest: 102, waist: 88, shoulderWidth: 46,
    sleeveLength: 62, shirtLength: 76, neckCircumference: 40,
    pantLength: 106, inseam: 82,
  },
  items: [
    { name: 'بدلة رسمية كاملة', qty: 1, price: 1200 },
    { name: 'قميص رسمي', qty: 2, price: 250 },
  ],
  fabric: { name: 'قماش صوف إيطالي - كحلي', price: 350, per: 'متر', meters: 3 },
  subtotal: 1700,
  fabricCost: 1050,
  vatAmount: 413,
  totalAmount: 3163,
  estimatedDelivery: '2024-04-10',
  estimatedDays: 10,
  notes: 'يرجى الانتباه لتضييق الياقة قليلاً كما طلبه العميل',
  expiresAt: '2024-03-28T23:59:00Z',
  status: 'PENDING',
};

const MEASUREMENTS_AR: Record<string, string> = {
  chest: 'محيط الصدر', waist: 'محيط الخصر', shoulderWidth: 'عرض الكتف',
  sleeveLength: 'طول الكم', shirtLength: 'طول القميص', neckCircumference: 'محيط الرقبة',
  pantLength: 'طول البنطلون', inseam: 'الطول الداخلي',
};

export default function ConfirmationPage() {
  const { token } = useParams<{ token: string }>();
  const { isRTL } = useAppStore();
  const data = mockConfirmation;

  const [action, setAction] = useState<'approved' | 'changes_requested' | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setAction('approved');
    toast.success(isRTL ? 'تمت الموافقة على الطلب! سيبدأ الإنتاج فوراً' : 'Order approved! Production starts now');
  };

  const handleRequestChanges = async () => {
    if (!changeNote.trim()) { toast.error(isRTL ? 'يرجى وصف التعديل المطلوب' : 'Please describe the changes'); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setAction('changes_requested');
    toast.success(isRTL ? 'تم إرسال طلب التعديل للمتجر' : 'Change request sent to shop');
  };

  if (action === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-3">{isRTL ? 'تمت الموافقة!' : 'Approved!'}</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-2">{isRTL ? 'بدأ المتجر بالعمل على طلبك' : 'The shop has started working on your order'}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{isRTL ? `موعد التسليم المتوقع: ${data.estimatedDelivery}` : `Expected: ${data.estimatedDelivery}`}</p>
          <a href="/dashboard/customer/orders" className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
            {isRTL ? 'تتبع طلبك' : 'Track Your Order'}
          </a>
        </div>
      </div>
    );
  }

  if (action === 'changes_requested') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={48} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-3">{isRTL ? 'تم إرسال طلب التعديل' : 'Change Request Sent'}</h1>
          <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'سيتواصل معك المتجر قريباً لمناقشة التعديلات المطلوبة' : 'The shop will contact you soon to discuss the requested changes'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-primary-700 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
            {data.shopLogo}
          </div>
          <h1 className="text-xl font-black mb-1">{data.shopName}</h1>
          <p className="text-primary-200 text-sm">{isRTL ? 'رابط تأكيد الطلب' : 'Order Confirmation Link'}</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary-200">
            <Shield size={14} />
            <span>{isRTL ? `رقم التأكيد: ${data.token}` : `Ref: ${data.token}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-32">
        {/* Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">{isRTL ? 'يرجى المراجعة الدقيقة' : 'Please Review Carefully'}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{isRTL ? 'موافقتك على هذه التفاصيل تعني بدء الإنتاج فوراً ولا يمكن التراجع.' : 'Your approval means production starts immediately and cannot be undone.'}</p>
          </div>
        </div>

        {/* Customer & Rep */}
        <Card className="p-4 dark:bg-slate-800/60">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'العميل' : 'Customer'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{data.customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'المندوب' : 'Representative'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{data.representativeName}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-4 dark:bg-slate-800/60">
          <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Package size={16} className="text-primary-600" />
            {isRTL ? 'الطلبات' : 'Order Items'}
          </h2>
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">× {item.qty}</p>
              </div>
              <p className="text-sm font-bold text-primary-700 dark:text-primary-400">{(item.price * item.qty).toLocaleString()} ر.س</p>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{data.fabric.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{data.fabric.meters} م × {data.fabric.price} ر.س</p>
            </div>
            <p className="text-sm font-bold text-primary-700 dark:text-primary-400">{data.fabricCost.toLocaleString()} ر.س</p>
          </div>
        </Card>

        {/* Measurements (collapsible) */}
        <Card className="dark:bg-slate-800/60 overflow-hidden">
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <h2 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Ruler size={16} className="text-primary-600" />
              {isRTL ? 'المقاسات المسجلة' : 'Recorded Measurements'}
            </h2>
            {showMeasurements ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showMeasurements && (
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {Object.entries(data.measurements).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-500 dark:text-slate-400">{MEASUREMENTS_AR[key] || key}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{value} سم</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pricing Summary */}
        <Card className="p-4 dark:bg-slate-800/60">
          <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-primary-600" />
            {isRTL ? 'ملخص التسعير' : 'Pricing Summary'}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-slate-400"><span>{isRTL ? 'الخدمات' : 'Services'}</span><span>{data.subtotal.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between text-gray-600 dark:text-slate-400"><span>{isRTL ? 'القماش' : 'Fabric'}</span><span>{data.fabricCost.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between text-gray-600 dark:text-slate-400"><span>{isRTL ? 'ضريبة القيمة المضافة 15%' : 'VAT 15%'}</span><span>{data.vatAmount.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between font-black text-lg text-gray-900 dark:text-slate-100 pt-2 border-t border-gray-100 dark:border-slate-700">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-primary-700 dark:text-primary-400">{data.totalAmount.toLocaleString()} ر.س</span>
            </div>
          </div>
        </Card>

        {/* Delivery */}
        <Card className="p-4 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'موعد التسليم المتوقع' : 'Expected Delivery'}</p>
              <p className="font-bold text-gray-900 dark:text-slate-100">{data.estimatedDelivery}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? `خلال ${data.estimatedDays} أيام عمل` : `Within ${data.estimatedDays} business days`}</p>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {data.notes && (
          <Card className="p-4 dark:bg-slate-800/60">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">{isRTL ? 'ملاحظات المتجر' : 'Shop Notes'}</p>
            <p className="text-sm text-gray-700 dark:text-slate-300">{data.notes}</p>
          </Card>
        )}

        {/* Change Request Input */}
        <Card className="p-4 dark:bg-slate-800/60">
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">{isRTL ? 'هل لديك تعديل؟ اكتبه هنا:' : 'Have a change request? Write it here:'}</p>
          <textarea
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={isRTL ? 'مثال: أريد الياقة أضيق بـ 2 سم...' : 'E.g.: I want the collar 2cm tighter...'}
            rows={3}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </Card>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 p-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            icon={<XCircle size={18} />}
            isLoading={isSubmitting}
            onClick={handleRequestChanges}
          >
            {isRTL ? 'طلب تعديل' : 'Request Changes'}
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={<CheckCircle2 size={18} />}
            isLoading={isSubmitting}
            onClick={handleApprove}
          >
            {isRTL ? 'موافق، ابدأ الإنتاج' : 'Approve & Start'}
          </Button>
        </div>
      </div>
    </div>
  );
}

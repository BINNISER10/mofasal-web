'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@/lib/api/orders';
import { ArrowRight, User, Ruler, Scissors, Package, Truck, Calendar, Phone, MapPin, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

const mockOrder = {
  id: 'ORD-1284',
  customerName: 'أحمد محمد',
  customerPhone: '+966 55 123 4567',
  customerEmail: 'ahmed@email.com',
  items: [{ name: 'بدلة رسمية', quantity: 1, price: 1200 }],
  fabricName: 'قماش صوف إيطالي',
  fabricPrice: 350,
  measurements: {
    chest: 102, waist: 88, shoulderWidth: 46, sleeveLength: 62,
    shirtLength: 76, neckCircumference: 40, pantLength: 106, inseam: 82,
  },
  totalAmount: 1200,
  deliveryFee: 35,
  vatAmount: 185,
  grandTotal: 1420,
  paymentStatus: 'PAID',
  paymentMethod: 'MADA',
  deliveryMethod: 'مركبة المتجر',
  estimatedDeliveryDate: '2024-04-01',
  address: { label: 'المنزل', street: 'شارع الملك فهد', district: 'الورود', city: 'الرياض', building: 'مبنى 12', apartment: 'شقة 5' },
  status: 'SEWING_ASSEMBLY',
  staffName: 'علي محمد',
  tracking: [
    { id: 't1', status: 'PENDING' as OrderStatus, note: 'تم استلام الطلب', updatedBy: 'النظام', updatedByName: 'النظام', timestamp: '2024-03-15T09:00:00Z' },
    { id: 't2', status: 'CONFIRMED' as OrderStatus, note: 'تم تأكيد الطلب', updatedBy: 'admin1', updatedByName: 'أحمد', timestamp: '2024-03-15T09:30:00Z' },
    { id: 't3', status: 'STAFF_ON_WAY' as OrderStatus, note: 'الموظف في الطريق لأخذ المقاسات', updatedBy: 'staff1', updatedByName: 'علي محمد', timestamp: '2024-03-15T10:00:00Z' },
    { id: 't4', status: 'TAKING_MEASUREMENTS' as OrderStatus, note: 'تم أخذ المقاسات بنجاح', updatedBy: 'staff1', updatedByName: 'علي محمد', timestamp: '2024-03-15T11:30:00Z' },
    { id: 't5', status: 'CUTTING_FABRIC' as OrderStatus, note: 'بدأ قص القماش', updatedBy: 'staff1', updatedByName: 'علي محمد', timestamp: '2024-03-16T08:00:00Z' },
    { id: 't6', status: 'SEWING_ASSEMBLY' as OrderStatus, note: 'جاري الخياطة والتجميع', updatedBy: 'staff1', updatedByName: 'علي محمد', timestamp: '2024-03-17T09:00:00Z' },
  ],
};

export default function TailorOrderDetailPage() {
  const params = useParams();
  const { isRTL } = useAppStore();
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [nextStatus, setNextStatus] = useState('');

  const STAGES = [
    { key: 'PENDING',            emoji: '📩', ar: 'تم استلام الطلب',       en: 'Order Received' },
    { key: 'CONFIRMED',          emoji: '✅', ar: 'تم تأكيد الطلب',        en: 'Order Confirmed' },
    { key: 'STAFF_ON_WAY',       emoji: '🚗', ar: 'الموظف في الطريق',      en: 'Staff On The Way' },
    { key: 'TAKING_MEASUREMENTS',emoji: '📏', ar: 'أخذ المقاسات',          en: 'Taking Measurements' },
    { key: 'CUTTING_FABRIC',     emoji: '✂️', ar: 'قص القماش',             en: 'Cutting Fabric' },
    { key: 'SEWING_ASSEMBLY',    emoji: '🧵', ar: 'الخياطة والتجميع',      en: 'Sewing & Assembly' },
    { key: 'IRONING_FINISHING',  emoji: '🔥', ar: 'الكوي والتشطيب',        en: 'Ironing & Finishing' },
    { key: 'PACKING_WRAPPING',   emoji: '📦', ar: 'التعبئة والتغليف',      en: 'Packing & Wrapping' },
    { key: 'ON_WAY_TO_CUSTOMER', emoji: '✈️', ar: 'في الطريق إليك',        en: 'On The Way To You' },
    { key: 'DELIVERED',          emoji: '🤝', ar: 'تم التسليم بنجاح',      en: 'Delivered Successfully' },
  ];
  const [currentStatus, setCurrentStatus] = useState(mockOrder.status);
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);
  const nextStage = STAGES[currentIdx + 1];

  const advanceStage = () => {
    if (!nextStage) return;
    setCurrentStatus(nextStage.key);
    setShowStatusConfirm(false);
    toast.success(isRTL ? `✅ تم التحديث إلى: ${nextStage.ar}` : `✅ Updated to: ${nextStage.en}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/dashboard/tailor/orders" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><ArrowRight size={20} className="text-gray-500 dark:text-slate-400" /></a>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? `طلب #${mockOrder.id}` : `Order #${mockOrder.id}`}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'تفاصيل الطلب والتتبع' : 'Order details & tracking'}</p>
        </div>
        <Badge variant="gold" size="md">{mockOrder.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 9-Stage Visual Progress */}
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Package size={18} className="text-primary-600" />{isRTL ? 'مراحل الطلب' : 'Order Stages'}
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
                  <Button variant="primary" icon={<ChevronRight size={16} />} onClick={() => { setNextStatus(nextStage.key); setShowStatusConfirm(true); }}>
                    {isRTL ? 'تحديث المرحلة' : 'Advance Stage'}
                  </Button>
                </div>
              </div>
            )}
            {!nextStage && currentStatus === 'DELIVERED' && (
              <div className="mt-4 text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-700 dark:text-green-400">{isRTL ? 'تم تسليم الطلب بنجاح!' : 'Order delivered successfully!'}</p>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Package size={18} className="text-primary-600" />{isRTL ? 'سجل التتبع' : 'Tracking Log'}</h3>
            <OrderTimeline tracking={mockOrder.tracking} locale={isRTL ? 'ar' : 'en'} />
          </Card>

          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Ruler size={18} className="text-primary-600" />{isRTL ? 'المقاسات' : 'Measurements'}</h3>} className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(mockOrder.measurements).map(([key, val]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{key}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{val} <span className="text-xs text-gray-400 dark:text-slate-500">سم</span></p>
                </div>
              ))}
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Scissors size={18} className="text-primary-600" />{isRTL ? 'تفاصيل القماش' : 'Fabric Details'}</h3>} className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-700" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200">{mockOrder.fabricName}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{formatCurrency(mockOrder.fabricPrice)} {isRTL ? '/ متر' : '/ meter'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><User size={18} className="text-primary-600" />{isRTL ? 'معلومات العميل' : 'Customer Info'}</h3>} className="p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">{mockOrder.customerName.charAt(0)}</div>
                <div><p className="font-semibold dark:text-slate-200">{mockOrder.customerName}</p><p className="text-xs text-gray-500 dark:text-slate-400" dir="ltr">{mockOrder.customerPhone}</p></div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400"><Phone size={14} />{mockOrder.customerPhone}</div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400"><Calendar size={14} />{isRTL ? 'موعد التسليم:' : 'Delivery:'} {formatDate(mockOrder.estimatedDeliveryDate)}</div>
              <Badge variant="success">{isRTL ? 'تم الدفع' : 'Paid'} - {mockOrder.paymentMethod}</Badge>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-primary-600" />{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</h3>} className="p-5">
            <div className="text-sm space-y-1">
              <p className="font-semibold dark:text-slate-200">{mockOrder.address.label}</p>
              <p className="text-gray-600 dark:text-slate-400">{mockOrder.address.street}</p>
              <p className="text-gray-600 dark:text-slate-400">{mockOrder.address.district}, {mockOrder.address.city}</p>
              <p className="text-gray-600 dark:text-slate-400">{isRTL ? 'مبنى' : 'Building'} {mockOrder.address.building} - {isRTL ? 'شقة' : 'Apt'} {mockOrder.address.apartment}</p>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'ملخص السعر' : 'Price Summary'}</h3>} className="p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">{isRTL ? 'المجموع' : 'Subtotal'}</span><span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">{isRTL ? 'التوصيل' : 'Delivery'}</span><span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.deliveryFee)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">VAT</span><span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.vatAmount)}</span></div>
              <div className="flex justify-between font-bold text-lg text-primary-700 border-t pt-2"><span>{isRTL ? 'الإجمالي' : 'Total'}</span><span>{formatCurrency(mockOrder.grandTotal)}</span></div>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الموظف المسؤول' : 'Assigned Staff'}</h3>} className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{mockOrder.staffName.charAt(0)}</div>
              <div><p className="font-semibold dark:text-slate-200">{mockOrder.staffName}</p><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'خياط رئيسي' : 'Master Tailor'}</p></div>
            </div>
          </Card>
        </div>
      </div>

      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-jahez-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">{isRTL ? 'تأكيد تحديث الحالة' : 'Confirm Status Update'}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              {isRTL ? `هل أنت متأكد من تحديث الحالة إلى "${nextStatus}"؟` : `Update status to "${nextStatus}"?`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowStatusConfirm(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button variant="primary" fullWidth onClick={advanceStage}>{isRTL ? 'تأكيد' : 'Confirm'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrderTrackingAnimation } from '@/components/shared/OrderTrackingAnimation';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatting';
import { ArrowRight, Package, User, MapPin, CreditCard, Ruler, Scissors, Calendar, Truck, CheckCircle2, Clock } from 'lucide-react';

const mockOrder = {
  id: 'ORD-1284',
  orderNumber: 'ORD-1284',
  shopName: 'خياطة الرجال',
  shopPhone: '+966 55 123 4567',
  customerName: 'أحمد محمد',
  fabricName: 'قماش صوف إيطالي - كحلي',
  fabricPrice: 350,
  measurements: { chest: 102, waist: 88, shoulderWidth: 46, sleeveLength: 62, shirtLength: 76, neckCircumference: 40, pantLength: 106, inseam: 82 },
  items: [{ name: 'بدلة رسمية', quantity: 1, price: 1200 }],
  totalAmount: 1200,
  deliveryFee: 35,
  vatAmount: 185,
  grandTotal: 1420,
  status: 'SEWING_ASSEMBLY',
  paymentStatus: 'PAID',
  paymentMethod: 'بطاقة مدى',
  deliveryAddress: 'الرياض، حي الورود، شارع الملك فهد، مبنى 12، شقة 5',
  estimatedDeliveryDate: '2024-04-01',
  createdAt: '2024-03-15T09:00:00Z',
  trackingDates: {
    PENDING: '2024-03-15T09:00:00Z',
    CONFIRMED: '2024-03-15T09:30:00Z',
    STAFF_ON_WAY: '2024-03-15T10:00:00Z',
    TAKING_MEASUREMENTS: '2024-03-15T11:30:00Z',
    CUTTING_FABRIC: '2024-03-16T08:00:00Z',
    SEWING_ASSEMBLY: '2024-03-17T09:00:00Z',
  },
};

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const { isRTL } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <a href="/dashboard/customer/orders" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><ArrowRight size={20} className="text-gray-500 dark:text-slate-400" /></a>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'تتبع الطلب' : 'Order Tracking'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? `طلب #${mockOrder.orderNumber}` : `Order #${mockOrder.orderNumber}`}</p>
        </div>
        <Badge variant="gold" size="md">{isRTL ? 'قيد الخياطة' : 'In Production'}</Badge>
      </div>

      {/* Interactive Tracking Animation */}
      <Card className="p-6">
        <OrderTrackingAnimation
          currentStatus={mockOrder.status}
          dates={mockOrder.trackingDates}
          locale={isRTL ? 'ar' : 'en'}
          className="py-4"
        />
      </Card>

      {/* Timeline */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Clock size={18} className="text-primary-600" />{isRTL ? 'سجل التتبع' : 'Tracking History'}</h3>
        <div className="relative pr-6">
          <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
          {[
            { status: 'PENDING', label: isRTL ? 'تم استلام الطلب' : 'Order Received', time: mockOrder.trackingDates.PENDING },
            { status: 'CONFIRMED', label: isRTL ? 'تم تأكيد الطلب' : 'Order Confirmed', time: mockOrder.trackingDates.CONFIRMED },
            { status: 'STAFF_ON_WAY', label: isRTL ? 'الموظف في الطريق لأخذ المقاسات' : 'Staff on way for measurements', time: mockOrder.trackingDates.STAFF_ON_WAY },
            { status: 'TAKING_MEASUREMENTS', label: isRTL ? 'تم أخذ المقاسات' : 'Measurements taken', time: mockOrder.trackingDates.TAKING_MEASUREMENTS },
            { status: 'CUTTING_FABRIC', label: isRTL ? 'جاري قص القماش' : 'Cutting fabric', time: mockOrder.trackingDates.CUTTING_FABRIC },
            { status: 'SEWING_ASSEMBLY', label: isRTL ? 'جاري الخياطة والتجميع' : 'Sewing & assembly', time: mockOrder.trackingDates.SEWING_ASSEMBLY },
          ].map((step, i) => {
            const isActive = step.status === mockOrder.status;
            const isCompleted = new Date(step.time) < new Date(mockOrder.trackingDates.SEWING_ASSEMBLY);
            return (
              <div key={step.status} className="relative flex items-start gap-4 pb-6 last:pb-0">
                <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'bg-gold-500 border-gold-500 animate-pulse' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                }`}>
                  {isCompleted && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className={`text-sm font-semibold ${isActive ? 'text-gold-700' : isCompleted ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>{step.label}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDateTime(step.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Order Details */}
      <Card className="p-5">
        <button onClick={() => setShowDetails(!showDetails)} className="flex items-center justify-between w-full">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Package size={18} className="text-primary-600" />{isRTL ? 'تفاصيل الطلب' : 'Order Details'}</h3>
          <span className="text-primary-700 text-sm">{showDetails ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض' : 'Show')}</span>
        </button>
        {showDetails && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'المتجر' : 'Shop'}</p><p className="font-semibold text-sm dark:text-slate-200">{mockOrder.shopName}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'القماش' : 'Fabric'}</p><p className="font-semibold text-sm dark:text-slate-200">{mockOrder.fabricName}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'التوصيل' : 'Delivery'}</p><p className="font-semibold text-sm dark:text-slate-200">{formatDate(mockOrder.estimatedDeliveryDate)}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'طريقة الدفع' : 'Payment'}</p><p className="font-semibold text-sm dark:text-slate-200">{mockOrder.paymentMethod}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'حالة الدفع' : 'Payment Status'}</p><Badge variant="success" size="sm">{isRTL ? 'مدفوع' : 'Paid'}</Badge></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'الإجمالي' : 'Total'}</p><p className="font-semibold text-sm text-primary-700">{formatCurrency(mockOrder.grandTotal)}</p></div>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><Ruler size={16} />{isRTL ? 'المقاسات' : 'Measurements'}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(mockOrder.measurements).map(([key, val]) => (
                  <div key={key} className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-slate-400">{key}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{val} <span className="text-xs text-gray-400 dark:text-slate-500">سم</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">{isRTL ? 'سعر القماش' : 'Fabric price'}</span>
              <span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.fabricPrice)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">{isRTL ? 'رسوم الخياطة' : 'Tailoring fee'}</span>
              <span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">{isRTL ? 'ضريبة القيمة المضافة' : 'VAT'}</span>
              <span className="font-semibold dark:text-slate-200">{formatCurrency(mockOrder.vatAmount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
              <span className="text-sm font-bold text-primary-800">{isRTL ? 'الإجمالي الكلي' : 'Grand Total'}</span>
              <span className="text-lg font-bold text-primary-700">{formatCurrency(mockOrder.grandTotal)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Delivery Map Placeholder */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary-600" />{isRTL ? 'موقع التوصيل' : 'Delivery Location'}</h3>
        <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-500">
          <div className="text-center">
            <MapPin size={32} className="mx-auto mb-2 text-primary-400" />
            <p className="text-sm dark:text-slate-400">{isRTL ? 'خريطة التتبع المباشر' : 'Live tracking map'}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{mockOrder.deliveryAddress}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="primary" fullWidth>{isRTL ? 'تواصل مع المتجر' : 'Contact Shop'}</Button>
        <Button variant="outline" fullWidth>{isRTL ? 'الإبلاغ عن مشكلة' : 'Report Issue'}</Button>
      </div>
    </div>
  );
}

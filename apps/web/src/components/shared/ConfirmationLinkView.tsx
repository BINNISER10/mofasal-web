'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { CheckCircle2, FileEdit, Scissors, Ruler, Package, Truck, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/formatting';

interface ConfirmationLinkViewProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    shopName: string;
    fabricName?: string;
    fabricPrice?: number;
    measurements: Record<string, number>;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    deliveryFee: number;
    vatAmount: number;
    grandTotal: number;
    estimatedDeliveryDate: string;
    status: string;
  };
  onApprove: () => void;
  onRequestChanges: () => void;
  className?: string;
}

export function ConfirmationLinkView({
  order,
  onApprove,
  onRequestChanges,
  className,
}: ConfirmationLinkViewProps) {
  const { isRTL } = useAppStore();

  const measurementLabels: Record<string, { ar: string; en: string }> = {
    chest: { ar: 'محيط الصدر', en: 'Chest' },
    waist: { ar: 'الخصر', en: 'Waist' },
    hips: { ar: 'الورك', en: 'Hips' },
    shoulderWidth: { ar: 'عرض الكتف', en: 'Shoulder' },
    sleeveLength: { ar: 'طول الكم', en: 'Sleeve' },
    shirtLength: { ar: 'طول القميص', en: 'Shirt Length' },
    pantLength: { ar: 'طول البنطلون', en: 'Pant Length' },
    neckCircumference: { ar: 'محيط الرقبة', en: 'Neck' },
  };

  return (
    <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
      <Card className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isRTL ? 'تفاصيل طلب الخياطة' : 'Order Confirmation'}
        </h2>
        <p className="text-sm text-gray-500">
          {isRTL ? `طلب رقم #${order.orderNumber}` : `Order #${order.orderNumber}`}
        </p>
        <div className="mt-2">
          <Badge variant="info">{order.status}</Badge>
        </div>
      </Card>

      <Card header={<h3 className="font-bold text-gray-800">{isRTL ? 'العميل والمتجر' : 'Customer & Shop'}</h3>}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{isRTL ? 'العميل' : 'Customer'}</span>
            <span className="font-semibold">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{isRTL ? 'المتجر' : 'Shop'}</span>
            <span className="font-semibold">{order.shopName}</span>
          </div>
        </div>
      </Card>

      {order.measurements && Object.keys(order.measurements).length > 0 && (
        <Card header={<h3 className="font-bold text-gray-800 flex items-center gap-2"><Ruler size={18} className="text-primary-600" />{isRTL ? 'المقاسات' : 'Measurements'}</h3>}>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(order.measurements).map(([key, value]) => {
              const label = measurementLabels[key];
              if (!label) return null;
              return (
                <div key={key} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{isRTL ? label.ar : label.en}</span>
                  <span className="text-sm font-semibold">{value} سم</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {order.fabricName && (
        <Card header={<h3 className="font-bold text-gray-800 flex items-center gap-2"><Scissors size={18} className="text-primary-600" />{isRTL ? 'القماش' : 'Fabric'}</h3>}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{order.fabricName}</span>
            <span className="font-semibold">{formatCurrency(order.fabricPrice || 0)}</span>
          </div>
        </Card>
      )}

      <Card header={<h3 className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18} className="text-primary-600" />{isRTL ? 'تفاصيل السعر' : 'Price Breakdown'}</h3>}>
        <div className="space-y-2 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span className="font-semibold">{formatCurrency(item.price)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? 'رسوم التوصيل' : 'Delivery'}</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? 'ضريبة القيمة المضافة' : 'VAT'}</span>
              <span>{formatCurrency(order.vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-primary-700 border-t pt-2 mt-2">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span>{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card header={<h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18} className="text-primary-600" />{isRTL ? 'تاريخ التسليم المتوقع' : 'Estimated Delivery'}</h3>}>
        <p className="text-lg font-bold text-center text-primary-700">
          {new Date(order.estimatedDeliveryDate).toLocaleDateString(
            isRTL ? 'ar-SA' : 'en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </p>
      </Card>

      <div className="flex gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={onApprove}>
          {isRTL ? 'موافق على الطلب' : 'Approve Order'}
        </Button>
        <Button variant="gold" size="lg" fullWidth onClick={onRequestChanges}>
          <FileEdit size={18} />
          {isRTL ? 'طلب تعديل' : 'Request Changes'}
        </Button>
      </div>
    </div>
  );
}

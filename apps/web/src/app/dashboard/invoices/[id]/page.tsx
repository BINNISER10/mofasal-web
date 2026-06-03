'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { paymentsApi } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  ArrowRight, Download, Share2, Printer, QrCode,
  CheckCircle2, Building2, Phone, MapPin, Calendar,
  FileText, Shield,
} from 'lucide-react';

const mockInvoice = {
  invoiceNumber: 'INV-2024-001284',
  zatcaSerial: 'ZT-20240325-88127',
  issueDate: '2024-03-25',
  dueDate: '2024-03-25',
  status: 'PAID',
  orderId: 'ORD-1284',
  seller: {
    nameAr: 'خياطة الرجال الراقية',
    nameEn: 'Premium Menswear Tailoring',
    crNumber: '1010123456',
    vatNumber: '300012345678910',
    address: 'الرياض، حي الملقا، شارع الأمير محمد بن سلمان',
    phone: '+966 11 234 5678',
  },
  buyer: {
    nameAr: 'أحمد محمد العمري',
    vatNumber: null,
    phone: '+966 55 123 4567',
    address: 'الرياض، حي الورود، شارع الملك فهد',
  },
  items: [
    { description: 'بدلة رسمية كاملة - صوف إيطالي', qty: 1, unitPrice: 1200, total: 1200 },
    { description: 'قميص رسمي - قطن مصري', qty: 2, unitPrice: 250, total: 500 },
    { description: 'قماش صوف إيطالي (3 أمتار)', qty: 3, unitPrice: 350, total: 1050 },
  ],
  subtotal: 2750,
  vatRate: 0.15,
  vatAmount: 412.5,
  total: 3162.5,
  paymentMethod: 'مدى',
  paymentDate: '2024-03-25',
  zatcaQrData: 'AAABBBCCC123',
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [inv, setInv] = useState<any>(mockInvoice);

  useEffect(() => {
    let active = true;
    paymentsApi.getInvoice(String(id))
      .then((res) => {
        if (!active) return;
        const api: any = res.invoice;
        if (!api || !api.id) return;
        setInv({
          ...mockInvoice,
          ...api,
          invoiceNumber: api.invoiceNumber || mockInvoice.invoiceNumber,
          subtotal: api.amount ?? mockInvoice.subtotal,
          vatAmount: api.vatAmount ?? mockInvoice.vatAmount,
          total: api.totalAmount ?? api.total ?? mockInvoice.total,
          items: Array.isArray(api.items) && api.items.length ? api.items : mockInvoice.items,
          seller: api.seller || mockInvoice.seller,
          buyer: api.buyer || mockInvoice.buyer,
        });
      })
      .catch(() => { /* الإبقاء على القالب الاحتياطي */ });
    return () => { active = false; };
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600">
          <ArrowRight size={16} />
          <span>{isRTL ? 'رجوع' : 'Back'}</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Share2 size={16} />}>
            {isRTL ? 'مشاركة' : 'Share'}
          </Button>
          <Button variant="outline" size="sm" icon={<Printer size={16} />}>
            {isRTL ? 'طباعة' : 'Print'}
          </Button>
          <Button variant="primary" size="sm" icon={<Download size={16} />}>
            {isRTL ? 'PDF' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div ref={invoiceRef}>
        <Card className="overflow-hidden dark:bg-slate-800/60">
          {/* Header */}
          <div className="bg-gradient-to-l from-primary-700 to-primary-900 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-black mb-1">مُفَصَّل</div>
                <div className="text-primary-200 text-xs">MUFASAL Platform</div>
              </div>
              <div className="text-end">
                <div className="text-lg font-black">{isRTL ? 'فاتورة ضريبية' : 'Tax Invoice'}</div>
                <div className="text-primary-200 text-sm font-mono mt-1">{inv.invoiceNumber}</div>
                <Badge variant="success" size="sm" className="mt-2">
                  {isRTL ? 'مدفوعة' : 'Paid'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* ZATCA Compliance Notice */}
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3">
              <Shield size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-800 dark:text-green-400">
                  {isRTL ? 'فاتورة إلكترونية متوافقة مع هيئة الزكاة والضريبة والجمارك (زاتكا)' : 'ZATCA-Compliant E-Invoice'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 font-mono mt-0.5">
                  {isRTL ? 'الرقم التسلسلي: ' : 'Serial: '}{inv.zatcaSerial}
                </p>
              </div>
            </div>

            {/* Seller / Buyer */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-3">
                  {isRTL ? 'البائع' : 'Seller'}
                </p>
                <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{inv.seller.nameAr}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{inv.seller.nameEn}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Building2 size={11} />{isRTL ? 'س.ت: ' : 'CR: '}{inv.seller.crNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText size={11} />{isRTL ? 'رقم ضريبي: ' : 'VAT: '}{inv.seller.vatNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone size={11} />{inv.seller.phone}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-3">
                  {isRTL ? 'المشتري' : 'Buyer'}
                </p>
                <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{inv.buyer.nameAr}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone size={11} />{inv.buyer.phone}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-start gap-1">
                    <MapPin size={11} className="mt-0.5 flex-shrink-0" />{inv.buyer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { labelAr: 'تاريخ الإصدار', labelEn: 'Issue Date', value: inv.issueDate },
                { labelAr: 'تاريخ الدفع', labelEn: 'Payment Date', value: inv.paymentDate },
                { labelAr: 'طريقة الدفع', labelEn: 'Payment Method', value: inv.paymentMethod },
              ].map((item) => (
                <div key={item.labelEn} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? item.labelAr : item.labelEn}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Items Table */}
            <div>
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-2 text-xs font-bold text-primary-700 dark:text-primary-400">
                <span className="col-span-6">{isRTL ? 'البيان' : 'Description'}</span>
                <span className="col-span-2 text-center">{isRTL ? 'الكمية' : 'Qty'}</span>
                <span className="col-span-2 text-center">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</span>
                <span className="col-span-2 text-end">{isRTL ? 'الإجمالي' : 'Total'}</span>
              </div>
              {inv.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-3 border-b border-gray-50 dark:border-slate-700 last:border-0 text-sm">
                  <span className="col-span-6 text-gray-700 dark:text-slate-300">{item.description}</span>
                  <span className="col-span-2 text-center text-gray-600 dark:text-slate-400">{item.qty}</span>
                  <span className="col-span-2 text-center text-gray-600 dark:text-slate-400">{item.unitPrice.toLocaleString()}</span>
                  <span className="col-span-2 text-end font-semibold text-gray-900 dark:text-slate-100">{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400">
                <span>{isRTL ? 'المجموع قبل الضريبة' : 'Subtotal (ex. VAT)'}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(inv.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400">
                <span>{isRTL ? `ضريبة القيمة المضافة ${inv.vatRate * 100}%` : `VAT ${inv.vatRate * 100}%`}</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(inv.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 dark:text-slate-100 pt-2 border-t border-gray-200 dark:border-slate-600">
                <span>{isRTL ? 'الإجمالي شامل الضريبة' : 'Total (inc. VAT)'}</span>
                <span className="text-primary-700 dark:text-primary-400">{formatCurrency(inv.total)}</span>
              </div>
            </div>

            {/* ZATCA QR */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-gray-100 dark:border-slate-600 flex-shrink-0">
                <div className="text-center">
                  <QrCode size={48} className="text-gray-800 dark:text-slate-200 mx-auto" />
                  <p className="text-[8px] text-gray-400 mt-1">ZATCA QR</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-slate-100 text-sm mb-1">
                  {isRTL ? 'رمز الاستجابة السريعة (ZATCA)' : 'ZATCA QR Code'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {isRTL
                    ? 'امسح هذا الرمز للتحقق من صحة الفاتورة مباشرة عبر بوابة هيئة الزكاة والضريبة والجمارك'
                    : 'Scan this code to verify the invoice via the ZATCA portal'}
                </p>
                <p className="text-xs font-mono text-primary-600 dark:text-primary-400 mt-2 break-all">{inv.zatcaSerial}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 dark:text-slate-500 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p>{isRTL ? 'هذه فاتورة إلكترونية معتمدة وفق أنظمة هيئة الزكاة والضريبة والجمارك في المملكة العربية السعودية' : 'This is a certified e-invoice per ZATCA regulations in the Kingdom of Saudi Arabia'}</p>
              <p className="mt-1 font-mono">{inv.invoiceNumber} • {inv.issueDate}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

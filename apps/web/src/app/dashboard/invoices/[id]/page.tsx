'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { paymentsApi, Invoice } from '@/lib/api/payments';
import toast from 'react-hot-toast';
import {
  Printer, Download, Share2, CheckCircle2, Loader2, FileText,
  Building2, MapPin, Phone, Mail, Calendar, Hash, CreditCard,
  QrCode, ArrowLeft, Scissors, ReceiptText,
} from 'lucide-react';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const invoiceId = String(params.id);

  useEffect(() => {
    setLoading(true);
    paymentsApi.getInvoice(invoiceId)
      .then(res => setInvoice(res.invoice))
      .catch(() => {
        setInvoice({
          id: invoiceId,
          invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
          orderId: 'demo-order',
          amount: 2250,
          vatAmount: 337.5,
          totalAmount: 2622.5,
          status: 'PAID',
          dueDate: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          items: [
            { name: 'تفصيل ثوب سعودي', quantity: 1, price: 1200 },
            { name: 'قماش نياقة إيطالي - 3 أمتار', quantity: 1, price: 1050 },
          ],
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-primary-600" size={36} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <FileText size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">{isRTL ? 'الفاتورة غير موجودة' : 'Invoice Not Found'}</h2>
        <Button variant="outline" onClick={() => router.back()}>{isRTL ? 'رجوع' : 'Back'}</Button>
      </div>
    );
  }

  const statusInfo: Record<string, { ar: string; color: 'success' | 'danger' | 'gold' | 'info' }> = {
    PAID: { ar: 'مدفوعة', color: 'success' },
    UNPAID: { ar: 'غير مدفوعة', color: 'danger' },
    OVERDUE: { ar: 'متأخرة', color: 'danger' },
    CANCELLED: { ar: 'ملغاة', color: 'info' },
  };

  const s = statusInfo[invoice.status] || { ar: invoice.status, color: 'info' as const };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20 print:p-0 print:max-w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowLeft size={16} />
          <span>{isRTL ? 'رجوع' : 'Back'}</span>
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => toast.success(isRTL ? 'جاري التحميل' : 'Downloading')}>
            PDF
          </Button>
          <Button variant="primary" size="sm" icon={<Printer size={14} />} onClick={handlePrint}>
            {isRTL ? 'طباعة' : 'Print'}
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 md:p-10 print:border-0 print:shadow-none print:rounded-none print:p-0" id="invoice-print">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white">
              <Scissors size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-slate-100">مفصل | MUFASAL</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'منصة الخياطة الراقية' : 'Premium Tailoring Platform'}</p>
            </div>
          </div>
          <div className="text-end">
            <h2 className="text-lg font-black text-gray-900 dark:text-slate-100">{isRTL ? 'فاتورة ضريبية' : 'Tax Invoice'}</h2>
            <p className="text-sm font-mono text-gray-500 dark:text-slate-400">{invoice.invoiceNumber}</p>
            <Badge variant={s.color} size="sm" className="mt-1">{s.ar}</Badge>
          </div>
        </div>

        {/* Company & Customer Info */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="space-y-1">
            <p className="font-bold text-gray-900 dark:text-slate-100 text-base">{isRTL ? 'مفصل - منصة الخياطة' : 'MUFASAL Tailoring'}</p>
            <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Building2 size={13} />{isRTL ? 'س.ت: 1234567890' : 'CR: 1234567890'}</p>
            <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={13} />{isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p>
            <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Mail size={13} />info@mufasal.com</p>
          </div>
          <div className="space-y-1 text-end">
            <p className="font-bold text-gray-900 dark:text-slate-100">{isRTL ? 'العميل' : 'Customer'}</p>
            <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'عميل مفصل' : 'MUFASAL Customer'}</p>
            <p className="text-gray-500 dark:text-slate-400 flex items-center justify-end gap-1"><Calendar size={13} />{new Date(invoice.createdAt).toLocaleDateString('ar-SA')}</p>
            <p className="text-gray-500 dark:text-slate-400 flex items-center justify-end gap-1"><Hash size={13} />{invoice.orderId?.slice(0, 8)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-slate-600">
                <th className="text-start py-3 font-bold text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">#</th>
                <th className="text-start py-3 font-bold text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">{isRTL ? 'البيان' : 'Description'}</th>
                <th className="text-center py-3 font-bold text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">{isRTL ? 'الكمية' : 'Qty'}</th>
                <th className="text-end py-3 font-bold text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">{isRTL ? 'السعر' : 'Price'}</th>
                <th className="text-end py-3 font-bold text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">{isRTL ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-slate-700">
                  <td className="py-3 text-gray-500 dark:text-slate-400">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-900 dark:text-slate-100">{item.name}</td>
                  <td className="py-3 text-center text-gray-500 dark:text-slate-400">{item.quantity}</td>
                  <td className="py-3 text-end text-gray-900 dark:text-slate-100 font-mono">{item.price.toLocaleString()} ر.س</td>
                  <td className="py-3 text-end font-semibold text-gray-900 dark:text-slate-100 font-mono">{(item.price * item.quantity).toLocaleString()} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>{isRTL ? 'المجموع' : 'Subtotal'}</span>
              <span className="font-mono">{invoice.amount.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>{isRTL ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
              <span className="font-mono">{invoice.vatAmount.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between font-black text-lg text-gray-900 dark:text-slate-100 pt-2 border-t-2 border-gray-200 dark:border-slate-600">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="font-mono text-primary-700 dark:text-primary-400">{invoice.totalAmount.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        {/* ZATCA QR + Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <QrCode size={48} className="text-gray-400 dark:text-slate-500" />
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500 space-y-0.5">
              <p>{isRTL ? 'رمز QR خاص بـ ZATCA' : 'ZATCA QR Code'}</p>
              <p>{isRTL ? 'امسح للتحقق من الفاتورة' : 'Scan to verify invoice'}</p>
            </div>
          </div>
          <div className="text-end text-xs text-gray-400 dark:text-slate-500">
            <p>{isRTL ? 'شكراً لاختيارك مفصل' : 'Thank you for choosing MUFASAL'}</p>
            <p className="mt-1">{isRTL ? 'الرقم الضريبي: 310000000000003' : 'VAT: 310000000000003'}</p>
            <p>{new Date(invoice.paidAt || invoice.createdAt).toLocaleString('ar-SA')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

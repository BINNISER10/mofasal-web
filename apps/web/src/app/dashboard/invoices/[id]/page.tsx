'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { paymentsApi } from '@/lib/api/payments';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { FileText, ChevronLeft, ChevronRight, Printer, ArrowLeft } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    paymentsApi.getInvoice(id as string)
      .then((res) => setInvoice(res))
      .catch(() => toast.error(isRTL ? 'فشل تحميل الفاتورة' : 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id, isRTL]);

  if (loading) return <LoadingSpinner fullScreen text={isRTL ? 'جاري تحميل الفاتورة...' : 'Loading invoice...'} />;
  if (!invoice) return <div className="flex items-center justify-center py-20"><div className="text-center"><FileText size={48} className="text-[#735B4D]/30 mx-auto mb-4" /><p className="text-[#735B4D]/60">{isRTL ? 'الفاتورة غير موجودة' : 'Invoice not found'}</p></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F2E8D4]/30">{isRTL ? <ChevronRight size={20} className="text-[#735B4D]" /> : <ChevronLeft size={20} className="text-[#735B4D]" />}</button>
          <div><h1 className="text-xl font-bold text-[#00373E]">{isRTL ? 'فاتورة' : 'Invoice'} #{invoice.invoiceNumber || invoice.id?.slice(0, 8)}</h1></div>
        </div>
        <Button variant="ghost" size="sm" icon={<Printer size={16} />} onClick={() => window.print()}>{isRTL ? 'طباعة' : 'Print'}</Button>
      </div>
      <Card className="p-8">
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#D0D6D7]/20">
          <div><h2 className="text-2xl font-black text-[#00373E]">مُفصّل</h2><p className="text-sm text-[#735B4D]/60">MUFASAL</p></div>
          <Badge variant={invoice.status === 'PAID' ? 'primary' : 'danger'} size="md">{invoice.status === 'PAID' ? (isRTL ? 'مدفوعة' : 'Paid') : (isRTL ? 'غير مدفوعة' : 'Unpaid')}</Badge>
        </div>
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-[#00373E]/10"><th className="text-right py-3 font-semibold text-[#735B4D]">{isRTL ? 'الوصف' : 'Description'}</th><th className="text-center py-3 font-semibold text-[#735B4D]">{isRTL ? 'الكمية' : 'Qty'}</th><th className="text-center py-3 font-semibold text-[#735B4D]">{isRTL ? 'السعر' : 'Price'}</th><th className="text-left py-3 font-semibold text-[#735B4D]">{isRTL ? 'المجموع' : 'Total'}</th></tr></thead>
            <tbody>{(invoice.items || []).map((item: any, i: number) => <tr key={i} className="border-b border-[#D0D6D7]/10"><td className="py-3 text-[#00373E]">{item.description || item.name}</td><td className="py-3 text-center text-[#735B4D]">{item.quantity}</td><td className="py-3 text-center text-[#735B4D]">{item.unitPrice?.toLocaleString()}</td><td className="py-3 text-left font-semibold text-[#00373E]">{(item.quantity * item.unitPrice)?.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="border-t-2 border-[#00373E]/10 pt-4">
          <div className="space-y-2 max-w-xs ms-auto">
            <div className="flex justify-between"><span className="text-sm text-[#735B4D]">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span><span className="text-sm font-semibold text-[#00373E]">{invoice.totalAmount?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span></div>
            {invoice.vatAmount > 0 && <div className="flex justify-between"><span className="text-sm text-[#735B4D]">{isRTL ? 'ضريبة القيمة المضافة' : 'VAT'}</span><span className="text-sm font-semibold text-[#00373E]">{invoice.vatAmount?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span></div>}
            <div className="flex justify-between pt-2 border-t border-[#D0D6D7]/20"><span className="text-base font-bold text-[#00373E]">{isRTL ? 'الإجمالي' : 'Total'}</span><span className="text-xl font-black text-[#00373E]">{invoice.grandTotal?.toLocaleString() || invoice.totalAmount?.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
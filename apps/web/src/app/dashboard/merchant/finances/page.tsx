'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, FileText, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MerchantFinancesPage() {
  const { isRTL } = useAppStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'التقارير المالية' : 'Financial Reports'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير' : 'Export'}</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إجمالي المبيعات' : 'Total Sales'} value={formatCurrency(892000)} trend={15.3} color="success" />
        <StatsCard icon={<TrendingUp size={22} />} label={isRTL ? 'متوسط الطلب' : 'Avg Order'} value={formatCurrency(345)} trend={8.2} color="primary" />
        <StatsCard icon={<FileText size={22} />} label={isRTL ? 'الفواتير' : 'Invoices'} value="1,247" color="info" />
      </div>
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'تقارير المبيعات' : 'Sales Reports'}</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'][i]}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: isRTL ? 'مدى' : 'Mada', value: 45 }, { label: 'STC Pay', value: 30 }, { label: isRTL ? 'فيزا/ماستركارد' : 'Visa/MC', value: 25 }].map((pm) => (
          <Card key={pm.label} className="p-4 text-center"><p className="text-sm text-gray-500 dark:text-slate-400">{pm.label}</p><p className="text-2xl font-bold text-primary-700">{pm.value}%</p></Card>
        ))}
      </div>
    </div>
  );
}

'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MufasalDualAreaChart, MufasalPieChart, CHART_COLORS } from '@/components/shared/Charts';

const revenueVsExpenses = [
  { name: 'ينا', value: 89200, value2: 34500 },
  { name: 'فبر', value: 102000, value2: 38000 },
  { name: 'مار', value: 95000, value2: 36000 },
  { name: 'أبر', value: 118000, value2: 41000 },
  { name: 'ماي', value: 109000, value2: 39000 },
  { name: 'يون', value: 134000, value2: 45000 },
];

const expenseBreakdown = [
  { name: 'أقمشة', value: 40, color: CHART_COLORS.primary },
  { name: 'رواتب', value: 30, color: CHART_COLORS.gold },
  { name: 'إيجار', value: 15, color: CHART_COLORS.blue },
  { name: 'خدمات', value: 10, color: CHART_COLORS.green },
  { name: 'أخرى', value: 5, color: CHART_COLORS.gray },
];

export default function FinancesPage() {
  const { isRTL } = useAppStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المالية' : 'Finances'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير تقرير' : 'Export Report'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إيرادات الشهر' : 'Monthly Revenue'} value={formatCurrency(89200)} trend={12.5} color="success" />
        <StatsCard icon={<TrendingDown size={22} />} label={isRTL ? 'المصروفات' : 'Expenses'} value={formatCurrency(34500)} trend={-3.2} color="danger" />
        <StatsCard icon={<TrendingUp size={22} />} label={isRTL ? 'صافي الربح' : 'Net Profit'} value={formatCurrency(54700)} trend={18.7} color="primary" />
        <StatsCard icon={<FileText size={22} />} label={isRTL ? 'الفواتير' : 'Invoices'} value="156" color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}</h3>
          <MufasalDualAreaChart
            data={revenueVsExpenses}
            color={CHART_COLORS.primary}
            color2={CHART_COLORS.red}
            label1={isRTL ? 'الإيرادات' : 'Revenue'}
            label2={isRTL ? 'المصروفات' : 'Expenses'}
            prefix="﷼"
            height={250}
          />
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2">{isRTL ? 'توزيع المصروفات' : 'Expense Breakdown'}</h3>
          <MufasalPieChart data={expenseBreakdown} height={250} innerRadius={50} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'حساب ضريبة القيمة المضافة' : 'VAT Calculation'}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">{isRTL ? 'الإيرادات الخاضعة للضريبة' : 'Taxable Revenue'}</p><p className="text-lg font-bold dark:text-slate-100">{formatCurrency(89200)}</p></div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">VAT 15%</p><p className="text-lg font-bold text-primary-700">{formatCurrency(13380)}</p></div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">{isRTL ? 'صافي الإيرادات' : 'Net Revenue'}</p><p className="text-lg font-bold text-green-600">{formatCurrency(75820)}</p></div>
        </div>
      </Card>
    </div>
  );
}

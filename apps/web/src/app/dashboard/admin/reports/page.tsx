'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MufasalBarChart, MufasalPieChart, MufasalAreaChart, CHART_COLORS } from '@/components/shared/Charts';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, Download, FileText, BarChart3 } from 'lucide-react';

const monthlyRevenue = [
  { name: 'ينا', value: 820000, value2: 72000 },
  { name: 'فبر', value: 940000, value2: 85000 },
  { name: 'مار', value: 880000, value2: 79000 },
  { name: 'أبر', value: 1100000, value2: 98000 },
  { name: 'ماي', value: 980000, value2: 87000 },
  { name: 'يون', value: 1250000, value2: 112000 },
  { name: 'يول', value: 1180000, value2: 105000 },
  { name: 'أغس', value: 1340000, value2: 120000 },
  { name: 'سبت', value: 1220000, value2: 109000 },
  { name: 'أكت', value: 1480000, value2: 133000 },
  { name: 'نوف', value: 1390000, value2: 125000 },
  { name: 'ديس', value: 1650000, value2: 148000 },
];

const categoryBreakdown = [
  { name: 'خياطة رجالي', value: 45, color: CHART_COLORS.primary },
  { name: 'خياطة نسائي', value: 28, color: CHART_COLORS.secondary },
  { name: 'أقمشة', value: 18, color: CHART_COLORS.gold },
  { name: 'أطفال', value: 9, color: CHART_COLORS.green },
];

export default function AdminReportsPage() {
  const { isRTL } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'التقارير المالية' : 'Financial Reports'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير CSV' : 'Export CSV'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(892000)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={14} />+12.5% {isRTL ? 'عن الشهر الماضي' : 'vs last month'}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart3 size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'العمولات' : 'Commissions'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(89200)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={14} />+8.3%</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center"><FileText size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الفواتير المصدرة' : 'Invoices Issued'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">1,247</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={14} />+5.1%</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'الإيرادات والعمولات الشهرية' : 'Monthly Revenue & Commissions'}</h3>
          <MufasalBarChart
            data={monthlyRevenue}
            color={CHART_COLORS.primary}
            color2={CHART_COLORS.gold}
            label1={isRTL ? 'الإيرادات' : 'Revenue'}
            label2={isRTL ? 'العمولات' : 'Commissions'}
            prefix="﷼"
            height={280}
          />
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2">{isRTL ? 'توزيع الفئات' : 'Category Breakdown'}</h3>
          <MufasalPieChart data={categoryBreakdown} height={280} innerRadius={50} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'نمو الإيرادات' : 'Revenue Growth Trend'}</h3>
        <MufasalAreaChart
          data={monthlyRevenue.map(d => ({ name: d.name, value: d.value }))}
          color={CHART_COLORS.primaryLight}
          label={isRTL ? 'الإيرادات' : 'Revenue'}
          prefix="﷼"
          height={200}
        />
      </Card>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MufasalDualAreaChart, MufasalPieChart, CHART_COLORS } from '@/components/shared/Charts';
import { accountingApi } from '@/lib/api/accounting';
import { paymentsApi } from '@/lib/api/payments';
import { DashboardStatLink } from '@/components/shared/DashboardStatLink';

const MONTHS_AR = ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'];

export default function FinancesPage() {
  const { isRTL } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [journal, setJournal] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      accountingApi.getTrialBalance().catch(() => null),
      accountingApi.getJournal({ limit: '5' }).catch(() => []),
      paymentsApi.getInvoices({ limit: '5' }).catch(() => ({ invoices: [], total: 0 })),
    ]).then(([tb, jr, inv]) => {
      if (!active) return;
      setTrialBalance(tb);
      setJournal(Array.isArray(jr) ? jr : []);
      setInvoices(inv?.invoices || []);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const revenueAccounts = trialBalance?.rows?.filter((r: any) => r.type === 'REVENUE') || [];
  const expenseAccounts = trialBalance?.rows?.filter((r: any) => r.type === 'EXPENSE') || [];
  const totalRevenue = revenueAccounts.reduce((s: number, r: any) => s + (r.credit || 0) - (r.debit || 0), 0);
  const totalExpenses = expenseAccounts.reduce((s: number, r: any) => s + (r.debit || 0) - (r.credit || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const vatAmount = totalRevenue * 0.15;

  const revenueVsExpenses = journal.slice(0, 6).map((e: any, i: number) => {
    const rev = e.lines?.filter((l: any) => l.account?.type === 'REVENUE').reduce((s: number, l: any) => s + (l.credit || 0), 0) || 0;
    const exp = e.lines?.filter((l: any) => l.account?.type === 'EXPENSE').reduce((s: number, l: any) => s + (l.debit || 0), 0) || 0;
    return { name: MONTHS_AR[i] || (e.date?.slice(0, 7) || ''), value: rev || (totalRevenue / Math.max(journal.length, 1)), value2: exp || (totalExpenses / Math.max(journal.length, 1)) };
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المالية' : 'Finances'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير تقرير' : 'Export Report'}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إيرادات الشهر' : 'Monthly Revenue'} value={formatCurrency(totalRevenue)} color="success" href="/dashboard/finances" />
        <StatsCard icon={<TrendingDown size={22} />} label={isRTL ? 'المصروفات' : 'Expenses'} value={formatCurrency(totalExpenses)} color="danger" href="/dashboard/finances" />
        <StatsCard icon={<TrendingUp size={22} />} label={isRTL ? 'صافي الربح' : 'Net Profit'} value={formatCurrency(netProfit)} color="primary" href="/dashboard/finances" />
        <StatsCard icon={<FileText size={22} />} label={isRTL ? 'الفواتير' : 'Invoices'} value={String(invoices.length)} color="info" href="/dashboard/finances" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}</h3>
          <MufasalDualAreaChart
            data={revenueVsExpenses.length > 0 ? revenueVsExpenses : [{ name: MONTHS_AR[0], value: totalRevenue || 0, value2: totalExpenses || 0 }]}
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
          <MufasalPieChart
            data={expenseAccounts.length > 0 ? expenseAccounts.map((e: any, i: number) => ({
              name: e.name,
              value: e.debit || 0,
              color: [CHART_COLORS.primary, CHART_COLORS.gold, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.gray][i % 5],
            })) : [{ name: isRTL ? 'بدون بيانات' : 'No data', value: 1, color: CHART_COLORS.gray }]}
            height={250}
            innerRadius={50}
          />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'حساب ضريبة القيمة المضافة' : 'VAT Calculation'}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <DashboardStatLink href="/dashboard/finances" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">{isRTL ? 'الإيرادات الخاضعة للضريبة' : 'Taxable Revenue'}</p><p className="text-lg font-bold dark:text-slate-100">{formatCurrency(totalRevenue)}</p></DashboardStatLink>
          <DashboardStatLink href="/dashboard/finances" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">VAT 15%</p><p className="text-lg font-bold text-primary-700">{formatCurrency(vatAmount)}</p></DashboardStatLink>
          <DashboardStatLink href="/dashboard/finances" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center"><p className="text-gray-500 dark:text-slate-400">{isRTL ? 'صافي الإيرادات' : 'Net Revenue'}</p><p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue - vatAmount)}</p></DashboardStatLink>
        </div>
      </Card>
    </div>
  );
}

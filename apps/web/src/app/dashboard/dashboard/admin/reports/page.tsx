'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MufasalBarChart, MufasalPieChart, MufasalAreaChart, CHART_COLORS } from '@/components/shared/Charts';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, Download, FileText, BarChart3, Loader2 } from 'lucide-react';
import { reportsApi } from '@/lib/api/reports';
import { adminApi } from '@/lib/api/admin';
import { DashboardStatLink } from '@/components/shared/DashboardStatLink';

const MONTHS_AR = ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'];

export default function AdminReportsPage() {
  const { isRTL } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<{ name: string; value: number }[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [commissionData, setCommissionData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      reportsApi.getSummary(),
      reportsApi.getSalesTrend(),
      reportsApi.getPaymentBreakdown(),
      adminApi.getCommissions(),
    ]).then(([summaryRes, trendRes, paymentRes, commissionRes]) => {
      if (!active) return;
      setSummary(summaryRes);
      setSalesTrend((trendRes || []).map((t: any, i: number) => ({
        name: MONTHS_AR[i] || t.date?.slice(0, 7) || '',
        value: t.revenue || t.value || 0,
      })));
      const methodLabels: Record<string, string> = { MADA: 'مدى', VISA: 'فيزا', MASTERCARD: 'ماستركارد', CASH_ON_DELIVERY: 'الدفع عند الاستلام', BANK_TRANSFER: 'تحويل بنكي', APPLE_PAY: 'أبل باي', STC_PAY: 'STC Pay' };
      setPaymentBreakdown((paymentRes || []).map((p: any) => ({
        name: isRTL ? (methodLabels[p.method] || p.method) : p.method,
        value: p.revenue || p.count || 0,
        color: CHART_COLORS.primary,
      })));
      const commissions = Array.isArray(commissionRes) ? commissionRes : [];
      setCommissionData(commissions.map((c: any) => ({
        name: c.name || '',
        value: c.earned || 0,
      })));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'التقارير المالية' : 'Financial Reports'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير CSV' : 'Export CSV'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatLink href="/dashboard/admin/reports">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(summary?.totalRevenue || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={14} />{isRTL ? 'إجمالي الإيرادات' : 'Total revenue'}</div>
        </Card>
        </DashboardStatLink>
        <DashboardStatLink href="/dashboard/admin/orders">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart3 size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الطلبات' : 'Orders'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{summary?.totalOrders || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600"><TrendingUp size={14} />{summary?.paidOrders || 0} {isRTL ? 'مدفوع' : 'paid'}</div>
        </Card>
        </DashboardStatLink>
        <DashboardStatLink href="/dashboard/admin/orders">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center"><FileText size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'متوسط الطلب' : 'Avg Order'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(summary?.avgOrderValue || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">{summary?.totalVat ? `${formatCurrency(summary.totalVat)} VAT` : ''}</div>
        </Card>
        </DashboardStatLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'اتجاه المبيعات' : 'Sales Trend'}</h3>
          <MufasalBarChart
            data={salesTrend}
            color={CHART_COLORS.primary}
            label1={isRTL ? 'الإيرادات' : 'Revenue'}
            prefix="﷼"
            height={280}
          />
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2">{isRTL ? 'طرق الدفع' : 'Payments'}</h3>
          <MufasalPieChart data={paymentBreakdown} height={280} innerRadius={50} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'نمو الإيرادات' : 'Revenue Growth Trend'}</h3>
        <MufasalAreaChart
          data={salesTrend}
          color={CHART_COLORS.primaryLight}
          label={isRTL ? 'الإيرادات' : 'Revenue'}
          prefix="﷼"
          height={200}
        />
      </Card>
    </div>
  );
}

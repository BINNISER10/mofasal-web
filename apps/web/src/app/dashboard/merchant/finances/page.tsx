'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, TrendingUp, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { reportsApi, ReportOverview } from '@/lib/api/reports';
import { DashboardStatLink } from '@/components/shared/DashboardStatLink';

export default function MerchantFinancesPage() {
  const { isRTL } = useAppStore();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await reportsApi.getOverview();
        setOverview(res);
      } catch (err) {
        console.error('Failed to fetch report overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const trend = overview?.salesTrend || [];
    const totalSales = overview?.summary.totalRevenue || 0;
    const avgOrder = overview?.summary.avgOrderValue || 0;
    const count = overview?.summary.paidOrders || 0;

    const series = trend.map((p) => ({ label: p.date.slice(5), value: p.revenue }));
    const maxVal = Math.max(...series.map((s) => s.value), 1);

    const methods = (overview?.paymentBreakdown || [])
      .map((m) => ({ label: m.method, pct: totalSales ? Math.round((m.revenue / totalSales) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);

    return { totalSales, avgOrder, count, series, maxVal, methods };
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'التقارير المالية' : 'Financial Reports'}</h2>
        <Button variant="primary" icon={<Download size={16} />}>{isRTL ? 'تصدير' : 'Export'}</Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard icon={<DollarSign size={22} />} label={isRTL ? 'إجمالي المبيعات' : 'Total Sales'} value={formatCurrency(stats.totalSales)} color="success" href="/dashboard/merchant/finances" />
            <StatsCard icon={<TrendingUp size={22} />} label={isRTL ? 'متوسط الطلب' : 'Avg Order'} value={formatCurrency(Math.round(stats.avgOrder))} color="primary" href="/dashboard/merchant/orders" />
            <StatsCard icon={<FileText size={22} />} label={isRTL ? 'طلبات مدفوعة' : 'Paid Orders'} value={stats.count.toLocaleString()} color="info" href="/dashboard/merchant/orders" />
          </div>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'اتجاه المبيعات' : 'Sales Trend'}</h3>
            {stats.series.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 py-8 text-center">{isRTL ? 'لا توجد مبيعات بعد' : 'No sales yet'}</p>
            ) : (
              <div className="h-64 flex items-end justify-between gap-1 overflow-x-auto">
                {stats.series.map((pt, i) => (
                  <div key={i} className="flex-1 min-w-[14px] flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400" style={{ height: `${Math.max((pt.value / stats.maxVal) * 100, 2)}%` }} title={formatCurrency(pt.value)} />
                    <span className="text-[9px] text-gray-400 dark:text-slate-500">{pt.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {stats.methods.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.methods.map((pm) => (
                <DashboardStatLink key={pm.label} href="/dashboard/merchant/orders">
                <Card className="p-4 text-center"><p className="text-sm text-gray-500 dark:text-slate-400">{pm.label}</p><p className="text-2xl font-bold text-primary-700">{pm.pct}%</p></Card>
                </DashboardStatLink>
              ))}
            </div>
          )}

          {(overview?.topProducts?.length ?? 0) > 0 && (
            <Card className="p-5">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'الأكثر مبيعاً' : 'Top Products'}</h3>
              <div className="space-y-2">
                {overview!.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{p.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{p.quantity} {isRTL ? 'قطعة' : 'units'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary-700">{formatCurrency(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

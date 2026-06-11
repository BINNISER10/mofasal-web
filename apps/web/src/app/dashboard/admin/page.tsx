'use client';
import React, { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { MufasalAreaChart, MufasalPieChart, CHART_COLORS } from '@/components/shared/Charts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Activity,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

export default function AdminDashboardPage() {
  const { isRTL } = useAppStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        setDashboardData(res.dashboard);
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse"><div className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { icon: <Users size={22} />, label: isRTL ? 'إجمالي المستخدمين' : 'Total Users', value: dashboardData?.totalUsers?.toLocaleString() || '0', trend: 12.5, color: 'primary' as const },
    { icon: <Store size={22} />, label: isRTL ? 'إجمالي المتاجر' : 'Total Shops', value: dashboardData?.totalShops?.toLocaleString() || '0', trend: 8.3, color: 'gold' as const },
    { icon: <Package size={22} />, label: isRTL ? 'إجمالي التجار' : 'Total Merchants', value: dashboardData?.totalMerchants?.toLocaleString() || '0', trend: 5.2, color: 'info' as const },
    { icon: <ShoppingBag size={22} />, label: isRTL ? 'إجمالي الطلبات' : 'Total Orders', value: dashboardData?.totalOrders?.toLocaleString() || '0', trend: 15.7, color: 'success' as const },
    { icon: <DollarSign size={22} />, label: isRTL ? 'الإيرادات (ريال)' : 'Revenue (SAR)', value: dashboardData?.totalRevenue?.toLocaleString() || '0', trend: 22.4, color: 'primary' as const },
  ];

  const revenueData = dashboardData?.revenueByMonth || [];
  const orderStatusData = dashboardData?.ordersByStatus || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const recentUsers = dashboardData?.recentUsers || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </h3>
            <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-lg">
              {isRTL ? 'آخر 12 شهر' : 'Last 12 months'}
            </span>
          </div>
          {revenueData.length > 0 ? (
            <MufasalAreaChart
              data={revenueData}
              color={CHART_COLORS.primary}
              label={isRTL ? 'الإيرادات' : 'Revenue'}
              prefix="﷼"
              height={240}
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا توجد بيانات' : 'No data available'}</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2">
            {isRTL ? 'توزيع الطلبات' : 'Orders Distribution'}
          </h3>
          {orderStatusData.length > 0 ? (
            <MufasalPieChart data={orderStatusData} height={250} innerRadius={50} />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا توجد بيانات' : 'No data available'}</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-slate-100">
              {isRTL ? 'آخر الطلبات' : 'Recent Orders'}
            </h3>
            <a href="/dashboard/admin/orders" className="text-sm text-primary-700 hover:text-primary-800 font-semibold">
              {isRTL ? 'عرض الكل' : 'View All'}
            </a>
          </div>
          {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">{isRTL ? 'الطلب' : 'Order'}</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">{isRTL ? 'العميل' : 'Customer'}</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">{isRTL ? 'المتجر' : 'Shop'}</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-slate-400 font-medium">{isRTL ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                    <td className="py-2.5 px-2 font-medium">{order.id}</td>
                    <td className="py-2.5 px-2">{order.customerName || order.customer}</td>
                    <td className="py-2.5 px-2">{order.shopName || order.shop}</td>
                    <td className="py-2.5 px-2">
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'PENDING' ? 'warning' : order.status === 'ON_WAY_TO_CUSTOMER' ? 'info' : 'info'} size="sm">
                        {isRTL ? ({ DELIVERED: 'تم التسليم', ON_WAY_TO_CUSTOMER: 'في الطريق', PENDING: 'قيد الانتظار', CONFIRMED: 'تم التأكيد' } as Record<string, string>)[order.status] || order.status : order.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 font-semibold">{order.amount || order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="py-8 text-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا توجد طلبات حديثة' : 'No recent orders'}</div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">
              {isRTL ? 'آخر المسجلين' : 'Recent Registrations'}
            </h3>
            {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user.date || user.createdAt}</p>
                  </div>
                  <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING_VERIFICATION' ? 'warning' : 'error'} size="sm">
                    {isRTL ? ({ ACTIVE: 'نشط', PENDING_VERIFICATION: 'قيد التحقق', SUSPENDED: 'موقوف' } as Record<string, string>)[user.status] || user.status : user.status}
                  </Badge>
                </div>
              ))}
            </div>
            ) : (
              <div className="py-4 text-center text-gray-400 dark:text-slate-500">{isRTL ? 'لا يوجد مسجلين جدد' : 'No recent registrations'}</div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-green-600" />
              {isRTL ? 'حالة النظام' : 'System Health'}
            </h3>
            <div className="space-y-3">
              {[
                { label: isRTL ? 'حالة الخادم' : 'Server Status', value: isRTL ? 'نشط' : 'Active', status: 'success' as const },
                { label: isRTL ? 'وقت التشغيل' : 'Uptime', value: '99.98%', status: 'success' as const },
                { label: isRTL ? 'حمل المعالج' : 'CPU Load', value: '23%', status: 'success' as const },
                { label: isRTL ? 'استخدام الذاكرة' : 'Memory Usage', value: '1.2/4 GB', status: 'warning' as const },
                { label: isRTL ? 'مساحة التخزين' : 'Storage', value: '45/100 GB', status: 'success' as const },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{item.value}</span>
                    <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

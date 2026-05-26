'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/shared/StatsCard';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { ShoppingBag, Clock, Heart, Ruler, RefreshCw, Package, Plus, Store, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardPage() {
  const { isRTL } = useAppStore();
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{isRTL ? 'مرحباً بك في مفصل 👋' : 'Welcome to Mufasal 👋'}</h2>
          <p className="text-primary-200 text-sm">{isRTL ? 'اطلب تفصيل ملابسك من أفضل الخياطين' : 'Get your clothes tailored by the best tailors'}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => router.push('/dashboard/customer/orders/new')}>
              {isRTL ? 'طلب جديد' : 'New Order'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/shops')}>
              {isRTL ? 'تصفح المتاجر' : 'Browse Shops'}
            </Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2">
          <a href="/shops" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
            <Store size={15} />
            <span>{isRTL ? 'المتاجر' : 'Shops'}</span>
            {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </a>
          <a href="/marketplace" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm font-medium transition-all">
            <Package size={15} />
            <span>{isRTL ? 'سوق الأقمشة' : 'Marketplace'}</span>
            {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<ShoppingBag size={22} />} label={isRTL ? 'الطلبات النشطة' : 'Active Orders'} value="3" color="primary" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'الطلبات السابقة' : 'Past Orders'} value="24" color="info" />
        <StatsCard icon={<Heart size={22} />} label={isRTL ? 'المتاجر المفضلة' : 'Favorite Shops'} value="8" color="danger" />
        <StatsCard icon={<Ruler size={22} />} label={isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'} value="2" color="gold" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الطلبات النشطة' : 'Active Orders'}</h3>
          <a href="/dashboard/customer/orders" className="text-sm text-primary-700 font-semibold">{isRTL ? 'عرض الكل' : 'View All'}</a>
        </div>
        {[
          { id: '#ORD-1284', shop: 'خياطة الرجال', status: 'SEWING_ASSEMBLY', amount: 1200, date: '2024-03-15', nextStep: isRTL ? 'الكوي والتشطيب' : 'Ironing & Finishing' },
          { id: '#ORD-1282', shop: 'خياطة الرجال', status: 'TAKING_MEASUREMENTS', amount: 2300, date: '2024-03-14', nextStep: isRTL ? 'قص القماش' : 'Cutting Fabric' },
          { id: '#ORD-1280', shop: 'متجر الأقمشة', status: 'ON_WAY_TO_CUSTOMER', amount: 540, date: '2024-03-13', nextStep: isRTL ? 'توصيل' : 'Delivery' },
        ].map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{order.shop}</p>
                <Badge variant={order.status === 'ON_WAY_TO_CUSTOMER' ? 'info' : 'gold'} size="sm">{isRTL ? ({ SEWING_ASSEMBLY: 'خياطة', TAKING_MEASUREMENTS: 'مقاسات', ON_WAY_TO_CUSTOMER: 'توصيل' } as Record<string, string>)[order.status] || order.status : order.status}</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{order.id} - {isRTL ? 'الخطوة القادمة:' : 'Next:'} {order.nextStep}</p>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
              <a href={`/dashboard/customer/orders/${order.id}`} className="text-xs text-primary-700">{isRTL ? 'تتبع' : 'Track'}</a>
            </div>
          </div>
        ))}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">{isRTL ? 'إعادة طلب سريع' : 'Quick Re-order'}</h3>
          <div className="space-y-3">
            {[
              { shop: 'خياطة الرجال', item: 'بدلة رسمية', lastOrder: '2024-02-20' },
              { shop: 'متجر الأقمشة', item: 'قماش صوف', lastOrder: '2024-01-15' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div><p className="text-sm font-semibold dark:text-slate-200">{item.shop}</p><p className="text-xs text-gray-500 dark:text-slate-400">{item.item}</p></div>
                <Button size="sm" variant="outline" icon={<RefreshCw size={14} />}>{isRTL ? 'إعادة' : 'Repeat'}</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">{isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'}</h3>
          <div className="space-y-3">
            {[
              { name: 'المقاسات الشخصية', type: isRTL ? 'رجالي' : 'Men', updated: '2024-03-01' },
              { name: 'مقاسات الأطفال', type: isRTL ? 'أطفال' : 'Kids', updated: '2024-02-15' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div><p className="text-sm font-semibold dark:text-slate-200">{m.name}</p><p className="text-xs text-gray-500 dark:text-slate-400">{m.type} - {isRTL ? 'آخر تحديث' : 'Updated'}: {m.updated}</p></div>
                <Badge variant="success" size="sm">{isRTL ? 'محفوظ' : 'Saved'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

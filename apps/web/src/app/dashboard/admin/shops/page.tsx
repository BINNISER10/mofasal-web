'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { Store, Search, CheckCircle, XCircle, Star, MapPin, Percent, DollarSign } from 'lucide-react';
import { shopsApi } from '@/lib/api/shops';

export default function AdminShopsPage() {
  const { isRTL } = useAppStore();
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        const res = await shopsApi.list(params);
        setShops(res.shops);
      } catch (err) {
        console.error('Failed to fetch shops', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة المتاجر' : 'Shop Management'}</h2>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', statusFilter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600')}>
              {isRTL ? { ALL: 'الكل', ACTIVE: 'نشط', PENDING_VERIFICATION: 'قيد التحقق', SUSPENDED: 'موقوف' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : (
      <div className="grid gap-4">
        {shops.map((shop) => (
          <Card key={shop.id} hover onClick={() => setSelectedShop(shop)} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center"><Store size={28} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100">{shop.name || shop.nameAr}</h3>
                    {shop.isVerified && <Badge variant="success" size="sm">موثق</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{shop.ownerName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={12} />{shop.city}</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-gold-500" />{shop.rating || '-'}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} />{formatCurrency(shop.orderCount || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <Badge variant={shop.status === 'ACTIVE' || shop.isActive ? 'success' : shop.status === 'SUSPENDED' ? 'error' : 'warning'}>{isRTL ? ({ ACTIVE: 'نشط', PENDING_VERIFICATION: 'قيد التحقق', SUSPENDED: 'موقوف' } as Record<string, string>)[shop.status] || shop.status : shop.status}</Badge>
                <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">{shop.orderCount || 0} {isRTL ? 'طلب' : 'orders'}</div>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <Percent size={14} className="text-primary-600" />
                  <span className="font-semibold">{shop.commission || 0}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {shops.length === 0 && (
          <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد متاجر' : 'No shops found'}</Card>
        )}
      </div>
      )}

      <Modal isOpen={!!selectedShop} onClose={() => setSelectedShop(null)} title={isRTL ? 'تفاصيل المتجر' : 'Shop Details'} size="lg"
        footer={
          <div className="flex gap-2">
            {selectedShop?.status === 'PENDING_VERIFICATION' && <Button variant="success"><CheckCircle size={16} /> {isRTL ? 'تحقق' : 'Verify'}</Button>}
            {selectedShop?.status === 'ACTIVE' && <Button variant="danger"><XCircle size={16} /> {isRTL ? 'إيقاف' : 'Suspend'}</Button>}
            {selectedShop?.status === 'SUSPENDED' && <Button variant="success"><CheckCircle size={16} /> {isRTL ? 'إعادة تفعيل' : 'Reactivate'}</Button>}
          </div>
        }
      >
        {selectedShop && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'اسم المتجر' : 'Shop Name'}</p><p className="font-semibold dark:text-slate-200">{selectedShop.name || selectedShop.nameAr}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'المالك' : 'Owner'}</p><p className="font-semibold dark:text-slate-200">{selectedShop.ownerName}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'المدينة' : 'City'}</p><p className="font-semibold dark:text-slate-200">{selectedShop.city}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'التقييم' : 'Rating'}</p><p className="font-semibold text-gold-600">{selectedShop.rating || '-'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'الطلبات' : 'Orders'}</p><p className="font-semibold dark:text-slate-200">{selectedShop.orderCount || 0}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'الإيرادات' : 'Revenue'}</p><p className="font-semibold text-primary-700">{formatCurrency(selectedShop.orderCount ? selectedShop.orderCount * 100 : 0)}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

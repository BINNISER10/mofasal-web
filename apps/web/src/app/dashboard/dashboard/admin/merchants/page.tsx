'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { Package, Search, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api/admin';

export default function AdminMerchantsPage() {
  const { isRTL } = useAppStore();
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [merchants, setMerchants] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getUsers({ role: 'MERCHANT' });
        setMerchants(res.users);
      } catch (err) {
        console.error('Failed to fetch merchants', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة التجار' : 'Merchant Management'}</h2>
      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : (
      <div className="grid gap-4">
        {merchants.map((m) => (
          <Card key={m.id} hover onClick={() => setSelected(m)} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center"><Package size={28} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100">{m.name}</h3>
                    {m.status === 'ACTIVE' && <Badge variant="success" size="sm">{isRTL ? 'موثق' : 'Verified'}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{m.email} - {m.phone}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-slate-400">
                    <span>{m.ordersCount || 0} {isRTL ? 'مبيعات' : 'sales'}</span>
                  </div>
                </div>
              </div>
              <Badge variant={m.status === 'ACTIVE' ? 'success' : m.status === 'PENDING_VERIFICATION' ? 'warning' : 'error'}>{isRTL ? ({ ACTIVE: 'نشط', PENDING_VERIFICATION: 'قيد التحقق', SUSPENDED: 'موقوف', BANNED: 'محظور' } as Record<string, string>)[m.status] || m.status : m.status}</Badge>
            </div>
          </Card>
        ))}
        {merchants.length === 0 && (
          <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا يوجد تجار بعد' : 'No merchants yet'}</Card>
        )}
      </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={isRTL ? 'تفاصيل التاجر' : 'Merchant Details'}>
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'الاسم' : 'Name'}</p><p className="font-semibold dark:text-slate-200">{selected.name}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'الهاتف' : 'Phone'}</p><p className="font-semibold dark:text-slate-200">{selected.phone}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'البريد' : 'Email'}</p><p className="font-semibold dark:text-slate-200">{selected.email}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"><p className="text-gray-500 dark:text-slate-400 text-xs">{isRTL ? 'الحالة' : 'Status'}</p><Badge variant="success">{selected.status}</Badge></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import toast from 'react-hot-toast';
import { Home, Briefcase, MapPin, Plus, Edit3, Trash2, Star } from 'lucide-react';
import { usersApi, Address } from '@/lib/api/users';

export default function CustomerAddressesPage() {
  const { isRTL } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      try {
        const res = await usersApi.getAddresses(user.id);
        setAddresses(res.addresses);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'العناوين' : 'Addresses'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />}>{isRTL ? 'إضافة عنوان' : 'Add Address'}</Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : addresses.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد عناوين. أضف عنوانك الأول' : 'No addresses yet. Add your first address'}</Card>
      ) : (
      <div className="grid gap-4">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                  {addr.label === 'Work' || addr.label === 'العمل' ? <Briefcase size={20} /> : <Home size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">{addr.label}</h3>
                    {addr.isDefault && <Star size={14} className="text-gold-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{addr.street}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-500">{addr.district}, {addr.city}</p>
                  {addr.buildingNumber && <p className="text-sm text-gray-500 dark:text-slate-500">{isRTL ? 'مبنى' : 'Building'} {addr.buildingNumber}{addr.apartmentNumber ? `, ${isRTL ? 'شقة' : 'Apt'} ${addr.apartmentNumber}` : ''}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-primary-600"><Edit3 size={16} /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

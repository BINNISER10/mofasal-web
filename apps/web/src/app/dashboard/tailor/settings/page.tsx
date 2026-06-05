'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { shopsApi } from '@/lib/api/shops';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

export default function TailorSettingsPage() {
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    shopName: '',
    phone: '',
    email: '',
    description: '',
    city: '',
    district: '',
    address: '',
  });

  const [deliveryToggles, setDeliveryToggles] = useState({
    shop_vehicle: true,
    uber_direct: false,
    careen: true,
    smsa: false,
  });

  const [workingHours, setWorkingHours] = useState({
    sat: { open: '09:00', close: '21:00', isOpen: true },
    sun: { open: '09:00', close: '21:00', isOpen: true },
    mon: { open: '09:00', close: '21:00', isOpen: true },
    tue: { open: '09:00', close: '21:00', isOpen: true },
    wed: { open: '09:00', close: '21:00', isOpen: true },
    thu: { open: '09:00', close: '22:00', isOpen: true },
    fri: { open: '14:00', close: '22:00', isOpen: true },
  });

  useEffect(() => {
    if (!user?.shopId) {
      setLoading(false);
      return;
    }
    shopsApi.getById(user.shopId)
      .then((res) => {
        const shop = res.shop;
        setProfile({
          shopName: shop.nameAr || shop.name || '',
          phone: shop.phone || '',
          email: shop.email || '',
          description: shop.description || '',
          city: shop.city || '',
          district: shop.district || '',
          address: shop.address || '',
        });
      })
      .catch((err) => {
        console.error('Failed to fetch shop', err);
        toast.error(isRTL ? 'فشل تحميل إعدادات المتجر' : 'Failed to load shop settings');
      })
      .finally(() => setLoading(false));
  }, [user?.shopId, isRTL]);

  const handleSave = async () => {
    if (!user?.shopId) return;
    try {
      setSaving(true);
      await shopsApi.update(user.shopId, {
        name: profile.shopName,
        phone: profile.phone,
        city: profile.city,
        district: profile.district,
        address: profile.address,
      });
      toast.success(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
    } catch (err) {
      console.error('Failed to save settings', err);
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const dayNamesAr: Record<string, string> = { sat: 'السبت', sun: 'الأحد', mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' };

  if (loading) {
    return <LoadingSpinner fullScreen text={isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'} />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'إعدادات المتجر' : 'Shop Settings'}</h2>

      {/* Profile */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'الملف الشخصي' : 'Profile'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={isRTL ? 'اسم المتجر' : 'Shop Name'} value={profile.shopName} onChange={(e) => setProfile({...profile, shopName: e.target.value})} />
          <Input label={isRTL ? 'رقم الجوال' : 'Phone'} isPhone value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
          <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
          <Input label={isRTL ? 'المدينة' : 'City'} value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} />
          <Input label={isRTL ? 'الحي' : 'District'} value={profile.district} onChange={(e) => setProfile({...profile, district: e.target.value})} />
          <Input label={isRTL ? 'العنوان' : 'Address'} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-[#00373E] mb-1.5 block">{isRTL ? 'الوصف' : 'Description'}</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({...profile, description: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#D0D6D7]/30 bg-white text-[#00373E] placeholder-[#735B4D]/40 focus:outline-none focus:ring-2 focus:ring-[#00373E]/20 resize-none"
          />
        </div>
      </Card>

      {/* Delivery */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'خدمات التوصيل' : 'Delivery Services'}</h3>
        <div className="space-y-4">
          {Object.entries(deliveryToggles).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#00373E]">{key.replace('_', ' ').toUpperCase()}</p>
              </div>
              <Toggle checked={value} onChange={(v) => setDeliveryToggles({...deliveryToggles, [key]: v})} />
            </div>
          ))}
        </div>
      </Card>

      {/* Working Hours */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4">{isRTL ? 'ساعات العمل' : 'Working Hours'}</h3>
        <div className="space-y-3">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-20 text-sm font-semibold text-[#00373E]">{dayNamesAr[day]}</span>
              <Toggle checked={hours.isOpen} onChange={(v) => setWorkingHours({...workingHours, [day]: {...hours, isOpen: v}})} />
              {hours.isOpen && (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={hours.open} onChange={(e) => setWorkingHours({...workingHours, [day]: {...hours, open: e.target.value}})} className="px-2 py-1.5 rounded-lg border border-[#D0D6D7]/30 text-sm text-[#00373E] focus:outline-none focus:ring-2 focus:ring-[#00373E]/20" />
                  <span className="text-xs text-[#735B4D]/60">{isRTL ? 'إلى' : 'to'}</span>
                  <input type="time" value={hours.close} onChange={(e) => setWorkingHours({...workingHours, [day]: {...hours, close: e.target.value}})} className="px-2 py-1.5 rounded-lg border border-[#D0D6D7]/30 text-sm text-[#00373E] focus:outline-none focus:ring-2 focus:ring-[#00373E]/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save */}
      <Button variant="primary" size="lg" isLoading={saving} onClick={handleSave} icon={<Save size={18} />}>
        {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
      </Button>
    </div>
  );
}

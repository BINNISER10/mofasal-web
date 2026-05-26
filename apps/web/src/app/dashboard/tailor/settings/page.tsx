'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';

export default function TailorSettingsPage() {
  const { isRTL } = useAppStore();
  const [profile, setProfile] = useState({
    shopName: 'خياطة الرجال',
    phone: '0551234567',
    email: 'info@khayat-al-rijal.com',
    description: 'متخصصون في الخياطة الرجالية الراقية والبدل الرسمية والمشالح',
    city: 'الرياض',
    district: 'الورود',
    address: 'شارع الملك فهد، مبنى 24',
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

  const dayNamesAr: Record<string, string> = { sat: 'السبت', sun: 'الأحد', mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إعدادات المتجر' : 'Shop Settings'}</h2>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'الملف الشخصي' : 'Profile'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={isRTL ? 'اسم المتجر' : 'Shop Name'} value={profile.shopName} onChange={(e) => setProfile({...profile, shopName: e.target.value})} />
          <Input label={isRTL ? 'رقم الجوال' : 'Phone'} isPhone value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
          <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
          <Input label={isRTL ? 'المدينة' : 'City'} value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} />
          <Input label={isRTL ? 'الحي' : 'District'} value={profile.district} onChange={(e) => setProfile({...profile, district: e.target.value})} />
          <Input label={isRTL ? 'العنوان' : 'Address'} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} />
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">{isRTL ? 'الوصف' : 'Description'}</label>
            <textarea className="input-field" rows={3} value={profile.description} onChange={(e) => setProfile({...profile, description: e.target.value})} />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'أوقات العمل' : 'Working Hours'}</h3>
        <div className="space-y-3">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <Toggle checked={hours.isOpen} onChange={(v) => setWorkingHours({...workingHours, [day]: {...hours, isOpen: v}})} id={`day-${day}`} />
              <span className="w-20 font-semibold text-sm dark:text-slate-300">{isRTL ? dayNamesAr[day] : day.charAt(0).toUpperCase() + day.slice(1)}</span>
              {hours.isOpen && (
                <div className="flex items-center gap-2">
                  <input type="time" value={hours.open} onChange={(e) => setWorkingHours({...workingHours, [day]: {...hours, open: e.target.value}})} className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm" />
                  <span className="text-gray-400 dark:text-slate-500">-</span>
                  <input type="time" value={hours.close} onChange={(e) => setWorkingHours({...workingHours, [day]: {...hours, close: e.target.value}})} className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm" />
                </div>
              )}
              {!hours.isOpen && <span className="text-sm text-red-500 font-medium">{isRTL ? 'مغلق' : 'Closed'}</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'طرق التوصيل' : 'Delivery Options'}</h3>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          <Toggle label="مركبة المتجر" description={isRTL ? 'التوصيل بواسطة مركبات المتجر' : 'Delivery using shop vehicles'} checked={deliveryToggles.shop_vehicle} onChange={(v) => setDeliveryToggles({...deliveryToggles, shop_vehicle: v})} />
          <Toggle label="Uber Direct" description={isRTL ? 'التوصيل عبر أوبر' : 'Delivery via Uber'} checked={deliveryToggles.uber_direct} onChange={(v) => setDeliveryToggles({...deliveryToggles, uber_direct: v})} />
          <Toggle label="كارين" description={isRTL ? 'التوصيل عبر تطبيق كارين' : 'Delivery via Careen'} checked={deliveryToggles.careen} onChange={(v) => setDeliveryToggles({...deliveryToggles, careen: v})} />
          <Toggle label="SMSA" description={isRTL ? 'التوصيل عبر SMSA السريع' : 'Delivery via SMSA Express'} checked={deliveryToggles.smsa} onChange={(v) => setDeliveryToggles({...deliveryToggles, smsa: v})} />
        </div>
      </Card>

      <Button variant="primary" size="lg" onClick={() => toast.success(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved')}>
        {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
      </Button>
    </div>
  );
}

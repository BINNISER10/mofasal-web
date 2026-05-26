'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useAppStore } from '@/lib/stores/appStore';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { User, Bell, Globe, Shield } from 'lucide-react';

export default function CustomerProfilePage() {
  const { isRTL, language, setLanguage } = useAppStore();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    reminders: true,
  });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">{isRTL ? 'الملف الشخصي' : 'Profile'}</h2>

      <Card className="p-5 text-center">
        <Avatar name="أحمد محمد" size="xl" className="mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">أحمد محمد</h3>
        <p className="text-sm text-gray-500" dir="ltr">+966 55 123 4567</p>
        <p className="text-sm text-gray-500">ahmed@email.com</p>
        <Button variant="outline" size="sm" className="mt-3">{isRTL ? 'تغيير الصورة' : 'Change Photo'}</Button>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={18} className="text-primary-600" />{isRTL ? 'المعلومات الشخصية' : 'Personal Info'}</h3>
        <div className="space-y-4">
          <Input label={isRTL ? 'الاسم' : 'Name'} defaultValue="أحمد محمد" />
          <Input label="Email" type="email" defaultValue="ahmed@email.com" />
          <Input label={isRTL ? 'رقم الجوال' : 'Phone'} isPhone defaultValue="551234567" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Bell size={18} className="text-primary-600" />{isRTL ? 'الإشعارات' : 'Notifications'}</h3>
        <div className="divide-y divide-gray-100">
          <Toggle label={isRTL ? 'تحديثات الطلبات' : 'Order Updates'} description={isRTL ? 'إشعارات عند تحديث حالة الطلب' : 'Notifications when order status changes'} checked={notifications.orderUpdates} onChange={(v) => setNotifications({...notifications, orderUpdates: v})} />
          <Toggle label={isRTL ? 'العروض والتخفيضات' : 'Promotions'} description={isRTL ? 'إشعارات العروض والتخفيضات' : 'Promotional offers and discounts'} checked={notifications.promotions} onChange={(v) => setNotifications({...notifications, promotions: v})} />
          <Toggle label={isRTL ? 'تذكير المواعيد' : 'Reminders'} description={isRTL ? 'تذكير بمواعيد أخذ المقاسات والتوصيل' : 'Measurement and delivery appointment reminders'} checked={notifications.reminders} onChange={(v) => setNotifications({...notifications, reminders: v})} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Globe size={18} className="text-primary-600" />{isRTL ? 'اللغة' : 'Language'}</h3>
        <div className="flex gap-3">
          <button onClick={() => setLanguage('ar')} className={`flex-1 p-3 rounded-xl border-2 text-center font-semibold transition-all ${language === 'ar' ? 'border-primary-700 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>العربية</button>
          <button onClick={() => setLanguage('en')} className={`flex-1 p-3 rounded-xl border-2 text-center font-semibold transition-all ${language === 'en' ? 'border-primary-700 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>English</button>
        </div>
      </Card>

      <Button variant="primary" size="lg" fullWidth onClick={() => toast.success(isRTL ? 'تم حفظ التغييرات' : 'Changes saved')}>
        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
      </Button>
    </div>
  );
}

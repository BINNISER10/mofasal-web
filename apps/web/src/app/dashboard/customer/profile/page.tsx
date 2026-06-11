'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { User, Bell, Globe, Shield, Save, Loader2 } from 'lucide-react';

export default function CustomerProfilePage() {
  const { isRTL, language, setLanguage } = useAppStore();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    reminders: true,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await authApi.updateProfile({ name, email });
      if (res.user) {
        updateUser(res.user);
      }
      toast.success(isRTL ? 'تم حفظ الملف الشخصي' : 'Profile saved');
    } catch (err) {
      console.error('Failed to save profile', err);
      toast.error(isRTL ? 'فشل حفظ الملف الشخصي' : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00373E]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'الملف الشخصي' : 'Profile'}</h2>

      {/* Avatar */}
      <Card className="p-5 text-center">
        <Avatar name={user.name} size="xl" className="mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#00373E]">{user.name}</h3>
        {user.phone && <p className="text-sm text-[#735B4D]/60" dir="ltr">{user.phone}</p>}
        {user.email && <p className="text-sm text-[#735B4D]/60">{user.email}</p>}
      </Card>

      {/* Personal Info */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2">
          <User size={18} className="text-[#D4AF37]" />
          {isRTL ? 'المعلومات الشخصية' : 'Personal Info'}
        </h3>
        <div className="space-y-4">
          <Input
            label={isRTL ? 'الاسم' : 'Name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={isRTL ? 'رقم الجوال' : 'Phone'}
            isPhone
            value={user.phone?.replace('+966', '') || ''}
            disabled
          />
        </div>
        <Button
          variant="primary"
          className="mt-4"
          isLoading={saving}
          onClick={handleSave}
          icon={<Save size={16} />}
        >
          {isRTL ? 'حفظ' : 'Save'}
        </Button>
      </Card>

      {/* Notifications */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2">
          <Bell size={18} className="text-[#D4AF37]" />
          {isRTL ? 'الإشعارات' : 'Notifications'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#00373E]">{isRTL ? 'تحديثات الطلبات' : 'Order Updates'}</p>
              <p className="text-xs text-[#735B4D]/60">{isRTL ? 'إشعارات حالة الطلب' : 'Order status notifications'}</p>
            </div>
            <Toggle checked={notifications.orderUpdates} onChange={(v) => setNotifications({ ...notifications, orderUpdates: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#00373E]">{isRTL ? 'العروض' : 'Promotions'}</p>
              <p className="text-xs text-[#735B4D]/60">{isRTL ? 'خصومات وعروض خاصة' : 'Discounts and special offers'}</p>
            </div>
            <Toggle checked={notifications.promotions} onChange={(v) => setNotifications({ ...notifications, promotions: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#00373E]">{isRTL ? 'التذكيرات' : 'Reminders'}</p>
              <p className="text-xs text-[#735B4D]/60">{isRTL ? 'تذكيرات المواعيد' : 'Appointment reminders'}</p>
            </div>
            <Toggle checked={notifications.reminders} onChange={(v) => setNotifications({ ...notifications, reminders: v })} />
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-5">
        <h3 className="font-bold text-[#00373E] mb-4 flex items-center gap-2">
          <Globe size={18} className="text-[#D4AF37]" />
          {isRTL ? 'اللغة' : 'Language'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('ar')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              language === 'ar' ? 'bg-[#00373E] text-white' : 'bg-[#F2E8D4]/30 text-[#00373E] hover:bg-[#F2E8D4]/50'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              language === 'en' ? 'bg-[#00373E] text-white' : 'bg-[#F2E8D4]/30 text-[#00373E] hover:bg-[#F2E8D4]/50'
            }`}
          >
            English
          </button>
        </div>
      </Card>
    </div>
  );
}

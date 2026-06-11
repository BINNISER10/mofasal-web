'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAppStore } from '@/lib/stores/appStore';
import { Avatar } from '@/components/ui/Avatar';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { isRTL } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone?.replace('+966', ''));
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required'); return; }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ name: name.trim(), email: email.trim(), phone: `+966${phone.replace(/\D/g, '')}` });
      setUser(updated);
      toast.success(isRTL ? 'تم حفظ التغييرات' : 'Changes saved');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الحفظ' : 'Failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الملف الشخصي' : 'Profile'}</h2>

      <Card className="p-5 text-center">
        <Avatar name={user?.name || 'User'} size="xl" className="mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{user?.name}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{user?.role}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400" dir="ltr">{user?.phone}</p>
        {user?.email && <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>}
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'المعلومات الشخصية' : 'Personal Info'}</h3>
        <div className="space-y-4">
          <Input label={isRTL ? 'الاسم' : 'Name'} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label={isRTL ? 'رقم الجوال' : 'Phone'} isPhone value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Card>

      <Button variant="primary" size="lg" fullWidth isLoading={saving} disabled={saving} onClick={handleSave}>
        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
      </Button>
    </div>
  );
}

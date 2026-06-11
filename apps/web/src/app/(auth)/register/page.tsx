'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { authApi } from '@/lib/api/auth';
import { Scissors, Store, Package, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

type RoleTab = 'customer' | 'tailor' | 'merchant';

const roleTabs = [
  { key: 'customer' as RoleTab, labelAr: 'عميل', labelEn: 'Customer', icon: <User size={18} /> },
  { key: 'tailor' as RoleTab, labelAr: 'محل خياطة', labelEn: 'Tailor Shop', icon: <Scissors size={18} /> },
  { key: 'merchant' as RoleTab, labelAr: 'تاجر أقمشة', labelEn: 'Fabric Merchant', icon: <Store size={18} /> },
];

export default function RegisterPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const { setUser, setToken } = useAuthStore();
  const [role, setRole] = useState<RoleTab>('customer');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    commercialRegister: '',
    city: 'Riyadh',
  });

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: form.name,
        phone: `966${form.phone}`,
        email: form.email || undefined,
        password: form.password,
        role,
        shopName: role !== 'customer' ? form.shopName : undefined,
        commercialRegister: role !== 'customer' ? form.commercialRegister : undefined,
      });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success(isRTL ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
      const roleRoutes: Record<string, string> = {
        admin: '/dashboard/admin',
        tailor: '/dashboard/tailor',
        merchant: '/dashboard/merchant',
        customer: '/dashboard/customer',
      };
      router.push(roleRoutes[response.user.role] || '/dashboard');
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-hero" />
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {isRTL ? 'انضم إلى منصة مفصل' : 'Join MUFASAL platform'}
          </p>
        </div>

        <Card className="p-6">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setRole(tab.key); setStep(1); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  role === tab.key
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.icon}
                <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <Input
                  label={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder={isRTL ? 'الاسم كما في الهوية' : 'Name as on ID'}
                  required
                />
                <Input
                  label={isRTL ? 'رقم الجوال' : 'Phone Number'}
                  type="tel"
                  isPhone
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="5XXXXXXXX"
                  required
                />
                <Input
                  label={isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="email@example.com"
                />
                <Input
                  label={isRTL ? 'كلمة المرور' : 'Password'}
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="••••••••"
                  showPasswordToggle
                  required
                />
                <Input
                  label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  showPasswordToggle
                  required
                  error={
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? (isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match')
                      : undefined
                  }
                />
              </>
            ) : (
              <>
                {role !== 'customer' && (
                  <>
                    <Input
                      label={isRTL ? 'اسم المتجر / المحل' : 'Shop / Store Name'}
                      value={form.shopName}
                      onChange={(e) => updateForm('shopName', e.target.value)}
                      placeholder={isRTL ? 'اسم المتجر التجاري' : 'Business name'}
                      required
                    />
                    <Input
                      label={isRTL ? 'السجل التجاري' : 'Commercial Register'}
                      value={form.commercialRegister}
                      onChange={(e) => updateForm('commercialRegister', e.target.value)}
                      placeholder="XXXXXXXXXX"
                      required
                    />
                  </>
                )}
                <div className="p-4 bg-primary-50 rounded-xl text-sm text-primary-800">
                  <p className="font-semibold mb-1">
                    {isRTL ? 'بإنشاء الحساب أنت توافق على:' : 'By creating an account you agree to:'}
                  </p>
                  <ul className="list-disc list-inside text-primary-700 space-y-1">
                    <li>{isRTL ? 'شروط الاستخدام' : 'Terms of Service'}</li>
                    <li>{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  {isRTL ? 'رجوع' : 'Back'}
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {step === 1
                  ? (isRTL ? 'التالي' : 'Next')
                  : (isRTL ? 'إنشاء حساب' : 'Create Account')}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
            </span>{' '}
            <a href="/login" className="text-primary-700 hover:text-primary-800 font-semibold">
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

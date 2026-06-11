'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { authApi } from '@/lib/api/auth';
import { Eye, EyeOff, Phone, Lock, AlertCircle, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const { setUser, setToken } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const DEMO_USERS = [
    { role: 'admin' as const, label: isRTL ? 'مدير' : 'Admin', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', route: '/dashboard/admin' },
    { role: 'tailor' as const, label: isRTL ? 'خياط' : 'Tailor', color: 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100', route: '/dashboard/tailor' },
    { role: 'merchant' as const, label: isRTL ? 'تاجر' : 'Merchant', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', route: '/dashboard/merchant' },
    { role: 'customer' as const, label: isRTL ? 'عميل' : 'Customer', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', route: '/dashboard/customer' },
  ];

  const handleDemoLogin = async (demo: typeof DEMO_USERS[0]) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ phone: '966500000000', password: 'admin123' });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success(isRTL ? `دخول تجريبي: ${demo.label}` : `Demo login: ${demo.label}`);
      const roleRoutes: Record<string, string> = {
        admin: '/dashboard/admin', tailor: '/dashboard/tailor',
        merchant: '/dashboard/merchant', customer: '/dashboard/customer',
      };
      router.push(roleRoutes[response.user.role] || '/dashboard');
    } catch {
      toast.error(isRTL ? 'تعذر الاتصال بالخادم - تأكد من تشغيل API' : 'Cannot connect to API - make sure API is running');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authApi.login({ phone: `966${phone}`, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      const roleRoutes: Record<string, string> = {
        admin: '/dashboard/admin',
        tailor: '/dashboard/tailor',
        merchant: '/dashboard/merchant',
        customer: '/dashboard/customer',
      };
      router.push(roleRoutes[response.user.role] || '/dashboard');
    } catch (err: any) {
      setError(err.message || (isRTL ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-hero" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {isRTL ? 'تسجيل الدخول' : 'Login'}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {isRTL ? 'مرحباً بعودتك إلى مفصل' : 'Welcome back to MUFASAL'}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Input
              label={isRTL ? 'رقم الجوال' : 'Phone Number'}
              type="tel"
              isPhone
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="5XXXXXXXX"
              icon={<Phone size={18} />}
              required
            />

            <Input
              label={isRTL ? 'كلمة المرور' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              showPasswordToggle
              required
            />

            <div className="flex justify-between items-center text-sm">
              <a href="/forgot-password" className="text-primary-700 hover:text-primary-800 font-medium">
                {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}
            </span>{' '}
            <a href="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
              {isRTL ? 'سجل الآن' : 'Register'}
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3 font-semibold">
              {isRTL ? '⚡ دخول تجريبي سريع' : '⚡ Quick Demo Login'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoLogin(demo)}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-colors ${demo.color}`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

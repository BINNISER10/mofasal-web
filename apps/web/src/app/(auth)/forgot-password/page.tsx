'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { Scissors, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { isRTL } = useAppStore();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(isRTL ? 'تم إرسال رمز التحقق' : 'Verification code sent');
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'فشل الإرسال' : 'Failed to send'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success(isRTL ? 'تم إعادة تعيين كلمة المرور بنجاح' : 'Password reset successful');
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || (isRTL ? 'فشل إعادة التعيين' : 'Reset failed'));
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
            {isRTL ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {isRTL ? 'سنرسل لك رمز التحقق' : 'We will send you a verification code'}
          </p>
        </div>

        <Card className="p-6">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
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
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {isRTL ? 'إرسال رمز التحقق' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  {isRTL ? 'تم إرسال الرمز إلى رقم' : 'Code sent to'}{' '}
                  <span className="font-semibold" dir="ltr">+966 {phone}</span>
                </p>
              </div>
              <Input
                label={isRTL ? 'رمز التحقق' : 'Verification Code'}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="XXXXXX"
                required
              />
              <Input
                label={isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                showPasswordToggle
                required
              />
              <Input
                label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                showPasswordToggle
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isRTL ? 'تم إعادة التعيين بنجاح' : 'Reset Successful'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {isRTL ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة' : 'You can now login with your new password'}
              </p>
              <a href="/login">
                <Button variant="primary" size="lg" fullWidth>
                  {isRTL ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </a>
            </div>
          )}

          <div className="mt-4 text-center">
            <a href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700">
              <ArrowLeft size={14} />
              {isRTL ? 'العودة لتسجيل الدخول' : 'Back to login'}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

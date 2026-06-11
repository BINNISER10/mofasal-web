'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores/appStore';
import { Button } from '@/components/ui/Button';
import { Scissors, Home, ArrowRight, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />

      <div className="relative text-center max-w-lg mx-auto">
        {/* Decorative Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 rounded-full bg-primary-50 flex items-center justify-center mx-auto">
            <Scissors size={56} className="text-primary-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center border-4 border-white">
            <span className="text-xl font-black text-gold-600">!</span>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black text-primary-700 leading-none mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          {isRTL
            ? 'عذراً، الصفحة التي تبحث عنها لم تعد موجودة أو تم نقلها إلى مكان آخر.'
            : "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Home size={16} />
            {isRTL ? 'الرئيسية' : 'Home'}
          </button>
          <button
            onClick={() => router.push('/shops')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <Scissors size={16} />
            {isRTL ? 'تصفح الخياطين' : 'Browse Tailors'}
          </button>
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <Search size={16} />
            {isRTL ? 'السوق' : 'Marketplace'}
          </button>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium mx-auto transition-colors"
        >
          <ArrowIcon size={16} />
          {isRTL ? 'العودة للصفحة السابقة' : 'Go back'}
        </button>
      </div>
    </div>
  );
}

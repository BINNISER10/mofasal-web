'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { console.error('[Auth Error]', error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5"><AlertTriangle size={30} className="text-red-500" /></div>
        <h2 className="text-xl font-black text-gray-900 mb-2">خطأ في صفحة الدخول</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">حدث خطأ أثناء تحميل صفحة تسجيل الدخول. يرجى المحاولة مرة أخرى.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"><RefreshCw size={16} />إعادة المحاولة</button>
          <button onClick={() => router.push('/')} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"><LogIn size={16} />الرئيسية</button>
        </div>
      </div>
    </div>
  );
}

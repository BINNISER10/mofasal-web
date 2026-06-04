'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, User } from 'lucide-react';

export default function CustomerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { console.error('[Customer Error]', error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5"><AlertTriangle size={30} className="text-red-500" /></div>
        <h2 className="text-xl font-black text-gray-900 mb-2">خطأ في حساب العميل</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">تعذر تحميل صفحة العميل. قد يكون هناك خلل مؤقت.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"><RefreshCw size={16} />إعادة المحاولة</button>
          <button onClick={() => router.push('/dashboard/customer')} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"><User size={16} />العميل</button>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[MUFASAL Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          نعتذر، حدث خطأ ما. يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 dark:text-slate-600 font-mono mb-6 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
            معرف الخطأ: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={16} />
            حاول مجدداً
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Home size={16} />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

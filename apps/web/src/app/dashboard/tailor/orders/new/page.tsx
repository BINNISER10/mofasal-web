'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores/appStore';
import { Loader2 } from 'lucide-react';

/** الطلبات الجديدة تصل من العملاء — إعادة توجيه للوحة الطلبات */
export default function TailorNewOrderPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();

  useEffect(() => {
    router.replace('/dashboard/tailor/orders');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-neutral-500">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">
        {isRTL ? 'جاري فتح لوحة الطلبات…' : 'Opening orders board…'}
      </p>
    </div>
  );
}

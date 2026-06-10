'use client';

import Link from 'next/link';
import { Scissors } from 'lucide-react';
import { BRAND_COLORS } from '@mufasal/shared';

interface HomeCtaProps {
  isRTL: boolean;
}

export function HomeCta({ isRTL }: HomeCtaProps) {
  return (
    <section
      className="py-16 md:py-20"
      style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%)` }}
    >
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          {isRTL ? 'ابدأ تفصيل ثوبك اليوم' : 'Start Your Thobe Today'}
        </h2>
        <p className="text-white/70 mb-8 text-lg">
          {isRTL
            ? 'خياطة راقية وأقمشة فاخرة — في منصة واحدة.'
            : 'Premium tailoring and fine fabrics — in one platform.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shops"
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-all hover:brightness-110 shadow-lg"
            style={{ backgroundColor: BRAND_COLORS.gold, color: '#1a1200' }}
          >
            <Scissors size={18} />
            {isRTL ? 'تفصيل ثوب' : 'Custom Thobe'}
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all"
          >
            {isRTL ? 'تسوق الأقمشة' : 'Shop Fabrics'}
          </Link>
        </div>
      </div>
    </section>
  );
}

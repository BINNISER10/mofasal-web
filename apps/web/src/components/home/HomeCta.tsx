'use client';

import Link from 'next/link';

interface HomeCtaProps {
  isRTL: boolean;
}

export function HomeCta({ isRTL }: HomeCtaProps) {
  return (
    <section className="py-16 md:py-24 bg-[#0A0A0A] dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
          {isRTL ? 'ابدأ تفصيل ثوبك' : 'Start Your Thobe'}
        </h2>
        <p className="text-neutral-400 mb-8 text-sm md:text-base">
          {isRTL ? 'ثلاث خطوات — تتبع كامل — للرجال والأطفال' : 'Three steps — full tracking — men & boys'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shops"
            className="inline-flex min-h-[48px] items-center px-8 text-sm font-medium bg-white text-[#0A0A0A] rounded-full hover:bg-neutral-100 transition-colors"
          >
            {isRTL ? 'تفصيل ثوب' : 'Custom Thobe'}
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex min-h-[48px] items-center px-8 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
          >
            {isRTL ? 'تسوق الأقمشة' : 'Shop Fabrics'}
          </Link>
        </div>
      </div>
    </section>
  );
}

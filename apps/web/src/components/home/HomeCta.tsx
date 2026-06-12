'use client';

import Link from 'next/link';
import { ChevronRight, Clock, Scissors } from 'lucide-react';
import siteConfig from '@/data/site-config.json';

interface HomeCtaProps {
  isRTL: boolean;
}

export function HomeCta({ isRTL }: HomeCtaProps) {
  const { cta } = siteConfig;

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:via-primary-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm mb-4">
          <Clock size={14} />
          <span>{isRTL ? cta.badgeAr : cta.badgeEn}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          {isRTL ? cta.titleAr : cta.titleEn}
        </h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">
          {isRTL ? cta.subtitleAr : cta.subtitleEn}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={cta.btnHref || '/login'}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Scissors size={18} />
            {isRTL ? cta.btnAr : cta.btnEn}
            {isRTL ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
          </Link>
          <Link
            href={cta.secondaryHref || '/shops'}
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
          >
            {isRTL ? cta.secondaryAr : cta.secondaryEn}
          </Link>
        </div>
      </div>
    </section>
  );
}

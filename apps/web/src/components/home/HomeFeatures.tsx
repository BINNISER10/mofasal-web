'use client';

import type { LucideIcon } from 'lucide-react';
import { Ruler, Smartphone, Truck, Store } from 'lucide-react';
import siteConfig from '@/data/site-config.json';

interface HomeFeaturesProps {
  isRTL: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  Ruler,
  Smartphone,
  Truck,
  Store,
};

export function HomeFeatures({ isRTL }: HomeFeaturesProps) {
  const { features } = siteConfig;

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] border-y border-[#E8E8E8] dark:border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-xl">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
            {isRTL ? 'لماذا مفصل' : 'Why MUFASAL'}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight mb-2">
            {isRTL ? features.titleAr : features.titleEn}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {isRTL ? features.subtitleAr : features.subtitleEn}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {features.items.map((item, i) => {
            const Icon = ICONS[item.icon] || Store;
            return (
              <div key={i}>
                <div className="w-10 h-10 rounded-full border border-[#E8E8E8] dark:border-white/15 flex items-center justify-center mb-4 text-[#00373E] dark:text-white">
                  <Icon size={18} />
                </div>
                <h3 className="font-medium text-[#0A0A0A] dark:text-white mb-2">
                  {isRTL ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {isRTL ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

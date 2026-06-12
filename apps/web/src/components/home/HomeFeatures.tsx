'use client';

import type { LucideIcon } from 'lucide-react';
import { Ruler, Smartphone, Store, Truck } from 'lucide-react';
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
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-800 dark:from-primary-950 dark:via-slate-900 dark:to-primary-950" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-accent-400 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold-400 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-white/80 text-xs font-semibold mb-3 border-white/20">
            {isRTL ? '✦ لماذا مفصل؟' : '✦ Why MUFASAL?'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            {isRTL ? features.titleAr : features.titleEn}
          </h2>
          <p className="text-lg text-white/60">
            {isRTL ? features.subtitleAr : features.subtitleEn}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.items.map((feature, i) => {
            const Icon = ICONS[feature.icon] || Store;
            return (
              <div
                key={i}
                className="glass flex items-start gap-5 p-6 border-white/15 hover:border-white/30 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 group-hover:border-gold-400/40 transition-all">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {isRTL ? feature.descAr : feature.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

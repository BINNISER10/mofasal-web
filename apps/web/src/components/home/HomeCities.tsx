'use client';

import { MapPin } from 'lucide-react';
import siteConfig from '@/data/site-config.json';

interface HomeCitiesProps {
  isRTL: boolean;
}

export function HomeCities({ isRTL }: HomeCitiesProps) {
  const { cities } = siteConfig;

  return (
    <section className="py-10 bg-primary-50 dark:bg-primary-900/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-accent-500 mb-4 font-medium">
          {isRTL ? cities.titleAr : cities.titleEn}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {cities.list.map((city, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-primary-100 dark:border-slate-700 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
            >
              <MapPin size={12} />
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

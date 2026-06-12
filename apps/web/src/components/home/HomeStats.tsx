'use client';

import type { LucideIcon } from 'lucide-react';
import { MapPin, ShoppingBag, Star, Users } from 'lucide-react';
import siteConfig from '@/data/site-config.json';

interface HomeStatsProps {
  isRTL: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  Users,
  ShoppingBag,
  MapPin,
  Star,
};

export function HomeStats({ isRTL }: HomeStatsProps) {
  const { stats } = siteConfig;

  return (
    <section className="py-16 -mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = ICONS[stat.icon] || Users;
            return (
              <div
                key={i}
                className="glass-teal p-6 text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <p className="text-3xl font-black text-primary-700 dark:text-primary-200">
                  {isRTL ? stat.valueAr : stat.valueEn}
                </p>
                <p className="text-sm text-accent-500 dark:text-accent-300 mt-1">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

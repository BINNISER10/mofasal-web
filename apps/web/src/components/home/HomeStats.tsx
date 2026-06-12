'use client';

import { Package, ShoppingBag, Store, Users } from 'lucide-react';
import type { ReactNode } from 'react';

interface HomeStatsProps {
  isRTL: boolean;
}

const STATS: { icon: ReactNode; value: string; labelAr: string; labelEn: string }[] = [
  { icon: <Store size={24} />, value: '500+', labelAr: 'متجر خياطة', labelEn: 'Tailor Shops' },
  { icon: <ShoppingBag size={24} />, value: '50,000+', labelAr: 'طلب مكتمل', labelEn: 'Orders Completed' },
  { icon: <Package size={24} />, value: '10,000+', labelAr: 'نوع قماش', labelEn: 'Fabric Types' },
  { icon: <Users size={24} />, value: '1,000+', labelAr: 'خياط محترف', labelEn: 'Professional Tailors' },
];

export function HomeStats({ isRTL }: HomeStatsProps) {
  return (
    <section className="py-16 -mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="glass-teal p-6 text-center group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-primary-700 dark:text-primary-200">{stat.value}</p>
              <p className="text-sm text-accent-500 dark:text-accent-300 mt-1">
                {isRTL ? stat.labelAr : stat.labelEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

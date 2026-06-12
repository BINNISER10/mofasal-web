'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import { HOME_IMAGES } from './homeImages';

interface HomeCategoriesProps {
  isRTL: boolean;
}

const categories = [
  {
    href: '/shops',
    image: HOME_IMAGES.tailoring,
    labelAr: 'تفصيل الثوب',
    labelEn: 'Custom Tailoring',
    descAr: 'خياط معتمد — قياس منزلي وتتبع حتى التوصيل',
    descEn: 'Certified tailor — home fitting & delivery tracking',
    ctaAr: 'ابحث عن خياط',
    ctaEn: 'Find a Tailor',
  },
  {
    href: '/marketplace',
    image: HOME_IMAGES.fabric,
    labelAr: 'سوق الأقمشة',
    labelEn: 'Fabric Market',
    descAr: 'أقمشة ثوب سعودي من تجار موثوقين',
    descEn: 'Saudi thobe fabrics from trusted merchants',
    ctaAr: 'تصفح الأقمشة',
    ctaEn: 'Browse Fabrics',
  },
] as const;

export function HomeCategories({ isRTL }: HomeCategoriesProps) {
  const { categories: section } = siteConfig;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-14">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
            {isRTL ? section.eyebrowAr : section.eyebrowEn}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? section.titleAr : section.titleEn}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group block overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900"
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={cat.image}
                  alt={isRTL ? cat.labelAr : cat.labelEn}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/sections/category-fabric.png';
                  }}
                />
              </div>
              <div className="p-6 md:p-8 border-t border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-[#111]">
                <h3 className="text-xl md:text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-2">
                  {isRTL ? cat.labelAr : cat.labelEn}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
                  {isRTL ? cat.descAr : cat.descEn}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#00373E] dark:text-white group-hover:gap-3 transition-all">
                  {isRTL ? cat.ctaAr : cat.ctaEn}
                  <Arrow size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BRAND_COLORS } from '@mufasal/shared';
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
    descAr: 'اختر خياطك المعتمد — قياس منزلي وتتبع لحظي حتى التوصيل',
    descEn: 'Choose your certified tailor — home measurement & live tracking until delivery',
    ctaAr: 'ابحث عن خياط',
    ctaEn: 'Find a Tailor',
  },
  {
    href: '/marketplace',
    image: HOME_IMAGES.fabric,
    labelAr: 'سوق الأقمشة',
    labelEn: 'Fabric Market',
    descAr: 'أجود أقمشة الثوب السعودي — قطن، صوف، وخليجي من تجار موثوقين',
    descEn: 'Finest Saudi thobe fabrics — cotton, wool & Gulf weaves from trusted merchants',
    ctaAr: 'تصفح الأقمشة',
    ctaEn: 'Browse Fabrics',
  },
] as const;

export function HomeCategories({ isRTL }: HomeCategoriesProps) {
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 md:py-20 bg-[#F5F5F5] dark:bg-[#0a1214]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: BRAND_COLORS.gold }}>
            {isRTL ? 'خدماتنا' : 'Our Services'}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {isRTL ? 'خياطة وقماش — لا أكثر' : 'Tailoring & Fabric — Nothing Else'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/10] block shadow-md hover:shadow-2xl transition-shadow duration-500"
            >
              <Image
                src={cat.image}
                alt={isRTL ? cat.labelAr : cat.labelEn}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: BRAND_COLORS.gold }}>
                  مفصل
                </p>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                  {isRTL ? cat.labelAr : cat.labelEn}
                </h3>
                <p className="text-white/70 text-sm md:text-base mb-4 max-w-md leading-relaxed">
                  {isRTL ? cat.descAr : cat.descEn}
                </p>
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3"
                  style={{ color: BRAND_COLORS.gold }}
                >
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

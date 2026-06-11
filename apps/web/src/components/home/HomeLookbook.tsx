'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HOME_IMAGES } from './homeImages';

interface HomeLookbookProps {
  isRTL: boolean;
}

const LOOKBOOK_ITEMS = [
  { titleAr: 'الثوب الكلاسيكي', titleEn: 'Classic Thobe', image: HOME_IMAGES.heroSlides[0] },
  { titleAr: 'البدلة الرسمية', titleEn: 'Formal Suit', image: HOME_IMAGES.heroSlides[1] },
  { titleAr: 'قماش صيفي', titleEn: 'Summer Fabric', image: HOME_IMAGES.fabric },
  { titleAr: 'البشت', titleEn: 'Bisht', image: HOME_IMAGES.craftsmanship },
] as const;

export function HomeLookbook({ isRTL }: HomeLookbookProps) {
  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#111]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-12">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
            {isRTL ? 'لوك بوك' : 'Lookbook'}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
            {isRTL ? 'أناقة السعودي' : 'Saudi Elegance'}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {LOOKBOOK_ITEMS.map((item, i) => (
            <Link
              key={i}
              href="/shops"
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-200"
            >
              <Image
                src={item.image}
                alt={isRTL ? item.titleAr : item.titleEn}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-4 inset-x-4 text-white text-sm font-medium">
                {isRTL ? item.titleAr : item.titleEn}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

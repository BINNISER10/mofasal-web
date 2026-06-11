'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HOME_IMAGES } from './homeImages';

interface HomeCraftsmanshipProps {
  isRTL: boolean;
}

const fabrics = [
  { nameAr: 'ثوب أبيض كلاسيكي', nameEn: 'Classic White Thobe', price: '399', image: HOME_IMAGES.products[0] },
  { nameAr: 'ثوب يومي بريميوم', nameEn: 'Premium Daily Thobe', price: '289', image: HOME_IMAGES.products[1] },
  { nameAr: 'قماش قطن فاخر', nameEn: 'Premium Cotton', price: '120', unitAr: '/ متر', unitEn: '/ m', image: HOME_IMAGES.products[2] },
  { nameAr: 'بدلة رسمية', nameEn: 'Formal Suit Fabric', price: '350', unitAr: '/ متر', unitEn: '/ m', image: HOME_IMAGES.products[3] },
] as const;

export function HomeCraftsmanship({ isRTL }: HomeCraftsmanshipProps) {
  return (
    <>
      <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#111]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-200">
              <Image
                src={HOME_IMAGES.craftsmanship}
                alt={isRTL ? 'تفاصيل خياطة' : 'Tailoring details'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
                {isRTL ? 'من نحن' : 'About'}
              </p>
              <h2 className="text-2xl md:text-4xl font-semibold text-[#0A0A0A] dark:text-white leading-tight mb-5 tracking-tight">
                {isRTL ? 'جودة في كل غرزة' : 'Quality in Every Stitch'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-8">
                {isRTL
                  ? 'من اختيار القماش حتى آخر تفصيل — ثوب سعودي للرجال والأطفال بمعايير عالية.'
                  : 'From fabric selection to the final stitch — premium Saudi thobes for men and boys.'}
              </p>
              <Link
                href="/shops"
                className="inline-flex min-h-[48px] items-center px-8 text-sm font-medium bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-full hover:opacity-90 transition-opacity"
              >
                {isRTL ? 'ابدأ التفصيل' : 'Start Tailoring'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] border-t border-[#E8E8E8] dark:border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-500 mb-2">
                {isRTL ? 'مختارات' : 'Curated'}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white tracking-tight">
                {isRTL ? 'أقمشة وثياب' : 'Fabrics & Thobes'}
              </h2>
            </div>
            <Link href="/marketplace" className="text-sm font-medium text-[#00373E] dark:text-white hover:underline shrink-0">
              {isRTL ? 'عرض الكل' : 'View all'}
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {fabrics.map((item, i) => (
              <Link key={i} href="/marketplace" className="group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-3">
                  <Image
                    src={item.image}
                    alt={isRTL ? item.nameAr : item.nameEn}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white mb-1 line-clamp-2">
                  {isRTL ? item.nameAr : item.nameEn}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.price} {isRTL ? 'ر.س' : 'SAR'}
                  {'unitAr' in item && (isRTL ? item.unitAr : item.unitEn)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

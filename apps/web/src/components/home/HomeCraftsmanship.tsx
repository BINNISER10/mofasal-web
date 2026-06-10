'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BRAND_COLORS } from '@mufasal/shared';
import { HOME_IMAGES } from './homeImages';

interface HomeCraftsmanshipProps {
  isRTL: boolean;
}

const fabrics = [
  { nameAr: 'ثوب أبيض بإكسسوار ذهبي', nameEn: 'White Thobe with Gold Accent', price: '399', unitAr: 'ر.س', unitEn: 'SAR', image: HOME_IMAGES.products[0] },
  { nameAr: 'لومار بريميوم ديلي', nameEn: 'Premium Daily Thobe', price: '289', unitAr: 'ر.س', unitEn: 'SAR', image: HOME_IMAGES.products[1] },
  { nameAr: 'قماش قطن فاخر', nameEn: 'Premium Cotton Fabric', price: '120', unitAr: 'ر.س / متر', unitEn: 'SAR / m', image: HOME_IMAGES.products[2] },
  { nameAr: 'ثوب كلاسيكي', nameEn: 'Classic Thobe', price: '350', unitAr: 'ر.س', unitEn: 'SAR', image: HOME_IMAGES.products[3] },
] as const;

export function HomeCraftsmanship({ isRTL }: HomeCraftsmanshipProps) {
  return (
    <>
      <section className="py-16 md:py-24 bg-white dark:bg-[#0d1517]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={HOME_IMAGES.craftsmanship}
                alt={isRTL ? 'تفاصيل خياطة دقيقة' : 'Fine tailoring details'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: BRAND_COLORS.gold }}>
                {isRTL ? 'من نحن' : 'About Us'}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-5">
                {isRTL ? (
                  <>الجودة، الأناقة،<br />والتفاصيل المتقنة</>
                ) : (
                  <>Quality, Elegance,<br />&amp; Meticulous Detail</>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {isRTL
                  ? 'ثقتكم تلهمنا لنقدّم تفصيلاً يجمع بين أصالة الثوب السعودي ودقة الخياطة الحديثة. من اختيار القماش حتى آخر غرزة — كل خطوة بعناية.'
                  : 'Your trust inspires us to deliver tailoring that blends Saudi thobe heritage with modern precision. From fabric selection to the final stitch — every step with care.'}
              </p>
              <Link
                href="/shops"
                className="inline-flex items-center font-bold px-7 py-3 rounded-xl transition-all hover:brightness-110"
                style={{ backgroundColor: BRAND_COLORS.primary, color: '#fff' }}
              >
                {isRTL ? 'تسوق الآن' : 'Shop Now'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: BRAND_COLORS.cream }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: BRAND_COLORS.secondary }}>
                {isRTL ? 'الأكثر مبيعاً' : 'Best Sellers'}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                {isRTL ? 'أقمشة مختارة' : 'Curated Fabrics'}
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="text-sm font-bold shrink-0 hover:underline"
              style={{ color: BRAND_COLORS.primary }}
            >
              {isRTL ? 'عرض الكل ←' : 'View All →'}
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {fabrics.map((item, i) => (
              <Link
                key={i}
                href="/marketplace"
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={isRTL ? item.nameAr : item.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 line-clamp-2">
                    {isRTL ? item.nameAr : item.nameEn}
                  </h3>
                  <p className="font-black text-lg" style={{ color: BRAND_COLORS.primary }}>
                    {item.price}{' '}
                    <span className="text-xs font-medium text-gray-500">
                      {isRTL ? item.unitAr : item.unitEn}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

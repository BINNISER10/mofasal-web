'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND_COLORS } from '@mufasal/shared';
import { HOME_IMAGES } from './homeImages';

interface HomeHeroProps {
  isRTL: boolean;
}

export function HomeHero({ isRTL }: HomeHeroProps) {
  const [slide, setSlide] = useState(0);
  const slides = HOME_IMAGES.heroSlides;

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative pt-16 min-h-[92vh] bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      <div className="relative h-[calc(92vh-4rem)] max-w-[1440px] mx-auto px-4 md:px-6 pb-6">
        <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-100">
          {slides.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={isRTL ? 'تفصيل ثوب سعودي' : 'Saudi thobe tailoring'}
              fill
              priority={i === 0}
              className={`object-cover object-center transition-opacity duration-1000 ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 lg:p-16">
            <p className="text-[11px] md:text-xs font-medium tracking-[0.25em] uppercase text-white/70 mb-4">
              {isRTL ? 'مفصل · تفصيل وقماش' : 'MUFASAL · Tailor & Fabric'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] max-w-2xl mb-4">
              {isRTL ? (
                <>
                  خياطة راقية
                  <br />
                  تبدأ من هنا
                </>
              ) : (
                <>
                  Premium Tailoring
                  <br />
                  Starts Here
                </>
              )}
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
              {isRTL
                ? 'للرجال والأطفال — اختر خياطك، القماش، وتابع طلبك بثلاث خطوات.'
                : 'For men and boys — pick your tailor, fabric, and track your order in three steps.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shops"
                className="inline-flex items-center justify-center min-h-[48px] px-8 text-sm font-medium bg-white text-[#0A0A0A] rounded-full hover:bg-white/90 transition-colors"
              >
                {isRTL ? 'تفصيل ثوب' : 'Custom Thobe'}
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center min-h-[48px] px-8 text-sm font-medium text-white border border-white/50 rounded-full hover:bg-white/10 transition-colors"
              >
                {isRTL ? 'تسوق الأقمشة' : 'Shop Fabrics'}
              </Link>
            </div>

            <div className="flex gap-2 mt-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className="h-0.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === slide ? 40 : 16,
                    backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

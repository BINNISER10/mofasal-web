'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Ruler, Scissors } from 'lucide-react';
import { BRAND_COLORS, BRAND_NAME } from '@mufasal/shared';
import { HOME_IMAGES } from './homeImages';

interface HomeHeroProps {
  isRTL: boolean;
}

export function HomeHero({ isRTL }: HomeHeroProps) {
  const [slide, setSlide] = useState(0);
  const slides = HOME_IMAGES.heroSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-[#001518]">
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={isRTL ? 'تفصيل ثوب سعودي راقٍ' : 'Premium Saudi tailoring'}
          fill
          priority={i === 0}
          className={`object-cover object-center transition-opacity duration-1000 ${
            i === slide ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="100vw"
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,21,24,0.97) 0%, rgba(0,37,40,0.7) 40%, rgba(0,55,62,0.25) 70%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'linear-gradient(to right, rgba(0,21,24,0.88) 0%, rgba(0,37,40,0.45) 45%, transparent 75%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-16 md:pb-24 pt-32">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border"
            style={{
              borderColor: `${BRAND_COLORS.gold}55`,
              backgroundColor: `${BRAND_COLORS.primary}88`,
              color: BRAND_COLORS.cream,
            }}
          >
            <Ruler size={14} style={{ color: BRAND_COLORS.gold }} />
            <span>{isRTL ? 'تفصيل ثوب · بيع قماش' : 'Tailoring · Fabric'}</span>
            <Scissors size={14} style={{ color: BRAND_COLORS.gold }} />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.15] mb-5">
            {isRTL ? (
              <>
                الجودة، الأناقة،
                <br />
                <span style={{ color: BRAND_COLORS.gold }}>والتفاصيل المتقنة</span>
              </>
            ) : (
              <>
                Quality, Elegance,
                <br />
                <span style={{ color: BRAND_COLORS.gold }}>&amp; Meticulous Detail</span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-8 max-w-xl">
            {isRTL
              ? `${BRAND_NAME.ar} — ثقتكم تلهمنا لنقدّم تفصيلاً يجمع بين أصالة الثوب السعودي وأجود الأقمشة.`
              : `${BRAND_NAME.en} — Your trust inspires premium Saudi thobe tailoring and finest fabrics.`}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/shops"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: BRAND_COLORS.gold, color: '#1a1200' }}
            >
              <Scissors size={18} />
              {isRTL ? 'تفصيل ثوب' : 'Custom Thobe'}
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl border-2 text-white transition-all hover:bg-white/10"
              style={{ borderColor: `${BRAND_COLORS.cream}66` }}
            >
              {isRTL ? 'تسوق الأقمشة' : 'Shop Fabrics'}
            </Link>
          </div>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === slide ? 32 : 12,
                  backgroundColor: i === slide ? BRAND_COLORS.gold : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

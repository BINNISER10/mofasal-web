'use client';
import React from 'react';
import { Search, X, MapPin, Scissors, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND_COLORS } from '@mufasal/shared';
import { BrandPattern } from '@/components/shared/BrandPattern';

interface ShopsHeroProps {
  isRTL: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchClear: () => void;
  shopCount: number;
  openCount: number;
}

export function ShopsHero({ isRTL, search, onSearchChange, onSearchClear, shopCount, openCount }: ShopsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-white pt-20 pb-16 md:pb-20 px-4">
      <BrandPattern tone="dark" opacity={0.14} animated />

      <div className="absolute bottom-0 inset-x-0 h-px overflow-hidden">
        <div
          className="h-full w-2/5 animate-slide-in-right"
          style={{ backgroundColor: BRAND_COLORS.gold, animationDuration: '4s', animationIterationCount: 'infinite' }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
          <Award size={14} style={{ color: BRAND_COLORS.gold }} />
          <span>{isRTL ? 'خياطون معتمدون في المملكة' : 'Certified Tailors Across KSA'}</span>
          <Scissors size={14} style={{ color: `${BRAND_COLORS.gold}B3` }} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
          {isRTL ? (
            <>اختر <span style={{ color: BRAND_COLORS.gold }}>خياطك</span> بثقة</>
          ) : (
            <>Find Your <span style={{ color: BRAND_COLORS.gold }}>Tailor</span></>
          )}
        </h1>

        <p className="text-lg text-white/70 mb-6 max-w-xl mx-auto">
          {isRTL
            ? `${shopCount} ورشة خياطة · ${openCount} مفتوحة الآن — قياس منزلي وتتبع لحظي`
            : `${shopCount} tailoring shops · ${openCount} open now — home measurement & live tracking`}
        </p>

        <div className="flex gap-2 max-w-2xl mx-auto glass rounded-2xl p-1.5 border border-white/10 mb-8">
          <div className="flex-1 flex items-center gap-2 px-4">
            <Search size={18} className="text-white/50 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isRTL ? 'ابحث بالاسم أو المدينة أو الحي...' : 'Search by name, city, or district...'}
              className="w-full text-white text-sm outline-none bg-transparent placeholder:text-white/40"
            />
            {search && (
              <button onClick={onSearchClear} className="text-white/50 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <Button variant="gold" className="rounded-xl px-6 shrink-0">
            {isRTL ? 'بحث' : 'Search'}
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {(isRTL
            ? ['الرياض', 'جدة', 'الدمام', 'بشوت ومشالح', 'ثوب أطفال']
            : ['Riyadh', 'Jeddah', 'Dammam', 'Bisht & Mishlah', 'Kids Thobe']
          ).map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 hover:border-gold-400/50 hover:text-gold-300 transition-all"
            >
              {tag.includes('ال') || tag.includes('بش') || tag.includes('ثوب') ? <MapPin size={10} /> : null}
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

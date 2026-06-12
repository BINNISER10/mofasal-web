'use client';
import React from 'react';
import { Search, X, Scissors, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND_COLORS, BRAND_NAME } from '@mufasal/shared';
import { BrandPattern } from '@/components/shared/BrandPattern';

interface MarketplaceHeroProps {
  isRTL: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchClear: () => void;
}

export function MarketplaceHero({ isRTL, search, onSearchChange, onSearchClear }: MarketplaceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-white py-16 md:py-20 px-4">
      <BrandPattern animated opacity={0.14} tone="dark" />

      {/* خط خياطة متحرك */}
      <div className="absolute bottom-0 inset-x-0 h-px overflow-hidden">
        <div className="h-full w-1/3 animate-slide-in-right" style={{ backgroundColor: `${BRAND_COLORS.gold}99`, animationDuration: '3s', animationIterationCount: 'infinite' }} />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* شارة ثقافية */}
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
          <Scissors size={14} style={{ color: BRAND_COLORS.gold }} />
          <span>{isRTL ? 'أجود أقمشة الثوب السعودي' : 'Finest Saudi Thobe Fabrics'}</span>
          <Ruler size={14} style={{ color: `${BRAND_COLORS.gold}B3` }} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
          {isRTL ? (
            <>سوق <span style={{ color: BRAND_COLORS.gold }}>{BRAND_NAME.ar}</span> للأقمشة</>
          ) : (
            <>{BRAND_NAME.en} <span style={{ color: BRAND_COLORS.gold }}>Fabric</span> Market</>
          )}
        </h1>

        <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
          {isRTL
            ? 'من صوف إيطاليا إلى قطن مصر — اختر قماش ثوبك وتابع خياطتك خطوة بخطوة'
            : 'From Italian wool to Egyptian cotton — choose your thobe fabric and track tailoring step by step'}
        </p>

        {/* بحث زجاجي */}
        <div className="flex gap-2 max-w-2xl mx-auto glass rounded-2xl p-1.5 border border-white/10">
          <div className="flex-1 flex items-center gap-2 px-4">
            <Search size={18} className="text-white/50 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isRTL ? 'ابحث: صوف، قطن، ثوب أبيض، بشت...' : 'Search: wool, cotton, white thobe, bisht...'}
              className="w-full text-white text-sm outline-none bg-transparent placeholder:text-white/40"
            />
            {search && (
              <button onClick={onSearchClear} className="text-white/50 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <Button variant="gold" className="rounded-xl px-6 shrink-0">
            {isRTL ? 'بحث' : 'Search'}
          </Button>
        </div>

        {/* فئات سريعة */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {(isRTL
            ? ['ثوب أبيض', 'بشت ملكي', 'صوف إيطالي', 'شماغ أحمر', 'مشلح']
            : ['White Thobe', 'Royal Bisht', 'Italian Wool', 'Red Shemagh', 'Mishlah']
          ).map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-300 hover:border-gold-400/40 hover:text-gold-300"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

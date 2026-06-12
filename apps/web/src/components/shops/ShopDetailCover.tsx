'use client';
import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandPattern } from '@/components/shared/BrandPattern';
import { BRAND_COLORS } from '@mufasal/shared';

interface ShopDetailCoverProps {
  isRTL: boolean;
  onBack: () => void;
  logo?: string | null;
  name: string;
  initials: string;
}

export function ShopDetailCover({ isRTL, onBack, logo, name, initials }: ShopDetailCoverProps) {
  const ChevronBack = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="relative h-52 md:h-64 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 mt-16 overflow-hidden">
      <BrandPattern tone="dark" opacity={0.18} animated />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-primary-900/20 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-4 end-4 z-20 flex items-center gap-1 glass rounded-xl text-white px-3 py-1.5 text-sm font-medium hover:bg-white/20 transition-all"
      >
        <ChevronBack size={16} />
        {isRTL ? 'رجوع' : 'Back'}
      </button>

      <div className="absolute bottom-0 inset-x-0 h-1 overflow-hidden">
        <div className="h-full w-1/4 animate-slide-in-right" style={{ backgroundColor: BRAND_COLORS.gold, animationDuration: '5s', animationIterationCount: 'infinite' }} />
      </div>

      <div className="absolute -bottom-10 start-6 z-20">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white shadow-mufasal overflow-hidden bg-white flex items-center justify-center">
          {logo ? (
            <Image src={logo} alt={name} width={96} height={96} className="object-cover w-full h-full" />
          ) : (
            <span className="text-2xl font-black text-primary-700">{initials}</span>
          )}
        </div>
      </div>
    </div>
  );
}

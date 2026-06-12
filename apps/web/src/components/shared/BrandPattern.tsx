'use client';
import React, { useId } from 'react';
import { BRAND_COLORS } from '@mufasal/shared';
import { cn } from '@/lib/utils/cn';

/**
 * زخرفة مفصل الرسمية — هندسة نجدية مُحسَّنة
 * مستوحاة من BRAND/PATTERN — نسيج معينات + خيوط ذهبية
 */
interface BrandPatternProps {
  className?: string;
  opacity?: number;
  tone?: 'light' | 'dark';
  animated?: boolean;
}

export function BrandPattern({
  className,
  opacity = 0.1,
  tone = 'dark',
  animated = false,
}: BrandPatternProps) {
  const uid = useId().replace(/:/g, '');
  const gold = BRAND_COLORS.gold;
  const primary = BRAND_COLORS.primary;
  const secondary = BRAND_COLORS.secondary;
  const cream = BRAND_COLORS.cream;
  const strokeBase = tone === 'dark' ? 0.18 : 0.1;

  return (
    <svg
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none',
        animated && 'animate-pulse-slow',
        className,
      )}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={`bp-lattice-${uid}`} x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="transparent" />
          <path
            d="M32 4 L60 32 L32 60 L4 32 Z"
            fill="none"
            stroke={gold}
            strokeWidth="0.6"
            strokeOpacity={strokeBase}
          />
          <path
            d="M32 16 L48 32 L32 48 L16 32 Z"
            fill={primary}
            fillOpacity={strokeBase * 0.35}
          />
          <path d="M0 32 H64 M32 0 V64" stroke={gold} strokeWidth="0.35" strokeOpacity={strokeBase * 0.5} />
          <circle cx="32" cy="32" r="2" fill={gold} fillOpacity={strokeBase * 0.8} />
        </pattern>

        <pattern id={`bp-weave-${uid}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M0 12 H24 M12 0 V24"
            stroke={secondary}
            strokeWidth="0.4"
            strokeOpacity={strokeBase * 0.6}
          />
          <path
            d="M0 0 L24 24 M24 0 L0 24"
            stroke={cream}
            strokeWidth="0.25"
            strokeOpacity={strokeBase * 0.4}
          />
        </pattern>

        <linearGradient id={`bp-fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill={`url(#bp-weave-${uid})`} />
      <rect width="100%" height="100%" fill={`url(#bp-lattice-${uid})`} />
      <rect width="100%" height="100%" fill={`url(#bp-fade-${uid})`} />
    </svg>
  );
}

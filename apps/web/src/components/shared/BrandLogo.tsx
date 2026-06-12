'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { BRAND_NAME, BRAND_ASSETS } from '@mufasal/shared';

interface BrandLogoProps {
  variant?: 'default' | 'white' | 'dark';
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

const SIZES = {
  sm: { icon: 32, text: 'text-base' },
  md: { icon: 36, text: 'text-lg' },
  lg: { icon: 48, text: 'text-xl' },
};

export function BrandLogo({
  variant = 'default',
  showWordmark = true,
  size = 'md',
  href = '/',
  className,
}: BrandLogoProps) {
  const { icon, text } = SIZES[size];
  const isWhite = variant === 'white';

  const content = (
    <div className={cn('flex items-center gap-2.5 group', className)}>
      <div className={cn(
        'relative flex-shrink-0 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105',
        variant === 'default' && 'bg-gradient-primary p-1.5',
        variant === 'dark' && 'bg-primary-900 p-1.5',
      )}>
        <Image
          src={BRAND_ASSETS.logoSvg}
          alt={BRAND_NAME.ar}
          width={icon}
          height={icon}
          className={cn(
            'object-contain',
            isWhite && 'brightness-0 invert',
            variant === 'default' && 'brightness-0 invert',
          )}
          priority
        />
      </div>
      {showWordmark && (
        <span className={cn(
          'font-bold hidden sm:block transition-colors',
          text,
          isWhite ? 'text-white' : 'text-primary-700 dark:text-white',
        )}>
          {BRAND_NAME.ar}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex">{content}</Link>;
  }
  return content;
}

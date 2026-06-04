'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'gold' | 'success' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variants = {
  primary: 'bg-[#00373E]/10 text-[#00373E]',
  secondary: 'bg-[#481719]/10 text-[#481719]',
  accent: 'bg-[#735B4D]/10 text-[#735B4D]',
  gold: 'bg-[#D4AF37]/10 text-[#B8960A]',
  success: 'bg-[#00373E]/10 text-[#00373E]',
  danger: 'bg-[#481719]/10 text-[#481719]',
  neutral: 'bg-[#D0D6D7]/30 text-[#735B4D]',
};

const dotColors = {
  primary: 'bg-[#00373E]',
  secondary: 'bg-[#481719]',
  accent: 'bg-[#735B4D]',
  gold: 'bg-[#D4AF37]',
  success: 'bg-[#00373E]',
  danger: 'bg-[#481719]',
  neutral: 'bg-[#735B4D]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full ml-1.5', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

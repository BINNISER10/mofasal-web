'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'cream' | 'minimal';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  header,
  footer,
  onClick,
  variant = 'default',
}: CardProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-[#D0D6D7]/20 dark:border-slate-700 shadow-[0_1px_3px_rgba(0,55,62,0.06)]',
    glass: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-[#D0D6D7]/30 dark:border-slate-700 shadow-[0_4px_16px_rgba(0,55,62,0.08)]',
    cream: 'bg-gradient-to-br from-white to-[#F2E8D4]/20 dark:from-slate-800 dark:to-slate-800 border border-[#D0D6D7]/20 dark:border-slate-700 shadow-[0_1px_3px_rgba(0,55,62,0.06)]',
    minimal: 'bg-white dark:bg-[#111] border border-[#E8E8E8] dark:border-white/10 shadow-none',
  };

  return (
    <div
      className={cn(
        // Base
        'rounded-2xl overflow-hidden transition-all duration-300',
        // Variant
        variantStyles[variant],
        // Hover
        hover && 'hover:shadow-[0_4px_16px_rgba(0,55,62,0.1)] hover:-translate-y-0.5 cursor-pointer',
        // Padding
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className="border-b border-[#D0D6D7]/20 dark:border-slate-700 pb-4 mb-4">{header}</div>
      )}
      {children}
      {footer && (
        <div className="border-t border-[#D0D6D7]/20 dark:border-slate-700 pt-4 mt-4">{footer}</div>
      )}
    </div>
  );
}

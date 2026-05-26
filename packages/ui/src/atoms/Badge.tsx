import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold' | 'accent';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<string, string> = {
  success: 'bg-[#D0E4E6] text-[#00373E]',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
  gold: 'bg-[#481719]/20 text-[#2E0E10]',
  accent: 'bg-[#735B4D]/20 text-[#4D3B32]',
};

const dotColors: Record<string, string> = {
  success: 'bg-[#0A5A64]',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
  gold: 'bg-[#481719]',
  accent: 'bg-[#735B4D]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            dotColors[variant],
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
      {children}
    </span>
  );
};

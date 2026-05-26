'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variants = {
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  neutral: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300',
  gold: 'bg-gold-100 dark:bg-yellow-900/30 text-gold-800 dark:text-yellow-400',
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
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full ml-1.5',
            variant === 'success' && 'bg-green-800',
            variant === 'warning' && 'bg-yellow-800',
            variant === 'error' && 'bg-red-800',
            variant === 'info' && 'bg-blue-800',
            variant === 'neutral' && 'bg-gray-800',
            variant === 'gold' && 'bg-gold-800'
          )}
        />
      )}
      {children}
    </span>
  );
}

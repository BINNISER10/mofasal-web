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
}: CardProps) {
  return (
    <div
      className={cn(
        'card-jahez overflow-hidden',
        hover && 'card-jahez-hover cursor-pointer',
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className="border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">{header}</div>
      )}
      {children}
      {footer && (
        <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4">{footer}</div>
      )}
    </div>
  );
}

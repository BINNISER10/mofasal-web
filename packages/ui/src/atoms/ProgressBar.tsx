import React from 'react';
import { cn } from '../lib/utils';

export interface ProgressBarProps {
  value: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#0A5A64]',
  secondary: 'bg-[#481719]',
  accent: 'bg-[#735B4D]',
  gradient: 'bg-gradient-to-r from-[#0A5A64] via-[#481719] to-[#735B4D]',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const labelSizeStyles: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex-1 rounded-full bg-gray-200 overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full',
            variantStyles[variant],
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={cn(
            'font-semibold text-gray-700',
            labelSizeStyles[size]
          )}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
};

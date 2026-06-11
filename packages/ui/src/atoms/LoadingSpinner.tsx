import React from 'react';
import { cn } from '../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeStyles: Record<string, { dim: number; border: string }> = {
  sm: { dim: 16, border: 'border-2' },
  md: { dim: 24, border: 'border-2' },
  lg: { dim: 40, border: 'border-4' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-[#0A5A64]',
  className,
}) => {
  const s = sizeStyles[size];

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-t-transparent',
          s.border,
          color,
          'border-gray-200 border-t-[#0A5A64]'
        )}
        style={{ width: s.dim, height: s.dim }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

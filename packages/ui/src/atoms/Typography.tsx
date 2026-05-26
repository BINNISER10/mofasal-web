import React from 'react';
import { cn } from '../lib/utils';

export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

const variantStyles: Record<string, { tag: React.ElementType; className: string }> = {
  h1: { tag: 'h1', className: 'text-3xl md:text-4xl font-bold leading-tight' },
  h2: { tag: 'h2', className: 'text-2xl md:text-3xl font-bold leading-tight' },
  h3: { tag: 'h3', className: 'text-xl md:text-2xl font-semibold leading-snug' },
  h4: { tag: 'h4', className: 'text-lg md:text-xl font-semibold leading-snug' },
  body: { tag: 'p', className: 'text-base leading-relaxed' },
  'body-sm': { tag: 'p', className: 'text-sm leading-relaxed' },
  caption: { tag: 'span', className: 'text-xs leading-relaxed' },
};

const weightClasses: Record<string, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight,
  color,
  className,
  children,
  as,
}) => {
  const config = variantStyles[variant];
  const Tag = as || config.tag;

  return (
    <Tag
      className={cn(
        config.className,
        weight && weightClasses[weight],
        color,
        'rtl:text-right rtl:leading-loose',
        className
      )}
    >
      {children}
    </Tag>
  );
};

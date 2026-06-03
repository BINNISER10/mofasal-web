'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  href,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-md hover:shadow-lg focus:ring-primary-500',
    gold: 'bg-gold-600 text-white hover:bg-gold-700 active:bg-gold-800 shadow-md hover:shadow-gold focus:ring-gold-400',
    outline:
      'border-2 border-primary-700 text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
    ghost:
      'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md focus:ring-red-500',
    success:
      'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md focus:ring-green-500',
    warning:
      'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 shadow-md focus:ring-yellow-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
  };

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...(props as any)}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}


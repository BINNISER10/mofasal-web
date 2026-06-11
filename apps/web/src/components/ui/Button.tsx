'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'secondary';
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
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'bg-[#00373E] text-white hover:bg-[#002F35] active:bg-[#002228] shadow-md shadow-[#00373E]/20 hover:shadow-lg hover:shadow-[#00373E]/30 focus:ring-[#00373E]/50',
    gold: 'bg-[#D4AF37] text-[#00373E] hover:bg-[#B8960A] active:bg-[#9A7F08] shadow-md shadow-[#D4AF37]/20 hover:shadow-lg hover:shadow-[#D4AF37]/30 focus:ring-[#D4AF37]/50 font-bold',
    outline:
      'border-2 border-[#00373E] text-[#00373E] hover:bg-[#00373E]/5 active:bg-[#00373E]/10 focus:ring-[#00373E]/50',
    ghost:
      'text-[#735B4D] hover:bg-[#F2E8D4]/50 active:bg-[#F2E8D4] focus:ring-[#735B4D]/30',
    danger:
      'bg-[#481719] text-white hover:bg-[#3D1315] active:bg-[#320F11] shadow-md shadow-[#481719]/20 focus:ring-[#481719]/50',
    secondary:
      'bg-[#735B4D] text-white hover:bg-[#624D41] active:bg-[#513F35] shadow-md shadow-[#735B4D]/20 focus:ring-[#735B4D]/50',
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

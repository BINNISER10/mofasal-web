import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[#00373E] text-white hover:bg-[#002228] focus:ring-[#D0E4E6] shadow-sm',
  secondary:
    'bg-[#481719] text-white hover:bg-[#2E0E10] focus:ring-[#E8D4D4] shadow-sm',
  accent:
    'bg-[#735B4D] text-white hover:bg-[#4D3B32] focus:ring-[#D1CDAE] shadow-sm',
  outline:
    'border-2 border-[#00373E] text-[#00373E] hover:bg-[#D0E4E6] focus:ring-[#D0E4E6] bg-transparent',
  ghost:
    'text-[#00373E] hover:bg-[#D0E4E6] focus:ring-[#D0E4E6] bg-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-sm',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-8 py-3.5 text-lg gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20} />
        ) : icon && iconPosition === 'left' ? (
          <span className="shrink-0 rtl:order-1">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' ? (
          <span className="shrink-0 rtl:order-1">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

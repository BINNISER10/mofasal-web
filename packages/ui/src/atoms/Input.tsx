import React, { useState } from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  floatingLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      className,
      fullWidth = true,
      floatingLabel = false,
      dir = 'auto',
      id,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasValue = props.value !== undefined && props.value !== '';
    const showFloatingLabel = floatingLabel && label && (focused || hasValue);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 rtl:text-right"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span
              className={cn(
                'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none',
                error ? 'text-red-500' : focused ? 'text-[#0A5A64]' : 'text-gray-400'
              )}
            >
              {icon}
            </span>
          )}
          {floatingLabel && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none z-10',
                icon && iconPosition === 'left' ? 'left-10' : 'left-3',
                showFloatingLabel
                  ? '-top-2.5 text-xs font-medium px-1 bg-white'
                  : 'top-1/2 -translate-y-1/2 text-sm text-gray-400',
                focused && !error && 'text-[#0A5A64]',
                error && 'text-red-500'
              )}
            >
              {label}
            </label>
          )}
          {icon && iconPosition === 'right' && (
            <span
              className={cn(
                'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none',
                error ? 'text-red-500' : focused ? 'text-[#0A5A64]' : 'text-gray-400'
              )}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            dir={dir}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 focus:border-[#0A5A64] focus:ring-[#D0E4E6]',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              floatingLabel && (showFloatingLabel ? 'pt-4 pb-2' : 'py-2.5'),
              'rtl:text-right rtl:[direction:rtl]'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500 rtl:text-right" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-400 rtl:text-right">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

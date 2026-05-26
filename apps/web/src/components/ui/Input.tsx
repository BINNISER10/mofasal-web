'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPhone?: boolean;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

export function Input({
  className,
  label,
  error,
  icon,
  isPhone = false,
  showPasswordToggle = false,
  containerClassName,
  type,
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password' || showPasswordToggle;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {isPhone && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 text-sm font-medium pl-1 border-l border-gray-300 ml-2">
              +966
            </span>
          </div>
        )}
        {icon && !isPhone && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : isPassword ? 'password' : type}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200',
            isPhone && 'pr-20',
            icon && !isPhone && 'pr-10',
            isPassword && 'pl-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          dir="auto"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}

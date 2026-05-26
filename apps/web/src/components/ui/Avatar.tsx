'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const onlineSizes = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#1B5E20', '#388e3c', '#D4AF37', '#0d3b10',
    '#1565c0', '#6a1b9a', '#e65100', '#c62828',
    '#00695c', '#283593', '#4e342e', '#37474f',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  name,
  size = 'md',
  showOnline = false,
  className,
}: AvatarProps) {
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold text-white',
            sizes[size]
          )}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white',
            onlineSizes[size]
          )}
        />
      )}
    </div>
  );
}

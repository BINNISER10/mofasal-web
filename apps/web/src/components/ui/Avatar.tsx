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

// ألوان البراند فقط
const brandColors = [
  '#00373E', // primary
  '#481719', // secondary
  '#735B4D', // accent
  '#D4AF37', // gold
  '#002F35', // primary dark
  '#3D1315', // secondary dark
  '#624D41', // accent dark
  '#B8960A', // gold dark
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return brandColors[Math.abs(hash) % brandColors.length];
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
    <span className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <span
          className={cn(
            'rounded-full flex items-center justify-center font-bold text-white shadow-md',
            sizes[size]
          )}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </span>
      )}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-[#00373E] border-2 border-white',
            onlineSizes[size]
          )}
        />
      )}
    </span>
  );
}

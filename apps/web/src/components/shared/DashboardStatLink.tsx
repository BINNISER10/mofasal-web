'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface DashboardStatLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/** يجعل أي بطاقة إحصائية قابلة للنقر */
export function DashboardStatLink({ href, children, className }: DashboardStatLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-2xl transition-all duration-200',
        'hover:shadow-md hover:border-[#00373E]/25 cursor-pointer',
        className
      )}
    >
      {children}
    </Link>
  );
}

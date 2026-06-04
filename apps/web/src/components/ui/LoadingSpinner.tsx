'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen ? 'min-h-screen' : 'py-8',
        className
      )}
    >
      <Loader2
        className={cn('animate-spin text-[#00373E]', sizes[size])}
      />
      {text && (
        <p className="text-sm text-[#735B4D]/60 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Premium skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#D0D6D7]/20 animate-pulse', className)}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F2E8D4]/40 dark:bg-slate-700" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg w-1/3" />
          <div className="h-6 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg w-1/2" />
          <div className="h-3 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 animate-pulse', className)}>
      <div className="w-10 h-10 rounded-full bg-[#F2E8D4]/40 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg w-3/4" />
        <div className="h-3 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg w-1/2" />
      </div>
      <div className="w-20 h-8 bg-[#F2E8D4]/40 dark:bg-slate-700 rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-[#D0D6D7]/20">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-[#F2E8D4]/20 dark:bg-slate-700/50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-[#F2E8D4]/40 dark:bg-slate-600 rounded-lg flex-1 animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-t border-[#D0D6D7]/10">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-[#F2E8D4]/30 dark:bg-slate-700 rounded-lg flex-1 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

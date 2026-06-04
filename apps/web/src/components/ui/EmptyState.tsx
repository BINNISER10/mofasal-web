'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Icon container */}
      <div className="relative mb-6">
        {/* Background decoration */}
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#F2E8D4]/30 -m-2" />
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#D1CDAE]/20 -m-0" />

        {/* Icon */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F2E8D4] to-[#D1CDAE]/30 flex items-center justify-center shadow-[0_4px_16px_rgba(0,55,62,0.08)]">
          {icon || <Inbox size={36} className="text-[#735B4D]/40" />}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-[#00373E] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#735B4D]/60 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          className="bg-[#00373E] hover:bg-[#002F35] shadow-md shadow-[#00373E]/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

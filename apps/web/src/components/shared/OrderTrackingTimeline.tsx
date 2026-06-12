'use client';

import React from 'react';
import { CUSTOMER_TRACKING_STAGES, getCustomerTrackingIndex } from '@mufasal/shared';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OrderTrackingTimelineProps {
  status: string;
  isRTL?: boolean;
  compact?: boolean;
}

export function OrderTrackingTimeline({ status, isRTL = true, compact = false }: OrderTrackingTimelineProps) {
  const cancelled = status === 'CANCELLED' || status === 'RETURNED';
  const currentIndex = cancelled ? -1 : getCustomerTrackingIndex(status);

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {isRTL ? (status === 'CANCELLED' ? 'تم إلغاء الطلب' : 'تم إرجاع الطلب') : (status === 'CANCELLED' ? 'Order cancelled' : 'Order returned')}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', compact ? '' : 'py-2')}>
      {CUSTOMER_TRACKING_STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const label = isRTL ? stage.labelAr : stage.labelEn;

        return (
          <div key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                  done && 'bg-[#00373E] border-[#00373E] text-white',
                  active && 'border-[#00373E] bg-white dark:bg-[#111] text-[#00373E]',
                  !done && !active && 'border-[#E8E8E8] dark:border-white/10 text-neutral-300'
                )}
              >
                {done ? <Check size={14} /> : <Circle size={10} className={active ? 'fill-[#00373E]' : ''} />}
              </div>
              {i < CUSTOMER_TRACKING_STAGES.length - 1 && (
                <div className={cn('w-0.5 flex-1 min-h-[20px] my-1', done ? 'bg-[#00373E]' : 'bg-[#E8E8E8] dark:bg-white/10')} />
              )}
            </div>
            <div className={cn('pb-5', compact && 'pb-3')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  active ? 'text-[#0A0A0A] dark:text-white' : done ? 'text-neutral-600' : 'text-neutral-400'
                )}
              >
                {label}
              </p>
              {active && !compact && (
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isRTL ? 'المرحلة الحالية' : 'Current stage'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

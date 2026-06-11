'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { TrackingEntry, OrderStatus } from '@/lib/api/orders';
import { formatDateTime } from '@/lib/utils/formatting';
import {
  CheckCircle2,
  Clock,
  Circle,
  UserCheck,
  Ruler,
  Scissors,
  Pin,
  WashingMachine,
  Package,
  Truck,
  HeartHandshake,
  XCircle,
} from 'lucide-react';

interface OrderTimelineProps {
  tracking: TrackingEntry[];
  className?: string;
  locale?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={18} />,
  CONFIRMED: <CheckCircle2 size={18} />,
  STAFF_ON_WAY: <UserCheck size={18} />,
  TAKING_MEASUREMENTS: <Ruler size={18} />,
  CUTTING_FABRIC: <Scissors size={18} />,
  SEWING_ASSEMBLY: <Pin size={18} />,
  IRONING_FINISHING: <WashingMachine size={18} />,
  PACKING_WRAPPING: <Package size={18} />,
  ON_WAY_TO_CUSTOMER: <Truck size={18} />,
  DELIVERED: <HeartHandshake size={18} />,
  CANCELLED: <XCircle size={18} />,
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-500 text-white border-green-500',
  active: 'bg-gold-500 text-white border-gold-500 animate-pulse',
  pending: 'bg-gray-200 text-gray-400 border-gray-200',
  cancelled: 'bg-red-500 text-white border-red-500',
};

function getStatusType(status: OrderStatus, isLast: boolean, isCancelled: boolean): 'completed' | 'active' | 'pending' | 'cancelled' {
  if (isCancelled && status === 'CANCELLED') return 'cancelled';
  if (isLast) return 'active';
  if (status === 'CANCELLED') return 'cancelled';
  return 'completed';
}

export function OrderTimeline({ tracking, className, locale = 'ar' }: OrderTimelineProps) {
  if (!tracking || tracking.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد تحديثات بعد
      </div>
    );
  }

  const isCancelled = tracking.some((t) => t.status === 'CANCELLED');

  return (
    <div className={cn('relative', className)}>
      <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-0">
        {tracking.map((entry, index) => {
          const isLast = index === tracking.length - 1;
          const type = getStatusType(entry.status, isLast, isCancelled);
          const icon = statusIcons[entry.status] || <Circle size={18} />;

          return (
            <div key={entry.id} className="relative flex items-start gap-4 pb-6">
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                  statusColors[type]
                )}
              >
                {type === 'completed' || type === 'active' ? icon : <Circle size={18} />}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    type === 'completed' && 'text-gray-800',
                    type === 'active' && 'text-gold-700',
                    type === 'pending' && 'text-gray-400',
                    type === 'cancelled' && 'text-red-600'
                  )}
                >
                  {entry.status}
                </p>
                {entry.note && (
                  <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateTime(entry.timestamp, locale)}
                </p>
                <p className="text-xs text-gray-400">
                  {entry.updatedByName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

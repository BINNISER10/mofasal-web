'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import {
  CheckCircle2,
  Circle,
  UserCheck,
  Ruler,
  Scissors,
  Pin,
  WashingMachine,
  Package,
  Truck,
  HeartHandshake,
} from 'lucide-react';

interface Stage {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  animClass?: string;
}

const stages: Stage[] = [
  { key: 'PENDING', labelAr: 'قيد الانتظار', labelEn: 'Pending', icon: <Circle size={20} /> },
  { key: 'CONFIRMED', labelAr: 'تم التأكيد', labelEn: 'Confirmed', icon: <CheckCircle2 size={20} /> },
  { key: 'STAFF_ON_WAY', labelAr: 'الموظف في الطريق', labelEn: 'Staff on Way', icon: <UserCheck size={20} />, animClass: 'animate-car-drive' },
  { key: 'TAKING_MEASUREMENTS', labelAr: 'أخذ المقاسات', labelEn: 'Taking Measurements', icon: <Ruler size={20} />, animClass: 'animate-swing' },
  { key: 'CUTTING_FABRIC', labelAr: 'قص القماش', labelEn: 'Cutting Fabric', icon: <Scissors size={20} />, animClass: 'animate-scissors-cut' },
  { key: 'SEWING_ASSEMBLY', labelAr: 'الخياطة والتجميع', labelEn: 'Sewing & Assembly', icon: <Pin size={20} />, animClass: 'animate-sew-machine' },
  { key: 'IRONING_FINISHING', labelAr: 'الكوي والتشطيب', labelEn: 'Ironing & Finishing', icon: <WashingMachine size={20} />, animClass: 'animate-iron-press' },
  { key: 'PACKING_WRAPPING', labelAr: 'التغليف', labelEn: 'Packing & Wrapping', icon: <Package size={20} />, animClass: 'animate-package-wrap' },
  { key: 'ON_WAY_TO_CUSTOMER', labelAr: 'في الطريق إليك', labelEn: 'On Way to You', icon: <Truck size={20} />, animClass: 'animate-car-drive' },
  { key: 'DELIVERED', labelAr: 'تم التسليم', labelEn: 'Delivered', icon: <HeartHandshake size={20} /> },
];

interface OrderTrackingAnimationProps {
  currentStatus: string;
  dates?: Record<string, string>;
  locale?: string;
  className?: string;
}

export function OrderTrackingAnimation({
  currentStatus,
  dates = {},
  locale = 'ar',
  className,
}: OrderTrackingAnimationProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStatus);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && currentIndex >= 0) {
      const el = containerRef.current.children[currentIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-x-auto pb-4 hide-scrollbar',
        className
      )}
      dir="ltr"
    >
      <div className="flex items-start gap-0 min-w-max px-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center gap-2" style={{ width: 100 }}>
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isActive && 'bg-gold-500 border-gold-500 text-white shadow-gold',
                    isFuture && 'bg-gray-100 border-gray-300 text-gray-400',
                    isActive && stage.animClass
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    React.cloneElement(stage.icon as React.ReactElement, {
                      className: isActive ? stage.animClass : '',
                    })
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs font-semibold text-center leading-tight',
                    isCompleted && 'text-green-600',
                    isActive && 'text-gold-600',
                    isFuture && 'text-gray-400'
                  )}
                >
                  {locale === 'ar' ? stage.labelAr : stage.labelEn}
                </p>
                {dates[stage.key] && (
                  <p className="text-[10px] text-gray-400 text-center">
                    {new Date(dates[stage.key]).toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                      { day: 'numeric', month: 'short' }
                    )}
                  </p>
                )}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-12 md:w-16 mt-7',
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200',
                    isActive && 'bg-gradient-to-l from-gold-500 to-green-500 animate-pulse'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

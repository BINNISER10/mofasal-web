'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'gold' | 'accent' | 'secondary' | 'success';
  className?: string;
}

const colorConfig = {
  primary: {
    border: 'border-l-[#00373E]',
    iconBg: 'bg-[#00373E]/10',
    iconColor: 'text-[#00373E]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
  gold: {
    border: 'border-l-[#D4AF37]',
    iconBg: 'bg-[#D4AF37]/10',
    iconColor: 'text-[#D4AF37]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
  accent: {
    border: 'border-l-[#735B4D]',
    iconBg: 'bg-[#735B4D]/10',
    iconColor: 'text-[#735B4D]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
  secondary: {
    border: 'border-l-[#481719]',
    iconBg: 'bg-[#481719]/10',
    iconColor: 'text-[#481719]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
  success: {
    border: 'border-l-[#00373E]',
    iconBg: 'bg-[#00373E]/10',
    iconColor: 'text-[#00373E]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
};

export function StatsCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  color = 'primary',
  className,
}: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        // Base
        'relative overflow-hidden rounded-2xl p-5 transition-all duration-300',
        // Background: white مع cream gradient
        'bg-gradient-to-br from-white to-[#F2E8D4]/30',
        // Border
        'border border-[#D0D6D7]/50',
        // Border left accent
        config.border,
        'border-l-4',
        // Shadow
        'shadow-[0_2px_8px_rgba(0,55,62,0.06),0_4px_16px_rgba(0,55,62,0.04)]',
        // Hover
        'hover:shadow-[0_4px_16px_rgba(0,55,62,0.1),0_8px_32px_rgba(0,55,62,0.06)]',
        'hover:-translate-y-0.5',
        className
      )}
    >
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F2E8D4]/20 to-transparent rounded-bl-full" />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110',
          config.iconBg
        )}>
          <span className={config.iconColor}>{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#735B4D]">{label}</p>
          <p className="text-2xl font-bold text-[#00373E] mt-1">{value}</p>

          {/* Trend */}
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend >= 0 ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00373E]/10">
                  <TrendingUp size={12} className="text-[#00373E]" />
                  <span className="text-xs font-semibold text-[#00373E]">
                    +{Math.abs(trend)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#481719]/10">
                  <TrendingDown size={12} className="text-[#481719]" />
                  <span className="text-xs font-semibold text-[#481719]">
                    -{Math.abs(trend)}%
                  </span>
                </div>
              )}
              {trendLabel && (
                <span className="text-xs text-[#735B4D]/60">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

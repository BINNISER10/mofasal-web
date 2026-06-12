'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'gold' | 'accent' | 'secondary' | 'success' | 'info' | 'danger';
  className?: string;
  href?: string;
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
  info: {
    border: 'border-l-[#2563EB]',
    iconBg: 'bg-[#2563EB]/10',
    iconColor: 'text-[#2563EB]',
    trendUp: 'text-[#00373E]',
    trendDown: 'text-[#481719]',
  },
  danger: {
    border: 'border-l-[#481719]',
    iconBg: 'bg-[#481719]/10',
    iconColor: 'text-[#481719]',
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
  href,
}: StatsCardProps) {
  const config = colorConfig[color] ?? colorConfig.primary;

  const body = (
    <div className="flex items-start gap-4">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        config.iconBg
      )}>
        <span className={config.iconColor}>{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-[#0A0A0A] dark:text-white mt-1 tracking-tight">{value}</p>

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
  );

  const shellClass = cn(
    'rounded-2xl p-5 transition-colors block',
    'bg-white dark:bg-[#111] border border-[#E8E8E8] dark:border-white/10',
    href && 'hover:border-[#00373E]/30 hover:shadow-sm cursor-pointer',
    !href && 'hover:border-[#00373E]/20 dark:hover:border-white/20',
    className
  );

  if (href) {
    return <Link href={href} className={shellClass}>{body}</Link>;
  }

  return <div className={shellClass}>{body}</div>;
}

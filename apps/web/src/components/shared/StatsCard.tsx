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
  color?: 'primary' | 'gold' | 'info' | 'success' | 'danger';
  className?: string;
}

const colorStyles = {
  primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
  gold: 'bg-yellow-50 dark:bg-yellow-900/20 text-gold-600 dark:text-yellow-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

const iconBgStyles = {
  primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  gold: 'bg-yellow-100 dark:bg-yellow-900/40 text-gold-600 dark:text-yellow-400',
  info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  success: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  danger: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
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
  return (
    <div
      className={cn(
        'card-jahez p-5 flex items-start gap-4',
        colorStyles[color],
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          iconBgStyles[color]
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend >= 0 ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
            <span
              className={cn(
                'text-xs font-semibold',
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-xs opacity-60">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

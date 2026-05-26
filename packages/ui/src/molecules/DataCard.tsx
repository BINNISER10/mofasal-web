import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DataCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  icon,
  label,
  value,
  trend,
  subtitle,
  className,
  onClick,
}) => {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 shadow-sm border border-gray-100',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D0E4E6] text-[#0A5A64] shrink-0">
            {icon}
          </div>
        )}
        {trend !== undefined && (
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isPositive
                ? 'bg-[#D0E4E6] text-[#0A5A64]'
                : 'bg-red-50 text-red-600'
            )}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="rtl:text-right">
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

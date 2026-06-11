import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode[];
  className?: string;
  leftSlot?: React.ReactNode;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightActions,
  className,
  leftSlot,
  subtitle,
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 rtl:flex-row-reverse">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="rtl:rotate-180" />
            </button>
          )}
          {leftSlot}
          <div>
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 rtl:text-right">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 rtl:text-right">{subtitle}</p>
            )}
          </div>
        </div>
        {rightActions && rightActions.length > 0 && (
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            {rightActions.map((action, i) => (
              <span key={i}>{action}</span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

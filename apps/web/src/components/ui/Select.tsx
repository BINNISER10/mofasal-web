'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, Search } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  labelAr?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  label,
  error,
  searchable = false,
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = searchable
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.labelAr && o.labelAr.includes(search))
      )
    : options;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-right flex items-center justify-between transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected?.label || selected?.labelAr || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-jahez-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full pr-9 pl-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-right text-sm hover:bg-primary-50 transition-colors',
                    value === option.value && 'bg-primary-50 text-primary-700 font-semibold'
                  )}
                >
                  {option.labelAr || option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

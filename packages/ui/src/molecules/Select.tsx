import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  searchable = false,
  multiple = false,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    options.forEach((opt) => {
      const g = opt.group || '_default';
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
    return groups;
  }, [options]);

  const filteredGroups = useMemo(() => {
    if (!search) return groupedOptions;
    const result: Record<string, SelectOption[]> = {};
    Object.entries(groupedOptions).forEach(([group, opts]) => {
      const filtered = opts.filter(
        (o) => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())
      );
      if (filtered.length > 0) result[group] = filtered;
    });
    return result;
  }, [groupedOptions, search]);

  const isSelected = (optValue: string) => {
    if (multiple && Array.isArray(value)) return value.includes(optValue);
    return value === optValue;
  };

  const handleSelect = (optValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange(newValue);
    } else {
      onChange(optValue);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemove = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== optValue));
    }
  };

  const selectedLabels = useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return value.map((v) => options.find((o) => o.value === v)?.label || v);
    }
    if (value) return [options.find((o) => o.value === value)?.label || value];
    return [];
  }, [value, options, multiple]);

  const displayText = multiple
    ? selectedLabels.length > 0
      ? `${selectedLabels.length} selected`
      : placeholder
    : selectedLabels[0] || placeholder;

  const groups = Object.entries(filteredGroups);

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700 rtl:text-right">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex items-center w-full min-h-[42px] rounded-xl border bg-white px-4 py-2.5 text-sm text-left transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-[#0A5A64] focus:ring-[#D0E4E6]',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            'rtl:text-right'
          )}
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {multiple && selectedLabels.length > 0 ? (
              selectedLabels.map((label, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-[#D0E4E6] text-[#00373E] text-xs rounded-full px-2 py-0.5"
                >
                  {label}
                  <button onClick={(e) => handleRemove((Array.isArray(value) ? value[i] : ''), e)} className="hover:text-[#0A5A64]">
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className={cn(selectedLabels.length > 0 ? 'text-gray-900' : 'text-gray-400')}>
                {displayText}
              </span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={cn(
              'text-gray-400 transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D0E4E6] focus:border-[#0A5A64]"
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">No options found</div>
              ) : (
                groups.map(([group, opts]) => (
                  <div key={group}>
                    {group !== '_default' && (
                      <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        {group}
                      </div>
                    )}
                    {opts.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#D0E4E6]',
                          isSelected(opt.value) && 'bg-[#D0E4E6] text-[#00373E] font-medium',
                          'rtl:text-right'
                        )}
                      >
                        {multiple && (
                          <span
                            className={cn(
                              'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                              isSelected(opt.value)
                                ? 'border-[#0A5A64] bg-[#0A5A64]'
                                : 'border-gray-300'
                            )}
                          >
                            {isSelected(opt.value) && <Check size={12} className="text-white" />}
                          </span>
                        )}
                        <div className="flex-1">
                          <span>{opt.label}</span>
                          {opt.description && (
                            <span className="block text-xs text-gray-400">{opt.description}</span>
                          )}
                        </div>
                        {!multiple && isSelected(opt.value) && (
                          <Check size={16} className="text-[#0A5A64] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 rtl:text-right" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

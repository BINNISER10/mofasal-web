'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  onRowClick,
  page = 1,
  totalPages = 1,
  onPageChange,
  searchable = false,
  onSearch,
  filterOptions,
  filterValue,
  onFilterChange,
  emptyMessage = 'لا توجد بيانات',
  emptyIcon,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-[#D0D6D7]/30 dark:border-slate-700 shadow-[0_2px_8px_rgba(0,55,62,0.06)]">
      {/* Toolbar */}
      {(searchable || filterOptions) && (
        <div className="flex items-center gap-3 p-4 border-b border-[#D0D6D7]/20 dark:border-slate-700">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className={cn('absolute top-1/2 -translate-y-1/2 text-[#735B4D]/40', 'right-3')} size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-9 pl-4 py-2 rounded-xl border border-[#D0D6D7]/30 bg-[#F2E8D4]/20 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00373E]/20 focus:border-[#00373E]/30 text-sm text-[#00373E] dark:text-slate-100 placeholder-[#735B4D]/40 transition-all duration-200"
              />
            </div>
          )}

          {/* Filter */}
          {filterOptions && (
            <div className="relative">
              <select
                value={filterValue}
                onChange={(e) => onFilterChange?.(e.target.value)}
                className="appearance-none px-4 py-2 pr-9 rounded-xl border border-[#D0D6D7]/30 bg-[#F2E8D4]/20 dark:bg-slate-700 text-sm text-[#00373E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00373E]/20 cursor-pointer transition-all duration-200"
              >
                <option value="">الكل</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#735B4D]/40 pointer-events-none" size={14} />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F2E8D4]/30 dark:bg-slate-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5 text-right text-xs font-semibold text-[#735B4D] dark:text-slate-400 uppercase tracking-wider',
                    col.sortable && 'cursor-pointer hover:bg-[#F2E8D4]/50 dark:hover:bg-slate-600 select-none transition-colors'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} className="text-[#00373E]" /> : <ChevronDown size={14} className="text-[#00373E]" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-[#F2E8D4]/50 dark:bg-slate-700 rounded-lg w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon && (
                      <div className="w-16 h-16 rounded-2xl bg-[#F2E8D4]/30 flex items-center justify-center text-[#735B4D]/30">
                        {emptyIcon}
                      </div>
                    )}
                    <p className="text-[#735B4D]/60 text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item)}
                  className={cn(
                    'border-t border-[#D0D6D7]/15 dark:border-slate-700/50 transition-all duration-200',
                    'hover:bg-[#F2E8D4]/20 dark:hover:bg-slate-700/30',
                    onRowClick && 'cursor-pointer',
                    rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-[#F2E8D4]/5 dark:bg-slate-800/50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-sm text-[#00373E] dark:text-slate-300">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-[#D0D6D7]/20 dark:border-slate-700 bg-[#F2E8D4]/10 dark:bg-slate-800/50">
          <span className="text-xs text-[#735B4D]/60 dark:text-slate-500">
            الصفحة {page} من {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#00373E]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isRTL ? <ChevronRight size={16} className="text-[#00373E]" /> : <ChevronLeft size={16} className="text-[#00373E]" />}
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p >= page - 1 && p <= page + 1)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200',
                    p === page
                      ? 'bg-[#00373E] text-white shadow-md shadow-[#00373E]/20'
                      : 'hover:bg-[#00373E]/10 text-[#00373E]'
                  )}
                >
                  {p}
                </button>
              ))}

            {/* Next */}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#00373E]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isRTL ? <ChevronLeft size={16} className="text-[#00373E]" /> : <ChevronRight size={16} className="text-[#00373E]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

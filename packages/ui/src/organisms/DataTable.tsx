import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Columns,
  Search,
  X,
  SlidersHorizontal,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../atoms/Button';
import { EmptyState } from '../atoms/EmptyState';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { Badge } from '../atoms/Badge';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  pagination?: DataTablePagination;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  exportable?: boolean;
  exportFilename?: string;
  bulkActions?: React.ReactNode;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  expandable?: boolean;
  renderExpanded?: (row: T) => React.ReactNode;
  filterable?: boolean;
  onFilter?: (filters: Record<string, string>) => void;
  filters?: Record<string, string>;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  pagination,
  onPageChange,
  onSort,
  sortKey,
  sortDirection,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  className,
  searchable = false,
  onSearch,
  searchValue = '',
  exportable = false,
  exportFilename = 'export',
  bulkActions,
  selectedRows,
  onSelectionChange,
  expandable = false,
  renderExpanded,
  filterable = false,
  onFilter,
  filters = {},
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
}: DataTableProps<T>) => {
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters);

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible !== false),
    [columns]
  );

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  const toggleSort = (key: string) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(new Set(data.map((row) => keyExtractor(row))));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange || !selectedRows) return;
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    const empty: Record<string, string> = {};
    setLocalFilters(empty);
    onFilter?.(empty);
  };

  const exportCSV = () => {
    const headers = visibleColumns.map((c) => c.label);
    const rows = data.map((row) =>
      visibleColumns.map((col) => {
        const val = col.render ? undefined : row[col.key];
        const display = val !== undefined ? String(val).replace(/"/g, '""') : '';
        return `"${display}"`;
      })
    );
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSortIcon = (key: string) => {
    if (!onSort) return null;
    if (sortKey !== key) return <ChevronsUpDown size={14} className="text-gray-300" />;
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-[#0A5A64]" />
    ) : (
      <ChevronDown size={14} className="text-[#0A5A64]" />
    );
  };

  const hasFilters = Object.values(localFilters).some((v) => v !== '');

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      {(searchable || exportable || filterable || bulkActions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {bulkActions && selectedRows && selectedRows.size > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {selectedRows.size} selected
              </span>
            )}
            {bulkActions}
          </div>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            {searchable && (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-48 lg:w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D0E4E6] focus:border-[#0A5A64] transition-all"
                />
                {localSearch && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            {filterable && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<SlidersHorizontal size={16} />}
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={cn(hasFilters && 'text-[#0A5A64]')}
                >
                  Filters
                  {hasFilters && (
                    <Badge variant="success" size="sm" className="ml-1">
                      {Object.values(localFilters).filter((v) => v !== '').length}
                    </Badge>
                  )}
                </Button>
                {filterMenuOpen && (
                  <div className="absolute right-0 mt-1 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">Filters</span>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-[#0A5A64] hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {columns
                      .filter((c) => c.filterable)
                      .map((col) => (
                        <div key={col.key} className="mb-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {col.label}
                          </label>
                          {col.filterType === 'select' && col.filterOptions ? (
                            <select
                              value={localFilters[col.key] || ''}
                              onChange={(e) => handleFilterChange(col.key, e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D0E4E6]"
                            >
                              <option value="">All</option>
                              {col.filterOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={localFilters[col.key] || ''}
                              onChange={(e) => handleFilterChange(col.key, e.target.value)}
                              placeholder={`Filter ${col.label}...`}
                              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D0E4E6]"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon={<Columns size={16} />}
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              >
                Columns
              </Button>
              {columnMenuOpen && (
                <div className="absolute right-0 mt-1 z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={col.visible !== false}
                        onChange={() => {
                          col.visible = col.visible === false ? true : false;
                          setColumnMenuOpen(false);
                        }}
                        className="rounded border-gray-300 text-[#0A5A64] focus:ring-[#00373E]"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {exportable && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Download size={16} />}
                onClick={exportCSV}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onSelectionChange && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && selectedRows?.size === data.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#0A5A64] focus:ring-[#00373E]"
                  />
                </th>
              )}
              {expandable && <th className="px-4 py-3 w-10" />}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    'rtl:text-right'
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && renderSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {onSelectionChange && <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>}
                  {expandable && <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>}
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{ width: `${50 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (onSelectionChange ? 1 : 0) + (expandable ? 1 : 0)}
                  className="px-4"
                >
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyMessage}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = keyExtractor(row);
                const isExpanded = expandedRows.has(rowId);
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={cn(
                        'transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-[#D0E4E6]',
                        idx % 2 === 1 && 'bg-gray-50/50'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {onSelectionChange && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRows?.has(rowId) || false}
                            onChange={() => handleSelectRow(rowId)}
                            className="rounded border-gray-300 text-[#0A5A64] focus:ring-[#00373E]"
                          />
                        </td>
                      )}
                      {expandable && (
                        <td
                          className="px-4 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRows((prev) => {
                              const next = new Set(prev);
                              if (next.has(rowId)) next.delete(rowId);
                              else next.add(rowId);
                              return next;
                            });
                          }}
                        >
                          <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                            <ChevronRightIcon
                              size={16}
                              className={cn(
                                'text-gray-400 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                            />
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap rtl:text-right"
                        >
                          {col.render ? col.render(row, idx) : row[col.key] ?? '-'}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && renderExpanded && (
                      <tr>
                        <td
                          colSpan={visibleColumns.length + (onSelectionChange ? 1 : 0) + 1}
                          className="px-6 py-4 bg-gray-50 border-b border-gray-100"
                        >
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {pagination.pageSize * (pagination.page - 1) + 1}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total}
            </span>
            {onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#D0E4E6]"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(pagination.page - 3, totalPages - 5));
              const pageNum = start + i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      pageNum === pagination.page
                      ? 'bg-[#00373E] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

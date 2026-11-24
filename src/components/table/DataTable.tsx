import { useState, useMemo, useCallback, useEffect } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export type Column<T> = {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSort?: (key: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  emptyMessage?: string;
  className?: string;
};

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

const alignClass = (align?: Column<unknown>['align']) =>
  align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right';

export default function DataTable<T>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  loading = false,
  onPageChange,
  onLimitChange,
  onSort,
  searchable = false,
  searchPlaceholder = 'جستجو...',
  onSearch,
  emptyMessage = 'رکوردی یافت نشد',
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [limitOpen, setLimitOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchTerm, 800);

  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (limitOpen && !target?.closest('[data-limit-dropdown]')) {
        setLimitOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [limitOpen]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key as keyof T];
        return val != null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSortClick = (key: string) => {
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    onSort?.(key);
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  if (loading) {
    return (
      <div className={className}>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="h-9 w-64 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-9 w-32 animate-pulse rounded-xl bg-surface-2" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-5 py-4">
                <div className="h-4 flex-1 animate-pulse rounded-md bg-surface-2" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-surface-2" />
                <div className="h-4 w-16 animate-pulse rounded-md bg-surface-2" />
                <div className="h-4 w-20 animate-pulse rounded-md bg-surface-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      {(searchable || onLimitChange) && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-3 shadow-lg shadow-black/10 dark:shadow-black/30 md:flex-row md:items-center md:justify-between">
          {searchable ? (
            <div className="group relative w-full md:max-w-sm">
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                className="h-10 w-full rounded-xl border border-border bg-surface pr-10 pl-9 text-sm text-fg caret-primary outline-none transition-all placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.16)]"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    onSearch?.('');
                  }}
                  className="absolute left-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-fg"
                  aria-label="پاک کردن جستجو"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-surface px-3 py-2 text-xs font-medium text-muted">
              {total.toLocaleString('fa-IR')} مورد
            </span>
            {onLimitChange && (
              <div className="relative" data-limit-dropdown onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setLimitOpen(!limitOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-gradient-to-b from-card-from to-card-to shadow-sm shadow-black/5 dark:shadow-black/10 px-3 py-2 text-sm text-fg transition-all hover:shadow-md hover:shadow-black/15 dark:hover:shadow-black/40 focus:outline-none focus:border-primary"
                >
                  <span>{limit.toLocaleString('fa-IR')} مورد</span>
                  <svg className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${limitOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {limitOpen && (
                  <div className="absolute z-50 top-full left-0 min-w-[160px] max-w-[200px] rounded-xl border border-border bg-surface shadow-lg shadow-black/20 dark:shadow-black/50 overflow-hidden animate-pop-in">
                    {[10, 25, 50, 100].map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          onLimitChange(l);
                          setLimitOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                          l === limit
                            ? 'bg-gradient-to-b from-primary/[0.10] to-primary/[0.04] text-primary'
                            : 'text-fg-soft hover:bg-surface-2 hover:text-fg'
                        }`}
                      >
                        <span>{l.toLocaleString('fa-IR')} مورد در صفحه</span>
                        {l === limit && (
                          <svg className="ml-auto h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-right">
            <thead>
              <tr className="border-b border-border bg-gradient-to-b from-card-from to-card-to">
                {columns.map((col) => {
                  const active = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted ${alignClass(col.align)} ${col.className || ''}`}
                    >
                      {onSort && col.sortable ? (
                        <button
                          onClick={() => handleSortClick(col.key)}
                          className={`inline-flex items-center gap-1.5 transition-colors hover:text-fg ${
                            active ? 'text-primary' : ''
                          } ${col.align === 'center' ? 'justify-center' : ''}`}
                        >
                          {col.label}
                          <svg
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              active ? 'text-primary' : 'text-muted-soft'
                            } ${active && sortDir === 'desc' ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2.2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-5 5m5-5l5 5" />
                          </svg>
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={String((row as Record<string, unknown>).id ?? rowIndex)}
                    className="group transition-colors duration-150 odd:bg-transparent even:bg-fg/[0.02] hover:bg-primary/[0.06]"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 align-middle text-sm text-fg-soft ${alignClass(col.align)} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row[col.key as keyof T], row)
                          : ((row[col.key as keyof T] ?? '-') as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-2">
                        <svg className="h-6 w-6 text-muted-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-fg-soft">{emptyMessage}</p>
                        <p className="mt-1 text-xs text-muted-soft">برای مشاهده نتایج، فیلترها را تغییر دهید</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border bg-gradient-to-b from-surface to-card-to px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
                className="flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-xs font-medium text-fg-soft transition-all hover:border-primary hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-soft"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                قبلی
              </button>

              <span className="min-w-[64px] text-center text-xs font-semibold text-muted sm:hidden">
                {page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}
              </span>

              {pageList(page, totalPages).map((p, index) =>
                p === '…' ? (
                  <span key={`gap-${index}`} className="hidden px-1.5 text-xs text-muted-soft sm:inline">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`hidden h-9 min-w-[36px] rounded-xl px-2 text-xs font-semibold transition-all sm:inline-flex ${
                      p === page
                        ? 'bg-gradient-to-b from-primary to-primary-600 text-fg shadow-lg shadow-[rgb(var(--primary-rgb)/0.35)]'
                        : 'border border-border text-muted hover:border-primary hover:text-fg'
                    }`}
                  >
                    {p.toLocaleString('fa-IR')}
                  </button>
                )
              )}

              <button
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
                className="flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-xs font-medium text-fg-soft transition-all hover:border-primary hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-soft"
              >
                بعدی
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="text-center text-xs font-medium text-muted sm:text-right">
              نمایش <span className="text-fg-soft">{rangeStart.toLocaleString('fa-IR')}</span> تا{' '}
              <span className="text-fg-soft">{rangeEnd.toLocaleString('fa-IR')}</span> از{' '}
              <span className="text-fg-soft">{total.toLocaleString('fa-IR')}</span> مورد
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

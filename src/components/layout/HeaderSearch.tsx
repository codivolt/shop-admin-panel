import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../services/api';

type SearchResult = {
  type: 'product' | 'category' | 'brand' | 'user' | 'order';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

type SearchRow = {
  type: SearchResult['type'];
  result: SearchResult;
  index: number;
};

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  product: 'محصول',
  category: 'دسته‌بندی',
  brand: 'برند',
  user: 'کاربر',
  order: 'سفارش',
};

const TYPE_ICON: Record<SearchResult['type'], string> = {
  product: 'M19 21V5a2 2 0 00-2-2H4a2 2 0 00-2 2v16l4-2h14l4 2z',
  category: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 012-2V7z',
  brand: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2',
  order: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
};

const GROUP_ORDER: SearchResult['type'][] = ['product', 'category', 'brand', 'order', 'user'];

const GROUP_LABEL: Record<SearchResult['type'], string> = {
  product: 'محصولات',
  category: 'دسته‌بندی‌ها',
  brand: 'برندها',
  order: 'سفارشات',
  user: 'کاربران',
};

const TYPE_THEME: Record<SearchResult['type'], string> = {
  product: 'from-primary/20 to-primary/[0.04] text-primary',
  category: 'from-secondary/20 to-secondary/[0.04] text-secondary',
  brand: 'from-accent/20 to-accent/[0.04] text-accent',
  order: 'from-emerald-500/20 to-emerald-500/[0.04] text-emerald-500',
  user: 'from-violet-500/20 to-violet-500/[0.04] text-violet-500',
};

const kbdClass =
  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-border bg-surface px-1 text-[10px] font-semibold leading-none text-muted-soft shadow-sm shadow-black/5';

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const trimmed = query.trim();

    if (trimmed) {
      setOpen(true);
      setLoading(true);
      setActiveIndex(-1);
      timer = setTimeout(async () => {
        try {
          const res = await api.get<SearchResult[]>('/search', {
            params: { q: trimmed },
          });
          setResults(res.data ?? []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 150);
    } else {
      setResults([]);
      setLoading(false);
      setOpen(false);
      setActiveIndex(-1);
    }

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setResults([]);
        setLoading(false);
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResults([]);
        setLoading(false);
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const grouped = useMemo(() => {
    const buckets = new Map<SearchResult['type'], SearchResult[]>();
    GROUP_ORDER.forEach((type) => buckets.set(type, []));
    results.forEach((result) => buckets.get(result.type)!.push(result));
    return Array.from(buckets.entries()).filter(([, items]) => items.length > 0);
  }, [results]);

  const rows = useMemo<SearchRow[]>(() => {
    const out: SearchRow[] = [];
    let index = 0;
    for (const [type, items] of grouped) {
      for (const result of items) {
        out.push({ type, result, index: index++ });
      }
    }
    return out;
  }, [grouped]);

  const activeResult = activeIndex >= 0 ? rows[activeIndex]?.result : null;

  const resetSearch = () => {
    setResults([]);
    setLoading(false);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleResultClick = (href: string) => {
    navigate(href);
    setQuery('');
    resetSearch();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      resetSearch();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev >= rows.length - 1 ? prev : prev + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? -1 : prev - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = activeResult ?? results[0];
      if (target) {
        handleResultClick(target.href);
      }
    }
  };

  return (
    <div className="relative hidden lg:block">
      <div className="header-search-wrap">
        <span className="header-search-sheen" />
        <svg
          className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="جستجو در پنل…"
          className="header-search-input"
          aria-label="جستجو"
          aria-controls="header-search-dropdown"
          aria-expanded={open}
          autoComplete="off"
        />
        <kbd className="header-search-kbd">⌘K</kbd>
      </div>

      {open && (
        <div
          id="header-search-dropdown"
          ref={dropdownRef}
          role="listbox"
          aria-label="نتایج جستجو"
          className="absolute right-0 top-full z-[60] mt-2 w-[30rem] max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-2xl border border-border bg-surface text-right shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.03] animate-pop-in dark:shadow-[0_28px_64px_-20px_rgba(0,0,0,0.85)] dark:ring-white/[0.04]"
        >
          {results.length > 0 && !loading && (
            <div className="flex items-center justify-between gap-2 border-b border-border bg-primary/[0.05] px-4 py-2.5">
              <span className="truncate text-[11px] font-semibold text-fg-soft">
                {rows.length.toLocaleString('fa-IR')} نتیجه برای «{query.trim()}»
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-muted">آماده</span>
              </span>
            </div>
          )}

          {loading ? (
            <div className="space-y-1 p-2">
              {[0, 1, 2].map((i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-surface-2" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div
                      className="h-3 animate-pulse rounded-full bg-surface-2"
                      style={{ width: `${62 - i * 10}%` }}
                    />
                    <div
                      className="h-2.5 animate-pulse rounded-full bg-surface-2"
                      style={{ width: `${40 - i * 6}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-2 to-surface text-muted ring-1 ring-inset ring-border">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent" />
                <svg
                  className="relative z-10 h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <p className="mt-1 text-sm font-bold text-fg">نتیجه‌ای یافت نشد</p>
              <p className="max-w-[18rem] text-[12px] leading-relaxed text-muted">
                برای «{query.trim()}» چیزی پیدا نشد؛ عبارت دیگری را امتحان کنید.
              </p>
            </div>
          ) : (
            <div className="scroll-slim max-h-[min(70vh,26rem)] overflow-y-auto p-2">
              {rows.map((row, i) => {
                const isGroupStart = i === 0 || rows[i - 1].type !== row.type;
                const isActive = activeIndex === row.index;
                const theme = TYPE_THEME[row.type];
                return (
                  <div key={`row-${row.index}`}>
                    {isGroupStart && (
                      <div className="flex items-center gap-2 px-2 pb-1.5 pt-3 first:pt-1">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${theme}`}
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d={TYPE_ICON[row.type]} />
                          </svg>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-soft">
                          {GROUP_LABEL[row.type]}
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-l from-border/80 to-transparent" />
                      </div>
                    )}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        handleResultClick(row.result.href);
                      }}
                      onMouseEnter={() => setActiveIndex(row.index)}
                      onMouseLeave={() =>
                        setActiveIndex((prev) => (prev === row.index ? -1 : prev))
                      }
                      role="option"
                      aria-selected={isActive}
                      className={`group/row relative flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all duration-150 animate-fade-in ${
                        isActive
                          ? 'bg-gradient-to-l from-primary/[0.10] via-primary/[0.04] to-transparent ring-1 ring-inset ring-primary/25'
                          : 'hover:bg-surface-2'
                      }`}
                      style={{ animationDelay: `${Math.min(i, 8) * 18}ms` }}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset transition-transform duration-200 ${theme} ${
                          isActive ? 'scale-105 ring-primary/20' : 'ring-border'
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={TYPE_ICON[row.type]} />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold leading-tight text-fg">
                          {row.result.title}
                        </span>
                        {row.result.subtitle && (
                          <span className="mt-1 block truncate text-[11px] leading-tight text-muted">
                            {row.result.subtitle}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted transition-colors group-hover/row:text-fg-soft">
                          {TYPE_LABEL[row.type]}
                        </span>
                        <svg
                          className={`h-3.5 w-3.5 text-primary transition-all duration-200 ${
                            isActive ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-2 px-4 py-2">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                <kbd className={kbdClass}>↵</kbd>
                <span>انتخاب</span>
                <span className="mx-0.5 h-3 w-px bg-border" />
                <kbd className={kbdClass}>↑</kbd>
                <kbd className={kbdClass}>↓</kbd>
                <span>جابه‌جایی</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                <kbd className={kbdClass}>Esc</kbd>
                <span>بستن</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

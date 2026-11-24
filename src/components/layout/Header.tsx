import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/authSlice';
import { useQuery } from '@tanstack/react-query';
import ThemeToggle from '../ThemeToggle';
import { api } from '../../services/api';

type HeaderProps = {
  onOpenSidebar: () => void;
};

type PageMeta = {
  title: string;
  subtitle: string;
  icon: string;
  match: (path: string) => boolean;
};

const pageMeta: PageMeta[] = [
  {
    title: 'داشبورد',
    subtitle: 'نمای کلی فروشگاه',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3',
    match: (p) => p === '/' || p.startsWith('/dashboard'),
  },
  {
    title: 'افزودن محصول',
    subtitle: 'ایجاد محصول جدید',
    icon: 'M12 4v16m8-8H4',
    match: (p) => p === '/products/add',
  },
  {
    title: 'ویرایش محصول',
    subtitle: 'به‌روزرسانی اطلاعات محصول',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    match: (p) => /^\/products\/[^/]+\/edit$/.test(p),
  },
  {
    title: 'محصولات',
    subtitle: 'مدیریت کاتالوگ محصولات',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    match: (p) => p.startsWith('/products'),
  },
  {
    title: 'افزودن دسته‌بندی',
    subtitle: 'ساخت ساختار دسته جدید',
    icon: 'M12 4v16m8-8H4',
    match: (p) => p === '/categories/add',
  },
  {
    title: 'ویرایش دسته‌بندی',
    subtitle: 'به‌روزرسانی دسته‌بندی',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    match: (p) => /^\/categories\/[^/]+\/edit$/.test(p),
  },
  {
    title: 'دسته‌بندی‌ها',
    subtitle: 'ساختار درختی دسته‌ها',
    icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 012-2V7z',
    match: (p) => p.startsWith('/categories'),
  },
  {
    title: 'ویژگی‌ها',
    subtitle: 'ویژگی‌های دسته‌بندی',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    match: (p) => p.startsWith('/category-attributes'),
  },
  {
    title: 'برندها',
    subtitle: 'مدیریت برندها',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    match: (p) => p.startsWith('/brands'),
  },
  {
    title: 'افزودن کاربر',
    subtitle: 'ایجاد حساب کاربری',
    icon: 'M12 4v16m8-8H4',
    match: (p) => p === '/users/add',
  },
  {
    title: 'ویرایش کاربر',
    subtitle: 'به‌روزرسانی حساب کاربری',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    match: (p) => /^\/users\/[^/]+\/edit$/.test(p),
  },
  {
    title: 'کاربران',
    subtitle: 'مدیریت کاربران سیستم',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    match: (p) => p.startsWith('/users'),
  },
  {
    title: 'سفارشات',
    subtitle: 'پیگیری سفارش‌ها',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    match: (p) => p.startsWith('/orders'),
  },
  {
    title: 'اعلان‌ها',
    subtitle: 'رویدادهای اخیر فروشگاه',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    match: (p) => p.startsWith('/notifications'),
  },
  {
    title: 'روش‌های ارسال',
    subtitle: 'مدیریت روش‌های ارسال کالا',
    icon: 'M4 7v10l8 4M4 7l8-4m8 4v10M12 7V3m0 14l-8-4 8-4',
    match: (p) => p.startsWith('/delivery'),
  },
];

type SearchResult = {
  type: 'product' | 'category' | 'brand' | 'user' | 'order';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
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

type SearchRow = {
  type: SearchResult['type'];
  result: SearchResult;
  index: number;
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return (res.data as number) ?? 0;
    },
    refetchInterval: 10000,
  });

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

  const handleResultClick = (href: string) => {
    navigate(href);
    setQuery('');
    setResults([]);
    setLoading(false);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setResults([]);
      setLoading(false);
      setOpen(false);
      setActiveIndex(-1);
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

  const meta = pageMeta.find((item) => item.match(location.pathname)) ?? pageMeta[0];
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'کاربر سیستم';
  const roleLabel = user?.role === 'admin' ? 'مدیر سیستم' : 'کاربر سیستم';

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    []
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-glow">
        <div className="absolute -top-40 right-[-10%] h-64 w-80 rounded-full bg-[rgb(var(--primary-rgb)/0.08)] blur-[100px]" />
        <div className="absolute -top-24 left-[-8%] h-48 w-64 rounded-full bg-[rgb(var(--secondary-rgb)/0.06)] blur-[80px]" />
      </div>

      <div className="header-border" />

      <div className="header-inner">
        {/* Mobile menu */}
        <button
          onClick={onOpenSidebar}
          className="relative overflow-hidden rounded-xl bg-gradient-to-b from-card-from to-card-to shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:shadow-lg active:scale-95 flex h-10 w-10 shrink-0 items-center justify-center text-fg-soft hover:text-fg md:hidden"
          aria-label="منو"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-xl" />
          <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page identity */}
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <div className="header-page-icon">
            <span className="header-page-icon-sheen" />
            <svg
              className="relative z-10 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={meta.icon} />
            </svg>
          </div>

          <div className="min-w-0">
            <h1 className="header-page-title">{meta.title}</h1>
            <p className="header-page-subtitle">{meta.subtitle}</p>
          </div>
        </div>

        {/* Search */}
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
                    <div
                      key={`skeleton-${i}`}
                      className="flex items-center gap-3 rounded-xl px-2.5 py-2.5"
                    >
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

        {/* Date */}
        <div className="header-date hidden xl:flex">
          <span className="header-date-sheen" />
          <svg className="relative z-10 h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="relative z-10">{today}</span>
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative overflow-hidden rounded-xl bg-gradient-to-b from-card-from to-card-to shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:shadow-lg active:scale-95 flex h-10 w-10 shrink-0 items-center justify-center text-fg-soft hover:text-fg md:h-11 md:w-11"
          aria-label="اعلان‌ها"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-xl" />
          <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" />
            <path d="M9 17a3 3 0 006 0" />
          </svg>
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          ) : null}
        </button>

        {/* User */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-card-from to-card-to shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:shadow-lg group flex hidden items-center gap-2.5 p-1 pl-3 sm:flex">
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-xl" />
          <div className="header-avatar">
            <span className="header-avatar-sheen" />
            <span className="relative z-10">{displayName.charAt(0)}</span>
            <span className="header-avatar-dot" />
          </div>
          <div className="relative z-10 hidden min-w-0 text-right sm:block">
            <div className="max-w-[9rem] truncate text-[13px] font-semibold leading-tight text-fg">
              {displayName}
            </div>
            <div className="text-[10px] leading-tight text-muted">{roleLabel}</div>
          </div>
          <svg className="relative z-10 hidden h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 group-hover:translate-y-0.5 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="relative overflow-hidden rounded-xl bg-gradient-to-b from-card-from to-card-to shadow-md shadow-black/10 dark:shadow-black/30 transition-all hover:shadow-lg active:scale-95 group flex h-10 shrink-0 items-center gap-2 px-3.5 text-sm font-semibold text-fg-soft hover:text-fg md:h-11 md:px-4"
          title="خروج از حساب"
        >
          <span className="pointer-events-none absolute inset-0 translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:-translate-x-full" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-xl" />
          <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
          </svg>
          <span className="relative z-10 hidden sm:inline">خروج</span>
        </button>
      </div>

      <div className="header-bottom-border" />
    </header>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/authSlice';
import { findPageMeta } from '../../lib/page-meta';
import { api } from '../../services/api';
import ThemeToggle from '../ThemeToggle';
import HeaderSearch from './HeaderSearch';

type HeaderProps = {
  onOpenSidebar: () => void;
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return (res.data as number) ?? 0;
    },
    refetchInterval: 10000,
  });

  const meta = findPageMeta(location.pathname);
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

        <HeaderSearch />

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

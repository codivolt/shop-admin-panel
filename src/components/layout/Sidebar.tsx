import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/authSlice';
import { PERMISSIONS } from '../../constants';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type NavItem = { path: string; label: string; icon: string; permission?: string | string[] };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'منوی اصلی',
    items: [
      { path: '/dashboard', label: 'داشبورد', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3' },
    ],
  },
{
    title: 'فروشگاه',
    items: [
      { path: '/products', label: 'محصولات', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', permission: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.PRODUCTS_DELETE] },
      { path: '/featured-products', label: 'محصولات پیشنهادی', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', permission: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_UPDATE] },
      { path: '/categories', label: 'دسته‌بندی‌ها', icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 012-2V7z', permission: [PERMISSIONS.CATEGORIES_VIEW, PERMISSIONS.CATEGORIES_CREATE, PERMISSIONS.CATEGORIES_UPDATE, PERMISSIONS.CATEGORIES_DELETE] },
      { path: '/category-attributes', label: 'ویژگی‌ها', icon: 'M13 10V3L4 14h7v7l9-11h-7z', permission: [PERMISSIONS.CATEGORIES_ATTRIBUTES_VIEW, PERMISSIONS.CATEGORIES_ATTRIBUTES_CREATE, PERMISSIONS.CATEGORIES_ATTRIBUTES_UPDATE, PERMISSIONS.CATEGORIES_ATTRIBUTES_DELETE] },
      { path: '/brands', label: 'برندها', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', permission: [PERMISSIONS.BRANDS_VIEW, PERMISSIONS.BRANDS_CREATE, PERMISSIONS.BRANDS_UPDATE] },
      { path: '/orders', label: 'سفارشات', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permission: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ORDERS_DELETE] },
      { path: '/discounts', label: 'کدهای تخفیف', icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z', permission: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.PRODUCTS_DELETE] },
      { path: '/notifications', label: 'اعلان‌ها', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', permission: [PERMISSIONS.NOTIFICATIONS_VIEW, PERMISSIONS.NOTIFICATIONS_UPDATE] },
      { path: '/delivery', label: 'روش‌های ارسال', icon: 'M4 7v10l8 4M4 7l8-4m8 4v10M12 7V3m0 14l-8-4 8-4', permission: [PERMISSIONS.DELIVERY_VIEW, PERMISSIONS.DELIVERY_CREATE, PERMISSIONS.DELIVERY_UPDATE, PERMISSIONS.DELIVERY_DELETE] },
      { path: '/payment-accounts', label: 'روش‌های پرداخت', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2v-4h2v4zm2-11V2h-2v2h-4V2H6v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9-2-2V6c0-1.1-.9-2-2-2', permission: [PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_CREATE, PERMISSIONS.PAYMENTS_UPDATE, PERMISSIONS.PAYMENTS_DELETE] },
    ],
  },
  {
    title: 'مدیریت',
    items: [
      { path: '/users', label: 'کاربران', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z', permission: PERMISSIONS.USERS_VIEW },
      { path: '/referral', label: 'رفرال', icon: 'M13.82 13.82a1 1 0 011.415 0l3 3a1 1 0 01-1.414 1.415l-3-3a1 1 0 010-1.415zM2.39 12c0-4.418 2.52-8.104 6.002-9.67a4 4 0 012.496 1.19A7.972 7.972 0 0121.61 12c0 4.419-2.52 8.105-6.002 9.67a4 4 0 01-2.496-1.19 7.97 7.97 0 01-6.212 0z', permission: PERMISSIONS.USERS_VIEW },
      { path: '/permissions', label: 'دسترسی‌ها', icon: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z' },
    ],
  },
];

const matches = (pathname: string, path: string) => {
  if (path === '/categories') return pathname === path || pathname.startsWith('/categories/');
  if (path === '/users') return pathname === path || pathname.startsWith('/users/');
  return pathname === path || pathname.startsWith(`${path}/`);
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'super_admin';

  const visibleGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        !item.permission ||
        isSuperAdmin ||
        (Array.isArray(item.permission)
          ? item.permission.some((p) => userPermissions.includes(p))
          : userPermissions.includes(item.permission)),
    ),
  }));

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'کاربر سیستم';
  const roleLabel = user?.role === 'admin' ? 'مدیر سیستم' : 'کاربر سیستم';

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`sidebar-backdrop ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`sidebar translate-x-0 sidebar-enter`}
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
        aria-hidden={!open}
      >
        <div className="splash-rule absolute inset-x-0 top-0 z-10" />

        {/* Decorative glows */}
        <div className="sidebar-glow -top-24 right-0 h-56 w-56 bg-[rgb(var(--primary-rgb)/0.10)]" />
        <div className="sidebar-glow bottom-0 left-0 h-48 w-48 bg-[rgb(var(--secondary-rgb)/0.08)]" />

        {/* Brand */}
        <div className="sidebar-brand">
          <Link to="/dashboard" onClick={onClose} className="sidebar-brand-link">
            <div className="sidebar-brand-mark">
              <img
                src="/rollchi-logo.webp"
                alt="لوگوی رولچی"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="sidebar-brand-text-wrap">
              <div className="sidebar-brand-name">رولچی</div>
              <div className="sidebar-brand-sub">پنل مدیریت</div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted transition-colors hover:bg-border hover:text-fg md:hidden"
            aria-label="بستن منو"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-scroll">
            {visibleGroups.map((group) => (
              <div key={group.title} className="mb-4 last:mb-0">
                <div className="sidebar-group-label">
                  {group.title}
                </div>
                <div className="sidebar-group-items">
                  {group.items.map((item) => {
                    const active = matches(location.pathname, item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`sidebar-item group ${active ? 'sidebar-item-active-bg' : 'text-muted hover:bg-surface-2 hover:text-fg'}`}
                      >
                        {active && <span className="sidebar-item-indicator" />}
                        <span
                          className={`sidebar-item-icon-wrap ${active ? 'sidebar-item-icon-wrap-active' : 'sidebar-item-icon-wrap-inactive'}`}
                        >
                          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                          </svg>
                        </span>
                        <span className={`sidebar-item-label ${active ? 'sidebar-item-label-active' : ''}`}>{item.label}</span>
                        {active && (
                          <svg className="sidebar-item-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card hover:bg-surface-2/80">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fg-soft to-fg text-xs font-bold text-surface ring-1 ring-border">
              {displayName.charAt(0)}
              <span className="sidebar-user-status" />
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{displayName}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <button
              onClick={handleLogout}
              title="خروج از حساب"
              aria-label="خروج از حساب"
              className="sidebar-logout-btn hover:bg-[rgba(239,68,68,0.10)] hover:text-[#f87171]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          <p className="sidebar-version">نسخه ۱٫۰ · پنل مدیریت</p>
        </div>
      </aside>
    </>
  );
}

import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbProps = {
  items?: BreadcrumbItem[];
  className?: string;
};

function autoTrail(pathname: string): BreadcrumbItem[] {
  if (pathname === '/' || pathname.startsWith('/dashboard')) return [{ label: 'داشبورد' }];

  if (pathname === '/products/add') return [{ label: 'محصولات', to: '/products' }, { label: 'افزودن محصول' }];
  if (/^\/products\/[^/]+\/edit$/.test(pathname)) return [{ label: 'محصولات', to: '/products' }, { label: 'ویرایش محصول' }];
  if (pathname.startsWith('/products')) return [{ label: 'محصولات' }];

  if (pathname === '/categories/add') return [{ label: 'دسته‌بندی‌ها', to: '/categories' }, { label: 'افزودن دسته‌بندی' }];
  if (/^\/categories\/[^/]+\/edit$/.test(pathname)) return [{ label: 'دسته‌بندی‌ها', to: '/categories' }, { label: 'ویرایش دسته‌بندی' }];
  if (pathname.startsWith('/categories')) return [{ label: 'دسته‌بندی‌ها' }];

  if (pathname.startsWith('/category-attributes')) return [{ label: 'ویژگی‌ها' }];

  if (pathname === '/brands/add') return [{ label: 'برندها', to: '/brands' }, { label: 'افزودن برند' }];
  if (/^\/brands\/[^/]+\/edit$/.test(pathname)) return [{ label: 'برندها', to: '/brands' }, { label: 'ویرایش برند' }];
  if (pathname.startsWith('/brands')) return [{ label: 'برندها' }];

  if (pathname === '/users/add') return [{ label: 'کاربران', to: '/users' }, { label: 'افزودن کاربر' }];
  if (/^\/users\/[^/]+\/edit$/.test(pathname)) return [{ label: 'کاربران', to: '/users' }, { label: 'ویرایش کاربر' }];
  if (/^\/users\/[^/]+$/.test(pathname)) return [{ label: 'کاربران', to: '/users' }, { label: 'پروفایل کاربر' }];
  if (pathname.startsWith('/users')) return [{ label: 'کاربران' }];

  if (pathname.startsWith('/orders')) return [{ label: 'سفارشات' }];

  if (pathname.startsWith('/notifications')) return [{ label: 'اعلان‌ها' }];

  if (pathname.startsWith('/delivery')) return [{ label: 'روش‌های ارسال' }];

  if (pathname.startsWith('/permissions')) return [{ label: 'دسترسی‌ها' }];

  return [{ label: 'داشبورد' }];
}

const Chevron = () => (
  <svg className="h-3 w-3 shrink-0 text-muted-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const { pathname } = useLocation();
  const trail = items && items.length > 0 ? items : autoTrail(pathname);
  const isHome = trail.length === 1 && trail[0].label === 'داشبورد';

  return (
    <nav
      aria-label="مسیر صفحه"
      className={`inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-b from-card-from to-card-to px-3 py-2 shadow-lg shadow-black/10 dark:shadow-black/40 ${className || ''}`}
    >
      <Link
        to="/dashboard"
        aria-label="داشبورد"
        className={`flex shrink-0 items-center justify-center rounded-lg p-0.5 transition-colors ${
          isHome ? 'text-primary' : 'text-muted hover:text-primary'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
        </svg>
      </Link>

      {!isHome && trail.map((item, index) => {
        const isLast = index === trail.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            <Chevron />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="truncate text-xs font-medium text-muted transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={`truncate text-xs font-semibold ${
                  isLast ? 'text-fg' : 'text-muted'
                }`}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

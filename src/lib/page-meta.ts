export type PageMeta = {
  title: string;
  subtitle: string;
  icon: string;
  match: (path: string) => boolean;
};

const PAGE_META: PageMeta[] = [
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

export function findPageMeta(path: string): PageMeta {
  return PAGE_META.find((item) => item.match(path)) ?? PAGE_META[0];
}

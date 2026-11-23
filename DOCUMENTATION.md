# Admin Panel - پنل مدیریت فروشگاه (Vite + React 18)

## 📋 نمای کلی

پنل مدیریت برای کنترل کامل فروشگاه سیگار شامل: مدیریت محصولات، دسته‌بندی‌ها، سفارشات، کاربران، برندها، گزارشات و تنظیمات. با **Vite**، **React 18**، **React Router v7** و **Redux Toolkit** ساخته شده.

---

## 🛠 تکنولوژی‌های اصلی

| تکنولوژی | نسخه | کاربرد |
|------------|-------|--------|
| Vite | 5.4+ | Build Tool و Dev Server |
| React | 18.3.1 | کتابخانه UI |
| React Router | 7.18+ | Routing (Data APIs، Loaders) |
| TypeScript | 5.5+ | تایپ‌سفتی |
| Tailwind CSS | 3.4+ | استایل‌دهی (Classic Config) |
| Redux Toolkit | 2.14+ | State Management (Auth) |
| TanStack Query | 5.107+ | Server State، Caching، Mutations |
| Axios | 1.21+ | HTTP Client با Interceptor |
| React Hook Form | 7.92+ | Form Handling |
| Zod | 4.6+ | Schema Validation |
| vite-plugin-pwa | 2.0.0 | PWA / Service Worker |
| lucide-react | - | آیکون‌ها |

---

## 📁 ساختار پروژه

```
admin_panel/
├── public/
│   ├── manifest.json            # PWA Manifest (RTL، فارسی)
│   ├── pwa-192x192.png          # آیکون PWA
│   ├── pwa-512x512.png          # آیکون PWA
│   └── vite.svg                 # Favicon
├── src/
│   ├── components/
│   │   ├── ui/                  # Design System کامپوننت‌های پایه
│   │   │   ├── Button.tsx       # Button variants (primary، outline، ghost، danger)
│   │   │   ├── Input.tsx        # Input با Label، Error، Helper
│   │   │   ├── Select.tsx       # Selectnative
│   │   │   ├── CustomSelect.tsx # Select سفارشی
│   │   │   ├── Card.tsx         # Card، CardHeader، CardContent، CardFooter
│   │   │   ├── Table.tsx        # DataTable با Sort، Pagination، Selection
│   │   │   ├── Modal.tsx        # Modal، ModalHeader، ModalBody، ModalFooter
│   │   │   ├── Breadcrumb.tsx   # Breadcrumb navigation
│   │   │   └── ThemeToggle.tsx  # Toggle Dark/Light Mode
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx   # Layout اصلی (Sidebar + Header + Content)
│   │   │   ├── Sidebar.tsx      # منوی کناری (Collapsible، RTL)
│   │   │   ├── Header.tsx       # هدر بالا (User Menu، Notifications، Theme)
│   │   │   └── PageHeader.tsx   # Header صفحه (Title، Actions، Breadcrumb)
│   │   ├── orders/
│   │   │   ├── OrderMeta.tsx    # متا اطلاعات سفارش
│   │   │   └── OrderDetailModal.tsx # مودال جزئیات سفارش
│   │   └── form/
│   │       ├── Form.tsx         # Wrapper React Hook Form + Zod
│   │       └── Select.tsx       # Select در فرم
│   ├── pages/
│   │   ├── categories/
│   │   │   └── CategoriesPage.tsx # CRUD دسته‌بندی‌ها
│   │   ├── notifications/
│   │   │   └── NotificationsPage.tsx # مدیریت اعلان‌ها
│   │   ├── products/            # (در صورت وجود)
│   │   ├── orders/              # (در صورت وجود)
│   │   └── users/               # (در صورت وجود)
│   ├── hooks/
│   │   ├── useRedux.ts          # Typed Redux hooks
│   │   ├── useDebouncedValue.ts # Debounce utility
│   │   ├── useLogin.ts          # Login mutation
│   │   └── useLoginSchema.ts    # Zod schema برای Login
│   ├── services/
│   │   └── api.ts               # Axios instance + Interceptors (Auth، Error handling)
│   ├── store/
│   │   ├── index.ts             # Redux Store (configureStore)
│   │   ├── authSlice.ts         # Auth State (user، token، permissions، login/logout)
│   │   └── hooks.ts             # useAppDispatch، useAppSelector
│   ├── design-system/
│   │   └── tokens.ts            # Design Tokens (Colors، Spacing، Typography، Shadows)
│   ├── theme/
│   │   └── ThemeProvider.tsx    # Context برای Dark/Light Mode (localStorage)
│   ├── config.ts                # App Config (API URL، Pagination، ...)
│   ├── constants.ts             # Constants (Routes، Roles، Permissions)
│   ├── App.tsx                  # Root Component (Router، Providers، Routes)
│   ├── main.tsx                 # Entry Point (React 18 createRoot)
│   └── index.css                # Global Styles + Tailwind Directives
├── index.html                   # HTML Template (PWA meta، RTL، Manifest link)
├── vite.config.ts               # Vite Config + PWA Plugin + Proxy
├── tailwind.config.js           # Tailwind Config (RTL Plugin، Custom Theme)
├── postcss.config.cjs           # PostCSS Config
├── tsconfig.json                # TypeScript Config
├── tsconfig.node.json           # TS Config برای Node (Vite Config)
├── package.json
└── pnpm-workspace.yaml          # PNPM Workspace (Monorepo Ready)
```

---

## 🎨 Design System

### Tokens (`src/design-system/tokens.ts`)
```typescript
export const tokens = {
  colors: {
    primary: { 50: '#fff7ed', ..., 900: '#7c2d12' }, // Amber
    neutral: { 50: '#fafafa', ..., 950: '#030712' }, // Stone
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  typography: {
    fontFamily: { sans: 'Vazirmatn, system-ui, sans-serif' },
    fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  shadows: { sm: '0 1px 2px...', md: '0 4px 6px...', lg: '0 10px 15px...' },
};
```

### Theme (`src/theme/ThemeProvider.tsx`)
- **Dark/Light Mode** با `localStorage` persistence
- CSS Variables برای رنگ‌ها
- `ThemeToggle` در Header برای تغییر تم

### RTL Support
- `dir="rtl"` در `index.html` و `html` tag
- `tailwindcss-rtl` plugin
- کامپوننت‌ها با RTL در نظر گرفته شده (Margin/Padding logical properties)

---

## 🧭 Routing (React Router v7)

### Route Structure
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### Protected Routes
- `RequireAuth` کامپوننت در `MainLayout` wrapper
- چک `authSlice` برای user/token
- Redirect به `/login` در صورت عدم احراز هویت

---

## 🔐 احراز هویت (Authentication)

### Flow
1. **Login Page** (`/login`): فرم ورود با React Hook Form + Zod
2. **API Call**: `POST /auth/login` → دریافت `accessToken`، `refreshToken`
3. **Redux**: `authSlice` ذخیره user، tokens، permissions
4. **Axios Interceptor**: اضافه کردن `Authorization: Bearer <token>` به همه درخواست‌ها
5. **Token Refresh**: Interceptor در صورت 401، refresh token صدا زده و درخواست retry می‌شود

### فایل‌های کلیدی
- `src/pages/auth/LoginPage.tsx` - UI ورود
- `src/hooks/useLogin.ts` - Mutation login با TanStack Query
- `src/hooks/useLoginSchema.ts` - Zod Schema اعتبارسنجی
- `src/store/authSlice.ts` - Redux Slice (login، logout، setUser، setTokens)
- `src/services/api.ts` - Axios Instance + Interceptors (Request/Response)

---

## 📊 State Management

### Redux (Client State)
- **Store**: `src/store/index.ts` - `configureStore` با `authSlice`
- **Auth Slice**: `user`، `accessToken`، `refreshToken`، `permissions`، `roles`
- **Typed Hooks**: `useAppDispatch`، `useAppSelector` در `src/store/hooks.ts`

### TanStack Query (Server State)
- **QueryClient** در `App.tsx` Provider
- **Queries**: در هر Page/Hook (مثلاً `useCategories`، `useProducts`)
- **Mutations**: Create/Update/Delete با `useMutation` + `queryClient.invalidateQueries`
- **Cache**: `staleTime: 5분`، `gcTime: 10분` (پیش‌فرض)

---

## 🧩 کامپوننت‌های اصلی (UI Library)

### DataTable (`src/components/ui/DataTable.tsx`)
```tsx
<DataTable
  columns={columns}        // ColumnDef[] با accessor، header، cell، enableSorting
  data={data}              // T[]
  pagination={{ pageIndex, pageSize, onPaginationChange }}
  sorting={{ sorting, onSortingChange }}
  rowSelection={{ selectedRows, onRowSelectionChange }}
  onRowClick={handleRowClick}
/>
```
- Sorting، Pagination، Row Selection، Click Handler
- Loading/Empty States

### Modal System
- `Modal` - Portal-based، Focus Trap، ESC Close، Backdrop Click
- `ModalHeader`، `ModalBody`، `ModalFooter` - Compound Components

### Form Wrapper (`src/components/form/Form.tsx`)
```tsx
<Form
  schema={zodSchema}
  defaultValues={initialData}
  onSubmit={handleSubmit}
  fields={[
    { name: 'fieldName', label: 'برچسب', type: 'text' | 'select' | 'textarea', ... }
  ]}
/>
```
- Integrates React Hook Form + Zod Resolver
- Dynamic Fields از Config

---

## 📄 صفحات کلیدی

### CategoriesPage (`src/pages/categories/CategoriesPage.tsx`)
- **List**: DataTable با جستجو، صفحات‌بندی، مرتب‌سازی
- **Create/Edit**: Modal با Form (نام، اسلاگ، توضیحات، والد، ترتیب، آیکون، فعال)
- **Delete**: Confirm Modal
- **API**: TanStack Query Mutations + Invalidation

### NotificationsPage (`src/pages/notifications/NotificationsPage.tsx`)
- لیست اعلان‌ها با فیلتر نوع/وضعیت
- ایجاد/ویرایش اعلان (عنوان، متن، نوع، کاربران هدف، زمان‌بندی)
- Real-time Updates (WebSocket در صورت فعال)

---

## 🌐 API Integration (`src/services/api.ts`)

### Axios Instance Config
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
```

### Interceptors
- **Request**: اضافه کردن `Authorization` header از Redux
- **Response**: 
  - 401 → تلاش Refresh Token → Retry
  - 403 → Redirect به `/unauthorized` (در صورت وجود)
  - Global Error Toast (react-hot-toast)

### API Functions Pattern
```typescript
// در هر page/hook
const { data, isLoading } = useQuery({
  queryKey: ['categories', filters],
  queryFn: () => api.get('/categories', { params: filters }).then(r => r.data),
});
```

---

## 📱 PWA (Progressive Web App)

### تنظیمات (`vite.config.ts`)
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'فروشگاه سیگار - پنل مدیریت',
    short_name: 'پنل مدیریت',
    dir: 'rtl',
    lang: 'fa',
    theme_color: '#1f2937',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [...],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [{ urlPattern: /^https?.*/, handler: 'NetworkFirst', ... }],
  },
})
```

### فایل‌ها
- `public/manifest.json` - Manifest با RTL/فارسی
- `public/pwa-192x192.png`، `pwa-512x512.png` - آیکون‌ها
- `index.html` - `<link rel="manifest" href="/manifest.json" />`
- Build Output: `dist/sw.js`، `dist/workbox-*.js`، `dist/manifest.webmanifest`

---

## 🚀 اسکریپت‌ها

```bash
# Development (Port 3001)
pnpm dev

# Production Build
pnpm build

# Preview Production Build
pnpm preview

# Lint
pnpm lint
```

---

## ⚙️ متغیرهای محیطی (`.env` / `.env.local`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=فروشگاه سیگار - پنل مدیریت
```

---

## 🔧 Vite Config Highlights (`vite.config.ts`)

- **Plugins**: React، VitePWA
- **Alias**: `@` → `./src`
- **Server**: Port 3001، Proxy `/api` → `http://localhost:3000` (Backend)
- **Build**: TSC + Vite Build، Sourcemap، Chunk Splitting

---

## 📦 Deploy

### Static Hosting (Nginx/Apache/Vercel/Netlify)
```bash
pnpm build
# خروجی در dist/
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx Config (`nginx.conf`)
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # PWA Service Worker
  location /sw.js {
    add_header Cache-Control "no-cache";
  }
  
  # API Proxy (اختیاری)
  location /api/ {
    proxy_pass http://backend:3000/;
  }
}
```

---

## 📝 نکات توسعه

### Code Style
- **ESLint** + **Prettier** (Config در پروژه)
- **TypeScript Strict Mode**
- **Path Aliases**: `@/components`، `@/hooks`، `@/pages`، ...

### Performance
- **Code Splitting**: `React.lazy` + `Suspense` برای Pages
- **Memoization**: `React.memo`، `useMemo`، `useCallback` در کامپوننت‌های پرکاربرد
- **Virtualization**: برای لیست‌های بزرگ (در صورت نیاز)

### Accessibility (a11y)
- Semantic HTML
- ARIA Attributes در Modal، Table، Form
- Focus Management
- Color Contrast (Design Tokens)

### Testing (Recommended)
- **Vitest** + **React Testing Library** برای Unit/Integration
- **Playwright** برای E2E

---

## 🔗 Backend Integration

Backend در پوشه `../back` (NestJS):
- **Base URL**: `VITE_API_URL`
- **Auth**: JWT (Access + Refresh Token)
- **Endpoints**: `/auth`، `/categories`، `/products`، `/orders`، `/users`، `/notifications`، `/brands`، `/delivery`، ...
- **Swagger**: `http://localhost:3000/api/docs`

---

## 📚 منابع و مستندات

- [Vite](https://vitejs.dev/)
- [React Router v7](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Lucide React Icons](https://lucide.dev/)
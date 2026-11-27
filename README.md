# Shop Admin Panel (React + Vite)

Admin dashboard for the **Rolchi** e-commerce platform. Built with **React + Vite + TypeScript + Tailwind CSS**, Redux Toolkit, TanStack Query, React Hook Form + Zod, and a custom Jalali (Persian) date picker.

---

## 1. Tech Stack

| Concern | Choice |
| --- | --- |
| Build | Vite + TypeScript |
| UI | React 18, Tailwind CSS |
| State | Redux Toolkit (`react-redux`) + TanStack Query |
| Forms | `react-hook-form` + `zod` |
| HTTP | `axios` (wrapper `src/services/api.ts`) |
| Routing | `react-router-dom` |
| Toasts | `react-hot-toast` |
| Dates | `jalali-moment` (Jalali conversion) |
| PWA | `vite-plugin-pwa` (service worker precache) |

---

## 2. Structure

```
src/
├── main.tsx · App.tsx
├── index.css                # Tailwind + design tokens + animations (sheetUp/sheetDown/popIn/popOut)
├── services/api.ts          # axios instance + request/response interceptors
├── store/                   # Redux store + authSlice
├── hooks/                   # useRedux, useDebouncedValue, useLogin, ...
├── constants/               # PERMISSIONS
├── lib/                     # format.ts, jalali.ts, slugify.ts, image.ts
├── components/
│   ├── layout/              # MainLayout, Header, Sidebar, Modal, AccessDenied, PageHeader, Breadcrumb, Card
│   ├── table/               # DataTable (search w/ 500ms debounce, sort, pagination, responsive)
│   ├── stats/               # StatCard, StatGrid
│   ├── input/               # Input, AmountInput, JalaliDatePicker, JalaliDateSheet
│   ├── form/ · button/ · orders/ · ...
└── pages/                   # feature pages (see below)
```

---

## 3. Environment Variables (`.env.local`)

| Key | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL (default `http://localhost:3000`) |

---

## 4. Scripts

```bash
pnpm install
pnpm run dev      # vite --host 0.0.0.0 --port 3002
pnpm run build    # tsc && vite build
pnpm run preview  # vite preview
pnpm run lint     # eslint .
```

---

## 5. Shared Components (use these, don’t duplicate)

- **`DataTable`** — table with toolbar search (500ms debounce), sorting, pagination, page-size dropdown, loading skeleton (toolbar stays mounted so input keeps focus), responsive horizontal scroll.
- **`Modal`** — accessible modal; on mobile opens as a **bottom sheet** (slide-up) and closes with slide-down; on desktop centered card. Backdrop closes only on direct click.
- **`JalaliDatePicker` + `JalaliDateSheet`** — iOS-style wheel date picker (year/month/day), Jalali calendar via `jalali-moment`; displays Jalali, returns Gregorian `YYYY-MM-DD` (no separators). Split into `lib/jalali.ts` (pure logic) + `JalaliDateSheet.tsx` (UI) + `JalaliDatePicker.tsx` (trigger).
- **`AmountInput`** — money input with thousands separators; `onChange` returns the raw number without separators.
- **`StatGrid` + `StatCard`** — responsive stats grid (`cols` 2–5).
- **`AccessDenied`** — shared “no access” card.
- **`PageHeader` / `Breadcrumb` / `Card` / `Button` / `Input` / `Select`** — layout & form primitives.

---

## 6. Utilities (`src/lib`)

- `format.ts`: `formatNumber`, `formatCurrency`, `formatDate`, `formatDateTime` (all `fa-IR`).
- `jalali.ts`: `toJalaliParts`, `toGregorianString`, `daysInJalaliMonth`, `formatJalali`, `JALALI_MONTHS` (uses `jalali-moment.useJalaliSystemPrimarily()`).
- `slugify.ts`: Persian→Latin transliteration for slugs.
- `image.ts`: image helpers.

---

## 7. Pages

Dashboard, Products (list/add/edit, multi-image gallery), Featured products, Categories (+ wizard), Category attributes, Brands, Orders (filters by status/payment, search by id/code/customer, customer snapshot), Audit logs, Discounts (Jalali expiry, amount inputs), Referral (tiers), Users (+ profile), Permissions, Notifications, Delivery, Payment accounts, Login, 404.

---

## 8. Key Behaviours

- **Server-down handling**: `services/api.ts` response interceptor detects network errors (`ERR_NETWORK`/`Network Error`), clears `token`/`user` from localStorage, redirects to `/login`, and shows a throttled “سرور در دسترس نیست” toast. `useLogin` no longer shows “wrong credentials” on network failure.
- **Search focus**: `DataTable` keeps the search input mounted during loading (skeleton only replaces table body) and debounces 500ms; per-page duplicate debounce removed.
- **Responsive**: sidebar is a slide-in drawer on mobile (fixed visible on desktop); header is sticky and opaque; modals are bottom sheets on mobile.
- **Permissions**: `PERMISSIONS` constants + route guards; sidebar filters items by role/permissions.

---

## 9. Conventions

- Reuse `components/*` and `lib/*`; do not inline repeated markup or re-implement formatting.
- Keep pages thin; extract repeated blocks into shared components.
- Amounts use `AmountInput`; dates use `JalaliDatePicker`; money/dates use `lib/format`.
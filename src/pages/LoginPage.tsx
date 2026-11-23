import Form from '../components/form/Form';
import Input from '../components/input/Input';
import Button from '../components/button/Button';
import ThemeToggle from '../components/ThemeToggle';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    title: 'مدیریت محصولات و دسته‌بندی‌ها',
    description: 'افزودن، ویرایش و سازمان‌دهی سریع کاتالوگ فروشگاه',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'پیگیری سفارش‌ها',
    description: 'بررسی وضعیت پرداخت و روند ارسال در یک نگاه',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: 'گزارش‌های لحظه‌ای',
    description: 'آمار فروش، کاربران و موجودی انبار به‌صورت زنده',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" />
      </svg>
    ),
  },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 shadow-lg shadow-[rgb(var(--primary-rgb)/0.35)] ${className || ''}`}>
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.18] to-transparent" />
      <svg
        className="relative z-10 h-1/2 w-1/2 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, errors, isLoading, onSubmit } = useLogin(() =>
    navigate('/dashboard', { replace: true })
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[rgb(var(--primary-rgb)/0.18)] blur-3xl" />
        <div className="absolute -left-28 top-1/3 h-80 w-80 rounded-full bg-[rgb(var(--secondary-rgb)/0.16)] blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-[rgb(var(--accent-rgb)/0.12)] blur-3xl" />
      </div>

      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-14 sm:px-6">
        <div className="grid w-full items-stretch gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Brand panel */}
          <div className="relative hidden overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card-from via-surface to-card-to p-10 shadow-2xl shadow-black/10 lg:flex lg:flex-col lg:justify-between dark:shadow-black/50">
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[rgb(var(--primary-rgb)/0.10)] blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <BrandMark className="h-11 w-11" />
                <div>
                  <p className="text-base font-bold tracking-tight text-fg">فروشگاه سیگار</p>
                  <p className="text-[11px] text-muted">پنل مدیریت فروشگاه</p>
                </div>
              </div>

              <h1 className="mt-12 text-3xl font-bold leading-tight tracking-tight text-fg">
                همه‌چیز برای اداره‌ی
                <br />
                <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                  فروشگاه شما
                </span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
                محصولات، دسته‌بندی‌ها، کاربران و سفارش‌ها را از یک داشبورد ساده و سریع مدیریت کنید.
              </p>
            </div>

            <ul className="relative mt-12 space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--primary-rgb)/0.12)] text-primary">
                    {feature.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form panel */}
          <div className="w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-auto">
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <BrandMark className="mb-4 h-14 w-14" />
              <p className="text-lg font-bold tracking-tight text-fg">فروشگاه سیگار</p>
              <p className="mt-1 text-xs text-muted">ورود به پنل مدیریت</p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card-from to-card-to shadow-2xl shadow-black/10 dark:shadow-black/50">
              <div className="p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">خوش آمدید</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    برای ادامه، شماره موبایل و رمز عبور حساب خود را وارد کنید.
                  </p>
                </div>

                <Form
                  methods={{
                    register,
                    handleSubmit,
                    formState: { errors },
                  } as any}
                  onSubmit={handleSubmit((data) => {
                    onSubmit(data);
                  })}
                >
                  <div className="space-y-5">
                    <Input
                      name="phone"
                      label="شماره موبایل"
                      type="tel"
                      placeholder="09123456789"
                      required
                      maxLength={11}
                      className="h-11 text-sm tracking-wide"
                      methods={{
                        register,
                        formState: { errors },
                      } as any}
                    />

                    <Input
                      name="password"
                      label="رمز عبور"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-11 text-sm"
                      methods={{
                        register,
                        formState: { errors },
                      } as any}
                    />

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      size="lg"
                      variant="primary"
                      className="mt-1 w-full"
                    >
                      ورود به سیستم
                    </Button>
                  </div>
                </Form>
              </div>

              <div className="border-t border-border bg-surface-2 px-6 py-4">
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                  <svg className="h-3.5 w-3.5 text-muted-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <path d="M8 7V5a4 4 0 118 0v2" />
                  </svg>
                  ارتباط شما با این پنل رمزنگاری‌شده است.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-soft">
              © {new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} فروشگاه سیگار — تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

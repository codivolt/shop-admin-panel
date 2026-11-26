import { Link } from 'react-router-dom';
import Button from '../components/button/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-surface p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b from-card-from to-card-to text-muted shadow-lg shadow-black/10 dark:shadow-black/30">
        <span className="text-3xl font-black">۴۰۴</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-fg">صفحه‌ای که دنبالش بودی پیدا نشد</h1>
        <p className="mt-2 text-sm text-muted">
          ممکن است آدرس را اشتباه وارد کرده باشی یا این صفحه حذف شده باشد.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            بازگشت به داشبورد
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" size="md">
            مشاهده محصولات
          </Button>
        </Link>
      </div>
    </div>
  );
}
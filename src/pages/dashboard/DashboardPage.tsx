import Card from '../../components/layout/Card';
import StatCard from '../../components/stats/StatCard';

import Breadcrumb from '../../components/layout/Breadcrumb';
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="فروش کلی"
          value={0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          color="primary"
        />
        <StatCard
          label="سفارشات جدید"
          value={0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M3 10h18M3 14h18m-9-4v8m-4 3h12a1 1 0 001-1v-6a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1" />
            </svg>
          }
          color="secondary"
        />
        <StatCard
          label="کاربران فعال"
          value={0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          color="accent"
        />
        <StatCard
          label="درآمد روزانه"
          value="0 تومان"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="neutral"
        />
      </div>

      <Card padding="lg" radius="xl" border="neutral-100">
        <h3 className="text-lg font-bold text-fg mb-6">آمار اخیر</h3>
        <div className="text-muted text-center py-20">
          آمار برای نمایش موجود نیست.
        </div>
      </Card>
    </div>
  );
}

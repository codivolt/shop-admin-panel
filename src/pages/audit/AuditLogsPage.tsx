import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import DataTable, { type Column } from '../../components/table/DataTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userPhone: string | null;
  userRole: string | null;
  method: string;
  path: string;
  statusCode: number | null;
  ip: string | null;
  createdAt: string;
}

const METHOD_COLORS: Record<string, string> = {
  POST: 'bg-emerald-500/10 text-emerald-500',
  PUT: 'bg-amber-500/10 text-amber-500',
  PATCH: 'bg-sky-500/10 text-sky-500',
  DELETE: 'bg-rose-500/10 text-rose-500',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['audit-logs', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });
      return res.data;
    },
  });

  const logs: AuditLog[] = data?.data ?? [];
  const total = data?.total ?? 0;

  const columns: Column<AuditLog>[] = [
    {
      key: 'user',
      label: 'کاربر',
      width: '26%',
      render: (_v, row) => (
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-fg">
            {row.userName || '—'}
          </div>
          <div className="text-[11px] text-muted" dir="ltr">
            {row.userPhone || row.userId || ''}
          </div>
          {row.userRole ? (
            <div className="mt-0.5 text-[10px] text-muted-soft">{row.userRole}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'method',
      label: 'عملیات',
      width: '12%',
      align: 'center',
      render: (value: string) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
            METHOD_COLORS[value] ?? 'bg-surface-2 text-muted'
          }`}
          dir="ltr"
        >
          {value}
        </span>
      ),
    },
    {
      key: 'path',
      label: 'مسیر',
      width: '34%',
      render: (value: string) => (
        <span className="block truncate font-mono text-[11px] text-muted" dir="ltr" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'statusCode',
      label: 'وضعیت',
      width: '10%',
      align: 'center',
      render: (value: number | null) => (
        <span className="text-xs text-muted">{value ?? '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'زمان',
      width: '18%',
      render: (value: string) => (
        <span className="text-[11px] text-muted">
          {new Date(value).toLocaleString('fa-IR')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <PageHeader
        title="گزارش فعالیت‌ها"
        description="تمام عملیات ثبت‌شده توسط کاربران و مدیران برای پیگیری و رفع مشکلات."
        actions={
          <Button variant="outline" size="md" onClick={() => refetch()} isLoading={isFetching && !isLoading}>
            به‌روزرسانی
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-surface p-4">
        <Input
          name="search"
          label="جستجو"
          placeholder="نام، شماره موبایل یا مسیر"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
          خطا در بارگذاری گزارش‌ها. دوباره تلاش کنید.
        </div>
      ) : (
        <DataTable<AuditLog>
          columns={columns}
          data={logs}
          total={total}
          page={page}
          limit={limit}
          totalPages={data?.totalPages ?? 1}
          loading={isLoading}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          emptyMessage="هنوز عملیاتی ثبت نشده است"
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}
        />
      )}
    </div>
  );
}
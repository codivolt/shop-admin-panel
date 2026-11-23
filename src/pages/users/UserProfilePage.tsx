import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import toast from 'react-hot-toast';

import Breadcrumb from '../../components/layout/Breadcrumb';
interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get<User>(`/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت حذف شد');
      navigate('/users');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کاربر');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-muted text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted">
        <p>کاربر یافت نشد</p>
        <Button variant="outline" onClick={() => navigate('/users')}>
          بازگشت به لیست کاربران
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-fg">پروفایل کاربر</h1>
          <p className="text-muted text-sm">
            اطلاعات کاربری {user.email}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
          <Link to={`/users/${id}/edit`}>
            <Button>ویرایش کاربر</Button>
          </Link>
          <Button variant="outline" onClick={() => navigate('/users')}>
            بازگشت به لیست
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            حذف کاربر
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md" radius="xl" border="neutral-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-secondary font-bold text-2xl">
                  {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-fg">
                {user.firstName || ''} {user.lastName || ''}
              </h2>
              <p className="text-muted text-sm">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-soft text-sm">
              <span className="w-20 font-medium text-muted">ایمیل</span>
              <span className="text-fg">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-soft text-sm">
              <span className="w-20 font-medium text-muted">تلفن</span>
              <span className="text-fg">{user.phone || 'ثبت نشده'}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-soft text-sm">
              <span className="w-20 font-medium text-muted">نقش</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  user.role === 'admin'
                    ? 'border-border-strong bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted'
                }`}
              >
                {user.role === 'admin' ? 'مدیر' : 'مشتری'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-soft text-sm">
              <span className="w-20 font-medium text-muted">وضعیت</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  user.isActive
                    ? 'border-border-strong bg-surface-2/20 text-secondary'
                    : 'border-border bg-surface text-muted'
                }`}
              >
                {user.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="md" radius="xl" border="neutral-100">
          <h3 className="mb-4 font-bold text-fg text-lg">آمار کاربر</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-muted text-sm font-medium">تاریخ عضویت</p>
                <p className="text-fg font-bold">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-muted text-sm font-medium">آخرین بروزرسانی</p>
                <p className="text-fg font-bold">{new Date(user.updatedAt).toLocaleDateString('fa-IR')}</p>
              </div>
              <span className="text-muted text-sm">↻</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="outline" onClick={() => navigate('/users')}>
          بازگشت به لیست کاربران
        </Button>
      </div>
    </div>
  );
}

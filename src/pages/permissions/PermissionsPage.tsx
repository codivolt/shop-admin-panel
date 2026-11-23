import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/button/Button';
import Modal from '../../components/layout/Modal';
import Select from '../../components/form/Select';
import { useAppSelector } from '../../hooks/useRedux';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: string;
}

type RoleKey = 'customer' | 'courier' | 'admin' | 'super_admin';
type RolePermissions = Record<string, string[]>;

const ROLES: { value: RoleKey; label: string; description: string }[] = [
  { value: 'customer', label: 'مشتری', description: 'کاربران عادی فروشگاه' },
  { value: 'courier', label: 'پیک', description: 'پیک‌های ارسال سفارش' },
  { value: 'admin', label: 'مدیر', description: 'مدیران پنل' },
  { value: 'super_admin', label: 'مدیر ارشد', description: 'دسترسی کامل به سیستم' },
];

const COMMON_ACTIONS: { value: string; label: string }[] = [
  { value: 'create', label: 'ایجاد (create)' },
  { value: 'read', label: 'مشاهده (read)' },
  { value: 'update', label: 'ویرایش (update)' },
  { value: 'delete', label: 'حذف (delete)' },
  { value: 'list', label: 'فهرست (list)' },
  { value: 'cancel', label: 'لغو (cancel)' },
  { value: 'approve', label: 'تایید (approve)' },
  { value: 'reject', label: 'رد (reject)' },
  { value: 'export', label: 'خروجی (export)' },
  { value: 'import', label: 'ورودی (import)' },
  { value: 'manage', label: 'مدیریت (manage)' },
];

const GROUP_LABELS: Record<string, string> = {
  products: 'محصولات',
  categories: 'دسته‌بندی‌ها',
  brands: 'برندها',
  orders: 'سفارش‌ها',
  users: 'کاربران',
  notifications: 'اعلان‌ها',
  settings: 'تنظیمات',
  permissions: 'دسترسی‌ها',
};

const groupLabel = (key: string) => {
  const prefix = key.split('.')[0];
  return GROUP_LABELS[prefix] ?? prefix;
};

const inputClass =
  'w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-[rgb(var(--primary-rgb)/0.18)]';

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const canEdit = currentRole === 'super_admin';

  const [role, setRole] = useState<RoleKey>('admin');
  const [selected, setSelected] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ group: '', action: '', name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await api.get<Permission[]>('/permissions');
      return res.data;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ['permissions', 'roles'],
    queryFn: async () => {
      const res = await api.get<RolePermissions>('/permissions/roles');
      return res.data;
    },
  });

  const permissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  );

  const assigned = useMemo(
    () => rolesQuery.data?.[role] ?? [],
    [rolesQuery.data, role],
  );

  useEffect(() => {
    setSelected(rolesQuery.data?.[role] ?? []);
  }, [rolesQuery.data, role]);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of permissions) {
      const group = permission.key.split('.')[0];
      const list = map.get(group) ?? [];
      list.push(permission);
      map.set(group, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const isDirty = useMemo(() => {
    const current = [...selected].sort().join('|');
    const saved = [...assigned].sort().join('|');
    return current !== saved;
  }, [selected, assigned]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/permissions/roles/${role}`, { permissionKeys: selected });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'roles'] });
      toast.success('دسترسی‌های نقش ذخیره شد');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره دسترسی‌ها');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const key = `${form.group.trim()}.${form.action.trim()}`;
      await api.post('/permissions', {
        key,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('ویژگی مجاز ایجاد شد');
      setAddOpen(false);
      setForm({ group: '', action: '', name: '', description: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد ویژگی مجاز');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', 'roles'] });
      toast.success('ویژگی مجاز حذف شد');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف ویژگی مجاز');
    },
  });

  const toggle = (key: string) => {
    if (!canEdit) return;
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const loading = permissionsQuery.isLoading || rolesQuery.isLoading;
  const failed = permissionsQuery.error || rolesQuery.error;

  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const group = form.group.trim();
    const action = form.action.trim();
    if (!group || !action || !form.name.trim()) {
      toast.error('گروه، اقدام و نام ویژگی الزامی است');
      return;
    }
    const key = `${group}.${action}`;
    if (!/^[a-z0-9_]+(\.[a-z0-9_]+)*$/i.test(key)) {
      toast.error('کلید باید به شکل group.action باشد');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="دسترسی‌ها"
        description="ویژگی‌های مجاز سیستم را مشاهده و برای هر نقش تعیین کنید."
        actions={
          canEdit ? (
            <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              ویژگی جدید
            </Button>
          ) : undefined
        }
      />

      {!canEdit && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
          <span>فقط مدیر ارشد می‌تواند دسترسی‌ها را تغییر دهد. شما در حالت مشاهده هستید.</span>
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        <button
          type="button"
          onClick={() => setHelpOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-fg sm:px-5"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16h.01M12 12a4 4 0 10-4-4" />
              <path d="M12 8v4" />
            </svg>
            راهنما
          </span>
          <svg className={`h-4 w-4 transition ${helpOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {helpOpen && (
          <div className="space-y-2 border-t border-border px-4 py-4 text-sm text-muted sm:px-5">
            <ol className="list-decimal list-inside space-y-1">
              <li>یک نقش را انتخاب کنید: مشتری، پیک، مدیر یا مدیر ارشد.</li>
              <li>ویژگی‌های مجاز هر گروه (مثل محصولات، سفارش‌ها، کاربران و ...) را مشاهده کنید.</li>
              <li>با کلیک روی چک‌باکس هر ویژگی، دسترسی آن را برای نقش انتخاب یا لغو کنید.</li>
              <li>دکمه «ذخیره دسترسی‌ها» را بزنید تا تغییرات ثبت شود (فقط مدیر ارشد می‌تواند ذخیره کند).</li>
              <li>برای اضافه کردن ویژگی جدید، دکمه «ویژگی جدید» را بزنید و گروه، اقدام، نام و توضیحات را وارد کنید.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="card-elevated p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((item) => {
              const active = item.value === role;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary'
                      : 'bg-surface-2 text-muted hover:text-fg'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {selected.length} از {permissions.length} ویژگی
            </span>
            <Button
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending}
              disabled={!canEdit || !isDirty || loading}
              onClick={() => saveMutation.mutate()}
            >
              ذخیره دسترسی‌ها
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {ROLES.find((item) => item.value === role)?.description}
        </p>
      </div>

      {failed ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.10)] text-red-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">خطا در بارگذاری دسترسی‌ها</p>
            <p className="mt-1 text-sm text-muted">اتصال به سرور برقرار نشد. دوباره تلاش کنید.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              permissionsQuery.refetch();
              rolesQuery.refetch();
            }}
          >
            تلاش دوباره
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-surface-2" />
          ))}
        </div>
      ) : permissions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--primary-rgb)/0.12)] text-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-fg">هیچ ویژگی مجازی تعریف نشده</p>
            <p className="mt-1 text-sm text-muted">برای شروع یک ویژگی جدید مثل products.create بسازید.</p>
          </div>
          {canEdit && (
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              افزودن ویژگی
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([group, items]) => (
            <section key={group} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-fg">{groupLabel(group)}</h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((permission) => {
                  const checked = selected.includes(permission.key);
                  return (
                    <div
                      key={permission.id}
                      className={`group relative flex items-start gap-3 rounded-xl border p-3 transition ${
                        checked
                          ? 'border-primary/50 bg-[rgb(var(--primary-rgb)/0.08)]'
                          : 'border-border bg-surface-2'
                      }`}
                    >
                      <label className={`flex min-w-0 flex-1 items-start gap-3 ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          disabled={!canEdit}
                          onChange={() => toggle(permission.key)}
                        />
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            checked
                              ? 'border-primary bg-primary text-fg'
                              : 'border-border-strong bg-surface text-transparent'
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-fg">{permission.name}</span>
                          <span className="mt-0.5 block truncate font-mono text-[11px] text-muted" dir="ltr">
                            {permission.key}
                          </span>
                          {permission.description && (
                            <span className="mt-1 block truncate text-[11px] text-muted-soft">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(permission)}
                          title="حذف ویژگی"
                          aria-label={`حذف ${permission.name}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-soft opacity-0 transition hover:bg-[rgba(239,68,68,0.10)] hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="ویژگی مجاز جدید" size="md">
        <form onSubmit={submitCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-fg-soft" htmlFor="permission-group">
              گروه ویژگی *
            </label>
            <Select
              id="permission-group"
              required
              value={form.group}
              onChange={(event) => setForm((prev) => ({ ...prev, group: event.target.value }))}
            >
              <option value="" disabled>گروه را انتخاب کنید</option>
              {Object.entries(GROUP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-fg-soft" htmlFor="permission-action">
              اقدام (Action) *
            </label>
            <Select
              id="permission-action"
              required
              dir="ltr"
              value={form.action}
              onChange={(event) => setForm((prev) => ({ ...prev, action: event.target.value }))}
            >
              <option value="" disabled>اقدام را انتخاب کنید</option>
              {COMMON_ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-muted-soft">مثال: create، read، update، delete، list، cancel</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-fg-soft" htmlFor="permission-name">
              نام نمایشی *
            </label>
            <input
              id="permission-name"
              className={inputClass}
              placeholder="ایجاد محصول"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-fg-soft" htmlFor="permission-description">
              توضیحات
            </label>
            <input
              id="permission-description"
              className={inputClass}
              placeholder="اختیاری"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => setAddOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" variant="primary" size="sm" className="w-full sm:w-auto" isLoading={createMutation.isPending}>
              ایجاد ویژگی
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="حذف ویژگی مجاز"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm leading-6 text-muted">
              ویژگی{' '}
              <span className="font-semibold text-fg">«{deleteTarget?.name}»</span>{' '}
              و دسترسی نقش‌های مرتبط با آن حذف می‌شود. این عمل قابل بازگشت نیست.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => setDeleteTarget(null)}>
              انصراف
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              حذف ویژگی
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

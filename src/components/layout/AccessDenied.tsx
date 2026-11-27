type AccessDeniedProps = {
  resource: string;
  className?: string;
};

export default function AccessDenied({ resource, className = '' }: AccessDeniedProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-8 text-center shadow-xl shadow-black/10 ${className}`}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 12a3 3 0 11-6 0" />
        </svg>
      </div>
      <p className="text-lg font-semibold text-fg">عدم دسترسی به مشاهده {resource}</p>
      <p className="mt-1 text-sm text-muted-soft">شما دسترسی مشاهده لیست {resource} را ندارید.</p>
    </div>
  );
}
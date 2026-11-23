import type { SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export default function Select({ label, required = false, error, className, ...props }: SelectProps) {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      {label && (
        <label className="block truncate text-xs font-medium text-muted">
          {label}
          {required ? ' *' : ''}
        </label>
      )}

      <div className="relative">
        <select
          className={`w-full cursor-pointer appearance-none rounded-xl border bg-surface-2 px-3.5 py-2.5 pl-9 text-sm text-fg outline-none transition-all duration-200 hover:border-muted-soft focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.16)] ${
            error ? 'border-[#f87171]' : 'border-border'
          } ${className || ''}`}
          {...props}
        />
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {error && <p className="text-xs font-medium text-[#f87171]">{error}</p>}
    </div>
  );
}

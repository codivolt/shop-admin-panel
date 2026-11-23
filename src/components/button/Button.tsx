import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
};

const baseStyles =
  'relative inline-flex shrink-0 select-none items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold leading-none tracking-tight outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none';

const variants: Record<string, string> = {
  primary:
    'bg-gradient-to-b from-primary to-primary-600 text-fg shadow-lg shadow-[rgb(var(--primary-rgb)/0.28)] hover:shadow-xl hover:shadow-[rgb(var(--primary-rgb)/0.38)] hover:brightness-[1.08] active:scale-[0.97]',
  secondary:
    'bg-gradient-to-b from-secondary to-secondary-600 text-fg shadow-lg shadow-[rgb(var(--secondary-rgb)/0.28)] hover:shadow-xl hover:shadow-[rgb(var(--secondary-rgb)/0.38)] hover:brightness-[1.08] active:scale-[0.97]',
  outline:
    'bg-gradient-to-b from-card-from to-card-to text-fg-soft shadow-lg shadow-black/10 dark:shadow-black/40 hover:text-fg hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-black/60 active:scale-[0.97]',
  ghost:
    'text-muted hover:bg-surface-2 hover:text-fg active:scale-[0.97]',
  danger:
    'bg-gradient-to-b from-accent to-accent-600 text-fg shadow-lg shadow-[rgb(var(--accent-rgb)/0.28)] hover:shadow-xl hover:shadow-[rgb(var(--accent-rgb)/0.38)] hover:brightness-[1.08] active:scale-[0.97]',
};

const sizes: Record<string, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const sheenVariants = new Set(['primary', 'secondary', 'outline', 'danger']);

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`group ${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {sheenVariants.has(variant) && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.14] to-transparent" />
          <span className="pointer-events-none absolute inset-0 translate-x-full bg-gradient-to-l from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:-translate-x-full" />
        </>
      )}

      <span className="relative z-10 inline-flex items-center gap-2">
        {isLoading ? (
          <>
            <svg
              className="h-3.5 w-3.5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            در حال پردازش...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

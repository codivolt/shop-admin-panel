export type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'neutral' | 'primary' | 'secondary' | 'accent';
  hint?: string;
};

const tones: Record<string, { box: string; value: string }> = {
  neutral: {
    box: 'bg-surface-2 text-fg-soft',
    value: 'text-fg',
  },
  primary: {
    box: 'bg-[rgb(var(--primary-rgb)/0.12)] text-primary shadow-[0_0_18px_rgb(var(--primary-rgb)/0.18)]',
    value: 'text-fg',
  },
  secondary: {
    box: 'bg-[rgb(var(--secondary-rgb)/0.12)] text-secondary shadow-[0_0_18px_rgb(var(--secondary-rgb)/0.18)]',
    value: 'text-fg',
  },
  accent: {
    box: 'bg-[rgb(var(--accent-rgb)/0.12)] text-accent shadow-[0_0_18px_rgb(var(--accent-rgb)/0.18)]',
    value: 'text-fg',
  },
};

export default function StatCard({ label, value, icon, color = 'neutral', hint }: StatCardProps) {
  const tone = tones[color] ?? tones.neutral;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-5 shadow-lg shadow-black/25 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:shadow-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
          <h3 className={`mt-2 text-2xl font-bold leading-none tracking-tight md:text-3xl ${tone.value}`}>
            {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
          </h3>
          {hint && <p className="mt-2 text-[11px] text-muted-soft">{hint}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${tone.box}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

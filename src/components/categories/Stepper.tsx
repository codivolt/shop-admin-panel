export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-4 shadow-lg shadow-black/25 sm:p-5">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < current;
          const isActive = stepNumber === current;
          return (
            <li key={label} className={`flex items-center gap-2 sm:gap-3 ${index === steps.length - 1 ? '' : 'flex-1'}`}>
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-primary text-fg'
                      : isActive
                        ? 'bg-gradient-to-b from-primary to-primary-600 text-fg shadow-lg shadow-[rgb(var(--primary-rgb)/0.35)]'
                        : 'border border-border bg-surface text-muted'
                  }`}
                >
                  {isDone ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber.toLocaleString('fa-IR')
                  )}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    isActive ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <span
                  className={`h-[3px] flex-1 rounded-full transition-colors ${
                    isDone ? 'bg-primary/60' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
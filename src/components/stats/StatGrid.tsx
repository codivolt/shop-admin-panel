import type { ReactNode } from 'react';

type StatGridProps = {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5;
  className?: string;
};

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-5',
};

export default function StatGrid({ children, cols = 3, className = '' }: StatGridProps) {
  return <div className={`grid grid-cols-1 gap-4 ${COLS[cols]} ${className}`}>{children}</div>;
}
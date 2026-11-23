export type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  radius?: 'xl' | 'lg';
  border?: 'neutral-100' | 'neutral-200';
};

const paddingMap: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const radiusMap: Record<string, string> = {
  xl: 'rounded-2xl',
  lg: 'rounded-xl',
};

const borderMap: Record<string, string> = {
  'neutral-100': 'border-border',
  'neutral-200': 'border-border',
};

export default function Card({
  children,
  className,
  padding = 'md',
  radius = 'xl',
  border = 'neutral-100',
}: CardProps) {
  return (
    <div
      className={`bg-surface ${radiusMap[radius]} border ${borderMap[border]} shadow-sm ${paddingMap[padding]} ${className || ''}`}
    >
      {children}
    </div>
  );
}

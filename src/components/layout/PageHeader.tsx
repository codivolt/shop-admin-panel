import Breadcrumb from './Breadcrumb';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-display truncate text-xl tracking-tight text-fg md:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

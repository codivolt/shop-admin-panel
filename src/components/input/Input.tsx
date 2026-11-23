import type { FieldPath, UseFormReturn } from 'react-hook-form';

export type InputProps<T extends object = any> = {
  name: FieldPath<T>;
  label?: string;
  type?: string;
  placeholder?: string;
  methods?: UseFormReturn<T>;
  errorClass?: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  error?: string;
};

export default function Input<T extends object = any>({
  name,
  label,
  type = 'text',
  placeholder,
  methods,
  errorClass = 'text-accent text-xs font-medium',
  required = false,
  className,
  value,
  onChange,
  maxLength,
  error: errorProp,
}: InputProps<T>) {
  const fieldError = methods ? (methods.formState as any).errors?.[name as string] : undefined;
  const error = fieldError ?? (errorProp ? { message: errorProp } : undefined);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-muted">
          {label}{required ? ' *' : ''}
        </label>
      )}
      <input
        type={type}
        maxLength={maxLength}
        {...(methods
          ? {
              ...methods.register(name as FieldPath<T>, {
                required: required ? 'This field is required' : undefined,
              }),
            }
          : {
              value,
              onChange,
            })}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted ${
          error
            ? 'border-[#f87171] bg-[rgba(248,113,113,0.06)] focus:border-[#f87171]'
            : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]'
        } ${className || ''}`}
      />
      {error && (
        <p className={`${errorClass}`}>{error.message}</p>
      )}
    </div>
  );
}

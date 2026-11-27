type AmountInputProps = {
  label?: string;
  value?: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  name?: string;
};

export default function AmountInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  className,
  error,
  name,
}: AmountInputProps) {
  const numeric =
    typeof value === 'number'
      ? value
      : parseInt(String(value ?? '').replace(/[^0-9]/g, ''), 10) || 0;
  const display = numeric ? numeric.toLocaleString('en-US') : '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-muted">
          {label}{required ? ' *' : ''}
        </label>
      )}
      <input
        name={name}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, '');
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted ${
          error
            ? 'border-[#f87171] bg-[rgba(248,113,113,0.06)] focus:border-[#f87171]'
            : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]'
        } ${className || ''}`}
      />
      {error && <p className="text-accent text-xs font-medium">{error}</p>}
    </div>
  );
}
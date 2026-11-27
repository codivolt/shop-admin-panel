import { useMemo, useState } from 'react';
import { formatJalali, toGregorianString, toJalaliParts } from '../../lib/jalali';
import JalaliDateSheet from './JalaliDateSheet';

type JalaliDatePickerProps = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function JalaliDatePicker({ label, value, onChange, placeholder }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const initial = useMemo(() => toJalaliParts(value), [value]);
  const selected = formatJalali(value);

  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-muted">{label}</label>}
      <div
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]"
      >
        {selected || <span className="text-muted">{placeholder || 'انتخاب تاریخ'}</span>}
      </div>

      <JalaliDateSheet
        open={open}
        initial={initial}
        onClose={() => setOpen(false)}
        onConfirm={(parts) => onChange(toGregorianString(parts.jy, parts.jm, parts.jd))}
      />
    </div>
  );
}
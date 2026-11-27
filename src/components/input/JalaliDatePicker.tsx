import { useMemo } from 'react';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaliMoment from 'jalali-moment';

type JalaliDatePickerProps = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function JalaliDatePicker({ label, value, onChange, placeholder }: JalaliDatePickerProps) {
  const dateValue = useMemo(() => {
    if (!value) return null;
    const gregorian = jalaliMoment(new Date(`${value}T00:00:00`));
    return new DateObject({ calendar: persian, locale: persian_fa, date: gregorian.toDate() });
  }, [value]);

  return (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      {label && <label className="block text-xs font-medium text-muted">{label}</label>}
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={dateValue}
        portal
        hideOnScroll={false}
        inputClass="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary)]"
        placeholder={placeholder || 'انتخاب تاریخ'}
        onChange={(date) => {
          if (!date) {
            onChange('');
            return;
          }
          const d = date.toDate();
          const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          onChange(formatted);
        }}
      />
    </div>
  );
}
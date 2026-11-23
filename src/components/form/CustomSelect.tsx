import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export type CustomSelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type CustomSelectProps = {
  options: CustomSelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  methods?: UseFormReturn<any>;
  name?: string;
  disabled?: boolean;
};

export default function CustomSelect({
  options,
  value: valueProp,
  onChange: onChangeProp,
  label,
  placeholder = 'انتخاب کنید...',
  required = false,
  error,
  className,
  methods,
  name,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const watchedValue = methods && name ? methods.watch(name as string) : undefined;
  const formValue = watchedValue !== undefined ? watchedValue : (methods ? methods.getValues(name as string) : undefined);
  const value = valueProp !== undefined ? valueProp : formValue;
  const fieldError = methods ? (methods.formState as any).errors?.[name as string]?.message : undefined;

  const handleValueChange = useCallback(
    (val: string | number) => {
      if (methods && name) {
        methods.setValue(name as string, val, { shouldValidate: true, shouldDirty: true });
      }
      onChangeProp?.(val);
    },
    [methods, name, onChangeProp]
  );

  const selectedOption = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // keep the highlighted option visible inside the scrollable list
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, highlightedIndex]);

  const handleSelect = useCallback(
    (opt: CustomSelectOption) => {
      if (opt.disabled) return;
      handleValueChange(opt.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
      triggerRef.current?.focus();
    },
    [handleValueChange]
  );

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        const selectedIndex = options.findIndex((o) => o.value === value);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return !prev;
    });
  }, [disabled, options, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
        return;
      }

      if (e.key === 'Tab') {
        setIsOpen(false);
        setHighlightedIndex(-1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev >= options.length - 1 ? 0 : prev + 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        }
        return;
      }
    },
    [isOpen, options, highlightedIndex, handleSelect, closeDropdown, openDropdown]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleValueChange('');
    },
    [handleValueChange]
  );

  const baseClasses = 'relative w-full min-w-0 font-sans ' + (className || '');
  const hasError = !!(error ?? fieldError);

  const triggerClasses = [
    'flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-right',
    'cursor-pointer outline-none transition-all duration-200',
    disabled ? 'cursor-not-allowed opacity-50' : '',
    hasError
      ? 'border-[#f87171] bg-[rgba(248,113,113,0.06)]'
      : isOpen
        ? 'border-primary bg-surface-2 shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.16)]'
        : 'border-border bg-surface-2 hover:border-muted-soft',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={selectRef} className={baseClasses}>
      {label && (
        <label className="mb-1.5 block truncate text-xs font-medium text-muted">
          {label}
          {required ? ' *' : ''}
        </label>
      )}

      <div
        ref={triggerRef}
        onClick={openDropdown}
        onKeyDown={handleKeyDown}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={hasError || undefined}
        className={triggerClasses}
      >
        <span className="min-w-0 flex-1 truncate text-sm">
          {selectedOption ? (
            <span className="font-medium text-fg">{selectedOption.label}</span>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </span>

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="پاک کردن"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-[#f87171]"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}

        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full origin-top animate-[popIn_0.15s_ease-out] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/60"
        >
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted">گزینه‌ای یافت نشد</div>
          ) : (
            <ul ref={listRef} className="max-h-60 overflow-y-auto p-1">
              {options.map((opt, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedOption?.value === opt.value;
                return (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    className={[
                      'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      opt.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                      isSelected
                        ? 'bg-[rgb(var(--primary-rgb)/0.14)] font-medium text-primary'
                        : isHighlighted
                          ? 'bg-surface-2 text-fg'
                          : 'text-fg-soft',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {hasError && (
        <p className="mt-1 text-xs font-medium text-[#f87171]">{error ?? fieldError}</p>
      )}
    </div>
  );
}

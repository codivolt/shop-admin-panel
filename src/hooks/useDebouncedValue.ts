import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delay` ms, resetting the timer on every change.
 * Useful for search inputs that trigger API requests.
 */
export function useDebouncedValue<T>(value: T, delay = 800): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

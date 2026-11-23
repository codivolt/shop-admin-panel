/**
 * Design system reference for JavaScript/TS consumers (charts, canvas, emails…).
 *
 * The source of truth is `src/index.css`: every token there is a CSS variable,
 * and `.dark` overrides them for dark mode. Components should prefer Tailwind
 * semantic utilities (`bg-surface`, `text-fg`, `border-border`, `bg-primary/10`…)
 * instead of hardcoding colors.
 *
 * To re-brand the panel, change the `--*-rgb` triplets in `src/index.css`.
 */

export const brandTokens = {
  primary: 'var(--primary-rgb)',
  primary600: 'var(--primary-600-rgb)',
  secondary: 'var(--secondary-rgb)',
  secondary600: 'var(--secondary-600-rgb)',
  accent: 'var(--accent-rgb)',
  accent600: 'var(--accent-600-rgb)',
} as const;

/** Semantic color tokens (theme-aware) as CSS variable references. */
export const semanticTokens = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  fg: 'var(--fg)',
  fgSoft: 'var(--fg-soft)',
  muted: 'var(--muted)',
  mutedSoft: 'var(--muted-soft)',
  cardFrom: 'var(--card-from)',
  cardTo: 'var(--card-to)',
  overlay: 'var(--overlay)',
} as const;

export const typography = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const;

export const radius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const transitions = {
  fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const themeStorageKey = 'admin-panel-theme';

export type DesignTokens = {
  brand: typeof brandTokens;
  semantic: typeof semanticTokens;
  typography: typeof typography;
  radius: typeof radius;
  transitions: typeof transitions;
};

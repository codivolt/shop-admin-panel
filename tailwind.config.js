/** @type {import('tailwindcss').Config} */
const rtlPlugin = require('tailwindcss-rtl');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors support opacity modifiers (e.g. bg-primary/10)
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          600: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb) / <alpha-value>)',
          600: 'rgb(var(--secondary-600-rgb) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent-600-rgb) / <alpha-value>)',
        },

        // Semantic tokens (theme-aware via CSS variables)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'card-from': 'var(--card-from)',
        'card-to': 'var(--card-to)',
        fg: {
          DEFAULT: 'var(--fg)',
          soft: 'var(--fg-soft)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          soft: 'var(--muted-soft)',
        },
        overlay: 'var(--overlay)',
      },
      boxShadow: {
        glow: '0 0 0 3px var(--ring-primary)',
        tint: '0 10px 20px -8px var(--shadow-tint)',
      },
    },
  },
  plugins: [rtlPlugin],
};

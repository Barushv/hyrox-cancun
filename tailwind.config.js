/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        accent: { DEFAULT: token('accent'), soft: token('accent-soft'), on: token('on-accent') },
        sun: token('sun'),
        ok: token('ok'),
        warn: token('warn'),
        bad: token('bad'),
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

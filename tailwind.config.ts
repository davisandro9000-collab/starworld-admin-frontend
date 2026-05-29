import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Backgrounds ── */
        'admin-bg':   '#0B0F1E',
        'admin-card': '#111827',
        'sw-card-2':  '#1A2035',

        /* ── Borders ── */
        'sw-border':   '#1E2A42',
        'sw-border-2': '#2A3A58',

        /* ── Gold ── */
        'gold':     '#FFD700',
        'gold-dim': '#C9A800',

        /* ── Semantic ── */
        'win':  '#22C55E',
        'loss': '#EF4444',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
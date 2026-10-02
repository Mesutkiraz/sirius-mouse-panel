/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'hk-dark':    '#0b0c10',
        'hk-surface': '#12141c',
        'hk-card':    '#161924',
        'hk-card-hover': '#1d2130',
        'hk-border':  '#232838',
        'hk-border-subtle': '#1c202d',
        'hk-blue':    '#3b82f6',
        'hk-cyan':    '#06b6d4',
        'hk-accent':  '#6366f1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

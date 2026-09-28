import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page background. Every card and panel is a translucent layer on top of it.
        ink: '#070B0C',
        // Brand teal: primary buttons, selected seats, active filters.
        accent: {
          DEFAULT: '#3CDDBE',
          strong: '#22C4A5',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 28px -6px rgb(60 221 190 / 0.65)',
      },
    },
  },
  plugins: [],
} satisfies Config

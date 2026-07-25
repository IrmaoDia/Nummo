/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        hairline: 'var(--border)',
        ink: 'var(--text)',
        subtle: 'var(--text-secondary)',
        entrada: 'var(--green)',
        gasto: 'var(--red)',
        acento: 'var(--blue)',
        empresa: 'var(--purple)',
        pessoa: 'var(--orange)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        micro: ['11px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        legend: ['13px', { lineHeight: '18px' }],
        body: ['15px', { lineHeight: '22px' }],
        section: ['20px', { lineHeight: '26px' }],
        screen: ['28px', { lineHeight: '34px' }],
      },
      borderRadius: {
        md: '6px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        apple: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        'apple-lg': '0 4px 12px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [],
}

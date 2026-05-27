/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        surface: {
          900: '#0a0b0f',
          800: '#111218',
          700: '#1a1c25',
          600: '#22253a',
          500: '#2a2d42',
          400: '#3a3d5c',
          300: '#4a4e6e',
        }
      },
      boxShadow: {
        'brand': '0 0 20px rgba(249,115,22,0.15)',
        'brand-lg': '0 0 40px rgba(249,115,22,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-brand': 'pulse-brand 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'pulse-brand': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}

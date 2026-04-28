/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ember: {
          50: '#fff7ed',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        ash: {
          900: '#0a0908',
          800: '#15130f',
          700: '#1f1b15',
          600: '#2a241c',
          500: '#3a3228',
          400: '#564a3c',
          300: '#7a6a58',
          200: '#a89a86',
          100: '#d4c8b5',
        },
        vow: {
          gold: '#d4a24c',
          blood: '#8b1e2b',
          seal: '#4c6ed4',
          bone: '#ecdfc3',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,162,76,0.3)',
        glow: '0 0 24px rgba(249,115,22,0.45)',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        flash: {
          '0%': { backgroundColor: 'rgba(249,115,22,0.7)' },
          '100%': { backgroundColor: 'rgba(249,115,22,0)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
      },
      animation: {
        shake: 'shake 300ms ease-in-out',
        flash: 'flash 400ms ease-out',
        rise: 'rise 200ms ease-out',
        float: 'float 900ms ease-out forwards',
      },
    },
  },
  plugins: [],
};

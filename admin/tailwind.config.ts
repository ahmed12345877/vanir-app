import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#080810',
        surface: '#0f0f1a',
        'surface-alt': '#14141f',
        'surface-elevated': '#1a1a2a',
        gold: {
          50: '#fdf8ec',
          100: '#f9edcc',
          200: '#f2d98a',
          300: '#e8c97a',
          400: '#d4a853',
          500: '#c9a84c',
          600: '#b08d30',
          700: '#8b6914',
          800: '#6b500f',
          900: '#4a370a',
        },
        'text-primary': '#f5f0e8',
        'text-secondary': '#a8a099',
        'text-muted': '#5a5560',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f0f1a 0%, #080810 100%)',
        'art-deco-pattern': `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(201,168,76,0.03) 10px,
          rgba(201,168,76,0.03) 11px
        )`,
      },
      boxShadow: {
        gold: '0 4px 24px rgba(201,168,76,0.25)',
        'gold-strong': '0 8px 40px rgba(201,168,76,0.35)',
        card: '0 8px 40px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 50px rgba(0,0,0,0.5)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(201,168,76,0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#6C5CE7', pressed: '#5A4BD1', deep: '#4834D4' },
        navy: { DEFAULT: '#191A2C', deep: '#0F1021', mid: '#242542' },
        link: { DEFAULT: '#2E86DE', pressed: '#1B6CB5' },
        brand: {
          pink: '#FD79A8', 'pink-deep': '#E84393',
          orange: '#FDCB6E', 'orange-deep': '#E17055',
          purple: '#A29BFE', 'purple-300': '#DDD6FE', 'purple-800': '#4C1D95',
          teal: '#00CEC9', green: '#00B894', yellow: '#FFEAA7', brown: '#81563C',
        },
        tint: {
          peach: '#FFF0E6', rose: '#FFE8EF', mint: '#E8FFF5', lavender: '#F0EDFF',
          sky: '#E8F4FD', yellow: '#FFF9DB', 'yellow-bold': '#FECA57',
          cream: '#FFF8EE', gray: '#F5F5F5',
        },
        canvas: '#FFFFFF',
        surface: { DEFAULT: '#F7F6F3', soft: '#FAFAFA' },
        hairline: { DEFAULT: '#E5E5E5', soft: '#F0F0F0', strong: '#D1D1D1' },
        ink: { DEFAULT: '#37352F', deep: '#000000' },
        charcoal: '#37352F',
        slate: '#6B7280',
        steel: '#9CA3AF',
        stone: '#B0B0B0',
        muted: '#D4D4D4',
        semantic: { success: '#00B894', warning: '#FDCB6E', error: '#E17055' },
      },
      borderRadius: {
        xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px', '3xl': '24px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15,15,15,0.04)',
        card: '0 4px 12px rgba(15,15,15,0.08)',
        mockup: '0 24px 48px -8px rgba(15,15,15,0.20)',
        modal: '0 16px 48px -8px rgba(15,15,15,0.16)',
      },
      spacing: {
        18: '4.5rem', 22: '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};

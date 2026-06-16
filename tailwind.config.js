/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#EFFCFB',
          100: '#D7F6F4',
          200: '#AEEDE9',
          300: '#7CE0DA',
          400: '#3DBAB0',
          500: '#2A9D94',
          600: '#228079',
          700: '#1C645F',
          800: '#174A47',
          900: '#113331',
        },
        accent: {
          50: '#FFF4ED',
          100: '#FFE6D6',
          200: '#FFC9AD',
          300: '#FFA678',
          400: '#FF9F6B',
          500: '#E88A55',
          600: '#C97242',
          700: '#A35A34',
          800: '#7D4428',
          900: '#572F1C',
        },
        danger: {
          50: '#FEF1F1',
          100: '#FFDCDC',
          200: '#FEB8B8',
          300: '#FA8C8C',
          400: '#F26B6B',
          500: '#D95454',
          600: '#B53D3D',
          700: '#8F2E2E',
          800: '#6B2222',
          900: '#491717',
        },
        warmGray: {
          50: '#FAFAF9',
          100: '#F5F7F9',
          200: '#E4E7EB',
          300: '#CBD2D9',
          400: '#9AA5B1',
          500: '#7B8794',
          600: '#616E7C',
          700: '#52606D',
          800: '#3E4C59',
          900: '#323F4B',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'progress': 'progress 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
    },
  },
  plugins: [],
};

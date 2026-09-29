/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f6f4',
          100: '#e5ebe5',
          200: '#cbd7cb',
          300: '#a3b19b',
          400: '#8a9a86',
          500: '#697c65',
          600: '#52624f',
          700: '#425040',
          800: '#364135',
          900: '#2d372c',
        },
        cream: {
          50: '#fdfcfb',
          100: '#f9f6f0',
          200: '#f2efe9',
          300: '#e6e0d4',
          400: '#d5cbb8',
          500: '#c2b39a',
        },
        earth: {
          800: '#4a4238',
          900: '#2b2620',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

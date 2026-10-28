/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F3', // Reference background
          200: '#F4EFE6',
          300: '#EAE1D0',
        },
        navy: {
          950: '#0F1833',
          900: '#17254B', // Reference Deep Navy typography
          800: '#1F3264',
          700: '#2A4385',
          600: '#3857A8',
          100: '#E4ECF8',
          50: '#F2F7FD',
        },
        electric: {
          DEFAULT: '#4C5BFF', // Reference Electric Blue
          hover: '#3947EA',
          light: '#E6E8FF',
          dark: '#303ECD',
        },
        periwinkle: {
          DEFAULT: '#5661F6',
          hover: '#4853EB',
          dark: '#3C46DC',
          light: '#EEF0FF',
        },
        pastel: {
          lavender: '#E9E1FF',
          violet: '#A98BFF',
          pink: '#FFDDE9',
          sky: '#DCEEFF',
          coral: '#FF8199',
          yellow: '#FFE9A8',
          cardLavender: '#EBE5FF',
          cardPink: '#FFE5EC',
          cardYellow: '#FFF5D6',
          cardSky: '#E1F2FF',
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'Baskerville', 'Georgia', 'serif'],
        display: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 37, 75, 0.05)',
        'card': '0 8px 30px -4px rgba(23, 37, 75, 0.08), 0 2px 8px -2px rgba(23, 37, 75, 0.04)',
        'card-hover': '0 16px 36px -6px rgba(76, 91, 255, 0.15), 0 4px 12px -2px rgba(23, 37, 75, 0.06)',
        'float': '0 20px 40px -10px rgba(76, 91, 255, 0.18)',
        'drag': '0 16px 32px -4px rgba(23, 37, 75, 0.2), 0 0 0 2px #4C5BFF',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
        'float-alt': 'floatAlt 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatAlt: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [],
}



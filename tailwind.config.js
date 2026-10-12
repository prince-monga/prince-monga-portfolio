/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        blue: {
          50: '#edfff4',
          100: '#d5ffe5',
          200: '#adffce',
          300: '#72ffae',
          400: '#39ff88',
          500: '#12e96c',
          600: '#00c957',
          700: '#00a247',
          800: '#07803d',
          900: '#096837',
          950: '#003a1b',
        },
        accent: {
          DEFAULT: '#07803d',
          dark: '#39ff88',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
}

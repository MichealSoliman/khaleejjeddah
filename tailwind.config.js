/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./!(node_modules)/**/*.html",
    "./assets/js/**/*.js",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af', // Blue-800
          custom: '#083792',
          dark: '#052a6b',
        },
        secondary: {
          DEFAULT: '#f59e0b', // Amber-500
          custom: '#f59e0b',
        },
        dark: {
          DEFAULT: '#1f2937', // Gray-800
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Cairo', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
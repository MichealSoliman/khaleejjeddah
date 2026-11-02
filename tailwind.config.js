/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./blog/**/*.html",
    "./areas/**/*.html",
    "./services/**/*.html",
    "./about/**/*.html",
    "./contact-us/**/*.html",
    "./faq/**/*.html",
    "./privacy-policy/**/*.html",
    "./terms-and-conditions/**/*.html",
    "./bedroom-moving-jeddah/**/*.html",
    "./kitchen-moving-jeddah/**/*.html",
    "./electrical-appliances-moving-jeddah/**/*.html",
    "./furniture-assembly-jeddah/**/*.html",
    "./furniture-moving-in-jeddah/**/*.html",
    "./furniture-moving-prices-in-jeddah/**/*.html",
    "./furniture-moving-truck-in-jeddah/**/*.html",
    "./furniture-packing-jeddah/**/*.html",
    "./furniture-storage-in-jeddah/**/*.html",
    "./office-and-company-moving-jeddah/**/*.html",
    "./apartment-furniture-moving-jeddah/**/*.html",
    "./villa-furniture-moving-jeddah/**/*.html",
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
  safelist: [
    'hidden',
    'rotate-180',
    'opacity-0',
    'opacity-100',
    'invisible',
    'visible',
    'md:top-0',
    'md:top-auto',
    'active',
  ],
  plugins: [],
}
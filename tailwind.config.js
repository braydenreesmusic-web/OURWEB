/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './Pages/**/*.{js,jsx,ts,tsx}',
    './Components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#14b8a6' },
        secondary: { DEFAULT: '#a855f7' },
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' },
    },
  },
  plugins: [],
}

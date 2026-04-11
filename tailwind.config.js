/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        alert: '#ef4444',
        warning: '#f59e0b',
        bb: {
          blue: '#4664F6',
          yellow: '#F8D117',
          lightBlue: '#D8E2FF',
          bg: '#F3F4F6'
        }
      },
    },
  },
  plugins: [],
}

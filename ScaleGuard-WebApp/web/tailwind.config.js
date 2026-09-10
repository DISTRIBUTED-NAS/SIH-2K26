/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#94bedc',
          400: '#5f9ecb',
          500: '#3a81b7',
          600: '#296799',
          700: '#22537c',
          800: '#1e4668',
          900: '#1c3b56',
          950: '#122537',
        }
      }
    },
  },
  plugins: [],
}

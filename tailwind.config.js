/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#d8e0ff',
          200: '#bccaff',
          300: '#94a7ff',
          400: '#6a7aff',
          500: '#4361ee',
          600: '#3040e0',
          700: '#2731c8',
          800: '#252da3',
          900: '#252e80',
        },
        accent: {
          50: '#fff8eb',
          100: '#ffebc8',
          200: '#ffd585',
          300: '#ffbb42',
          400: '#ffa012',
          500: '#ff8600',
          600: '#e86400',
          700: '#c14104',
          800: '#9a340b',
          900: '#7c2d0c',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
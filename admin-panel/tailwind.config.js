/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#fef7f7',
          100: '#fdeef0',
          200: '#fbd5db',
          300: '#f8b4be',
          400: '#f48a9a',
          500: '#ec6b7f',
          600: '#d94a62',
          700: '#b63a4f',
          800: '#973447',
          900: '#7f3042',
        },
        'accent': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'sidebar': '#1e1e2d',
        'sidebar-hover': '#2a2a3d',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
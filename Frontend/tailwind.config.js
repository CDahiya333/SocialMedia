/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#1DA1F2',
          dark: '#1A91DA',
        },
        background: {
          light: '#FFFFFF',
          dark: '#15202B',
        },
        surface: {
          light: '#F7F9FA',
          dark: '#1E2732',
        },
        text: {
          light: '#14171A',
          dark: '#FFFFFF',
        },
        'text-secondary': {
          light: '#657786',
          dark: '#8899A6',
        },
        border: {
          light: '#E1E8ED',
          dark: '#38444D',
        },
      },
    },
  },
  plugins: [],
} 
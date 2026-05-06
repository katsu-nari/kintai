/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clock-in': '#16a34a',
        'clock-out': '#dc2626',
      },
      fontSize: {
        '10xl': '10rem',
      },
    },
  },
  plugins: [],
}


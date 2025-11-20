/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'showroom-bg-day': '#E8E0D5',
        'showroom-accent-day': '#D4A574',
        'showroom-bg-night': '#3a3530',
        'showroom-accent-night': '#D4A574',
      },
    },
  },
  plugins: [],
}

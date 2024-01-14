/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    backgroundColor: theme => ({
      ...theme('colors'),
      'primary': '#0C4469',
      'secondary': '#051b29',
      'accent': '#1a91e0',
      'background': '#000c14',
      'danger': '#e3342f',
    }),
  },
  plugins: [],
}


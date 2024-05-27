/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}',
    './src/**/*.{jsx,html,js}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#673AB7',
        secondary: '#9E9E9E',
        background: '#F0EBF8',
        success: '#00C853',
        error: '#D50000',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#3899EC",
        secondary: "#7A7A7A",
        background: "#F6F7F8",
        success: "#13A10E",
        error: "#E21E1E",
      },
    },
  },
  plugins: [],
};

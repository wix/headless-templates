import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import wix from "@wix/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  adapter: wix(),
  vite: {
    plugins: [tailwindcss()],
  },
});

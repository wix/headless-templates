// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: wix(),

  vite: {
    plugins: [tailwindcss()]
  }
});
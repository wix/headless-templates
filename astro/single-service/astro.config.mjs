// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

import react from "@astrojs/react";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// https://astro.build/config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  // wixPages() and checkOrigin:false are unconditional on managed Astro (astro.md Caveat A2).
  integrations: [wix(), wixPages(), react()],
  security: { checkOrigin: false },
  adapter: wixHostingAdapter(),

  image: {
    domains: ["static.wixstatic.com"],
  },

  output: "server",
});
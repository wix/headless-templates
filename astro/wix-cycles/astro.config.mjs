// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Every route renders per request: the catalogue and cart are live reads.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages(), react()],
  security: { checkOrigin: false },

  vite: { plugins: [tailwindcss()] },

  image: {
    domains: ["static.wixstatic.com", "images.unsplash.com"],
  },
});

// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Every route renders per request: the event listing is a live read, so
  // there is nothing to prerender.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages(), react()],
  security: { checkOrigin: false },

  vite: { plugins: [tailwindcss()] },

  image: {
    domains: ["static.wixstatic.com"],
  },
});

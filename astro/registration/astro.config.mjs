// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages()],
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import cacheWix from "@wix/astro-wix-hosting-adapter/cache";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages()],
  cache: { provider: cacheWix() },
  routeRules: {
    "/": { maxAge: 3600 },
    "/schedule": { maxAge: 3600 },
  },
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

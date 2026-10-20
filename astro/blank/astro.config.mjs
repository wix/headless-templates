// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import cacheWix from "@wix/astro-wix-hosting-adapter/cache";

// https://astro.build/config
export default defineConfig({
  integrations: [wix(), wixPages()],
  cache: { provider: cacheWix() },
  routeRules: {},
  security: { checkOrigin: false },
});
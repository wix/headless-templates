// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import wix from "@wix/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [sitemap()],
  adapter: wix(),
});

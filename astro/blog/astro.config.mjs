// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [wix(), wixPages(), sitemap()]
});

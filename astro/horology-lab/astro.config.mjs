// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// https://astro.build/config
export default defineConfig({
  // Every route renders per request — the product and its variant prices are
  // a live read.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages()],
  security: { checkOrigin: false },

  image: {
    domains: ["static.wixstatic.com"],
  },
});

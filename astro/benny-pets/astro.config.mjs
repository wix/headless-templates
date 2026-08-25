// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// https://astro.build/config
export default defineConfig({
  // Every route renders per request: the catalog, the cart and the contact
  // form are all read from Wix at request time.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages()],
  security: { checkOrigin: false },
});

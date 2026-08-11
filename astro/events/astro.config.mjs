// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import react from "@astrojs/react";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix({ auth: true }), wixPages(), react()],
  security: { checkOrigin: false },
  image: {
    domains: ["static.wixstatic.com"],
  },
});

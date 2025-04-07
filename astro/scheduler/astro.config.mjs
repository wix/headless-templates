// @ts-check
import wix from "@wix/astro";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  adapter: wix(),
  vite: {
    resolve: {
      alias: {
        jose: "../../node_modules/jose/dist/browser/index.js",
      },
    },
  },
});

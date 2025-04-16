// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Use global CSS file
      applyBaseStyles: false,
    }),
  ],
  // adapter: wix(),
});

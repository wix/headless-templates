// @ts-check
import wix from "@wix/astro";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  adapter: wix(),
});

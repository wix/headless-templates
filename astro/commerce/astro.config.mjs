// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [wix(), wixPages(), react()],
  // Disable — TLS terminates at Wix's edge so Origin/url.origin mismatch (https vs http).
  security: { checkOrigin: false },
  image: {
    domains: ["static.wixstatic.com"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
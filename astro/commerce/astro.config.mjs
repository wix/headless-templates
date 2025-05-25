// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [wix()],
  image: {
    domains: ["static.wixstatic.com"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
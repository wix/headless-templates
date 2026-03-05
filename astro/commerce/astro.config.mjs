// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [wix(), wixPages()],
  image: {
    domains: ["static.wixstatic.com"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
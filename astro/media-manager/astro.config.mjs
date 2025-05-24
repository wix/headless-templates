import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [wix(), react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@wix/image"],
    },
  },
});

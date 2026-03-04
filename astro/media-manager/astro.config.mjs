import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [wix(), wixPages(), react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@wix/image"],
    },
  },
});

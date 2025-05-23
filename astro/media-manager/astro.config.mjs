import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [wix()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@wix/image"],
    },
  },
});

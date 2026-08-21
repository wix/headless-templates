// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: wixHostingAdapter(),
  // `auth: true` turns on the integration's built-in member-auth routes
  // (`/api/auth/login` + `/api/auth/logout`), used by the Navbar and account page.
  integrations: [wix({ auth: true }), wixPages()],
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

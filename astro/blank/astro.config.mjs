// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

// https://astro.build/config
export default defineConfig({
  integrations: [wix(), wixPages()],
});
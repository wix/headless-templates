// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [wix()],
});
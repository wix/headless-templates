// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import { transform } from "esbuild";

// Astro ships the SSR build unminified and `vite.build.minify` only reaches the client build. The
// deploy transport picks its path by server-bundle size, and past ~2.25MiB of server code it
// switches to a route that cannot authorize — so this is what keeps the template provisionable.
const minifyServerBundle = () => {
  let isSsr = false;
  return {
    name: "benny-pets:minify-server-bundle",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      isSsr = Boolean(config.build.ssr);
    },
    async renderChunk(code) {
      if (!isSsr) return null;
      const { code: minified } = await transform(code, {
        minify: true, format: "esm", target: "node20", keepNames: true, legalComments: "none",
      });
      return { code: minified, map: null };
    },
  };
};

// https://astro.build/config
export default defineConfig({
  // Every route renders per request: the catalog, the cart and the contact
  // form are all read from Wix at request time.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages()],
  security: { checkOrigin: false },

  vite: { plugins: [minifyServerBundle()] },
});

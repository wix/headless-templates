// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import { transform } from "esbuild";

// The deployed Wix runtime exposes NO user env vars (pods carry only infra
// vars; `wix env set` values surface solely via `wix env pull` → .env.local).
// Wix inlines its own credentials at build time, so we do the same for the
// concierge key: loadEnv reads .env.local and `define` bakes the value into
// the SERVER bundle. Only reference this variable from server-side code —
// a client-component reference would inline the secret into public JS.
// The chat concierge degrades to a clean "off the air" notice when unset, so
// the template runs fine without a key.
const secretEnv = loadEnv(
  process.env.NODE_ENV === "production" ? "production" : "development",
  process.cwd(),
  "",
);

// Astro ships the SSR build unminified, and `vite.build.minify` only reaches the client build.
// That matters here beyond page weight: the deploy transport picks its path by server-bundle size,
// and past ~2.25MiB of server code it switches to a route that cannot authorize, so an unminified
// dependency graph makes the template impossible to provision a site from. esbuild over the server
// chunks is behaviour-neutral — `keepNames` preserves function names for stack traces.
const minifyServerBundle = () => {
  let isSsr = false;
  return {
    name: "apex:minify-server-bundle",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      isSsr = Boolean(config.build.ssr);
    },
    async renderChunk(code) {
      if (!isSsr) return null;
      const { code: minified } = await transform(code, {
        minify: true,
        format: "esm",
        target: "node20",
        keepNames: true,
        legalComments: "none",
      });
      return { code: minified, map: null };
    },
  };
};

// https://astro.build/config
export default defineConfig({
  // No `site`: the canonical origin is whatever the provisioned site is served
  // from, resolved per request in src/lib/site.ts. A build-time constant here
  // would bake one origin into every copy of the template.
  output: "server",
  adapter: wixHostingAdapter(),
  integrations: [wix(), wixPages(), react()],
  security: { checkOrigin: false },

  image: {
    domains: ["static.wixstatic.com"],
  },

  vite: {
    plugins: [tailwindcss(), minifyServerBundle()],
    define: {
      // A raw define constant — Astro's env plugin rewrites import.meta.env.*
      // to process.env lookups (empty on Wix pods), so that namespace can't
      // carry the secret; a bare identifier is replaced verbatim by Vite.
      __ANTHROPIC_API_KEY__: JSON.stringify(secretEnv.ANTHROPIC_API_KEY ?? ""),
    },
  },

  // Ship the (single, site-wide) stylesheet inside the HTML instead of as a
  // render-blocking /_astro/*.css request — one less critical-path round
  // trip, and styles can't 404 from a stale edge-cached page after a release
  // purges old hashed assets.
  build: { inlineStylesheets: "always" },
});

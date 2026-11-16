// The one auth seam for Wix SDK calls in this template.
//
// On a Wix-managed Astro project the `@wix/astro` integration authenticates raw SDK module calls
// automatically, server-side AND in client islands, so there is no client to create, no OAuth setup
// and no client id in source: `wixModule()` returns the module untouched and exists only so every call
// site reads the same way.
// docs: https://dev.wix.com/docs/go-headless/wix-managed-headless/authentication/about-the-astro-integration.md
import { fetchWithAuth } from "@wix/sdk/context";

/**
 * Use an SDK module under this app's auth. Usage:
 *   import { productsV3 } from "@wix/stores";
 *   const products = wixModule(productsV3);
 *   await products.queryProducts(...)
 */
export function wixModule<T>(module: T): T {
  return module;
}

/**
 * An authenticated fetch of a Wix REST endpoint under the SAME auth as the SDK modules — for the few
 * APIs whose generated SDK module is too heavy to bundle (the Forms schema module alone is 15 MB:
 * server-side it pushes a Wix deploy past its size limit, client-side every visitor downloads it).
 * `path` is the wixapis.com path; returns the raw Response.
 */
export function wixFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://www.wixapis.com${path}`;
  return fetchWithAuth(url, init);
}

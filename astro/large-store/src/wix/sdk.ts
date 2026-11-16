// The one auth seam for Wix SDK calls in this app. `@wix/astro` authenticates raw SDK module calls
// automatically, server-side AND in client islands, so `wixModule()` returns the module untouched.
// There is no client, no OAuth strategy and no client id in source.
// docs: https://dev.wix.com/docs/go-headless/wix-managed-headless/authentication/about-the-astro-integration.md
import { fetchWithAuth } from "@wix/sdk/context";

/** Bind an SDK module to this app's auth (identity under the Astro integration). */
export function wixModule<T>(module: T): T {
  return module;
}

/**
 * An authenticated fetch of a Wix REST endpoint under the SAME auth as the SDK modules — for the few APIs
 * whose generated SDK module is too heavy to bundle (the Forms schema module alone is 15 MB). `path` is the
 * wixapis.com path; returns the raw Response.
 */
export function wixFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://www.wixapis.com${path}`;
  return fetchWithAuth(url, init);
}

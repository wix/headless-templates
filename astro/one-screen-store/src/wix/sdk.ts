// The one auth seam for every Wix SDK call in this app. `@wix/astro` authenticates raw SDK module calls automatically
// (server-side and in client islands), so there is no client to build and no client ID in source.
// docs: https://dev.wix.com/docs/go-headless/wix-managed-headless/authentication/about-the-astro-integration.md
import { fetchWithAuth } from "@wix/sdk/context";

/** An SDK module under the integration's ambient auth (kept as a seam so call sites read the same everywhere). */
export function wixModule<T>(module: T): T {
  return module;
}

/**
 * An authenticated fetch of a Wix REST endpoint under the same ambient auth as the SDK modules — for the few APIs whose
 * generated SDK module is too heavy to bundle (the Forms schema module alone is 15 MB). `path` is the wixapis.com path.
 */
export function wixFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://www.wixapis.com${path}`;
  return fetchWithAuth(url, init);
}

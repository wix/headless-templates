// A template cannot know its own origin: the URL is assigned when a site is
// provisioned from it, long after this code is built. Astro's `site` config is
// a build-time constant, so anything resolved against it ships the template
// author's placeholder — wrong canonical tags and JSON-LD `@id`s on every
// deployed copy. Every route here renders per request, so take the origin from
// the request instead and honour `site` only when someone has set it.
export const siteBase = (site: URL | undefined, url: URL): URL => {
  if (site) return site;
  const base = new URL(url.origin);
  // TLS terminates at the Wix edge, so the request the pod sees is plain http.
  // A canonical tag or JSON-LD `@id` must still name the public https origin,
  // or it points at a URL that redirects.
  if (base.hostname !== "localhost" && base.hostname !== "127.0.0.1") {
    base.protocol = "https:";
  }
  return base;
};

export const absoluteUrl = (path: string, site: URL | undefined, url: URL): string =>
  new URL(path, siteBase(site, url)).href;

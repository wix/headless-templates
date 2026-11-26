// Browser-safe: maps a URL to the tile it opens (used on the server for the first render and in the browser on back/forward).
/** Which tile a URL opens: /products/<slug>?Colour=… → that product (with the colour), /gift-card → the gift card. */
export type OpenTarget = { kind: "product"; slug: string; pick?: { option: string; choice: string } } | { kind: "gift" } | null;

export function targetFromUrl(url: URL): OpenTarget {
  const path = url.pathname.replace(/\/$/, "");
  if (path === "/gift-card") return { kind: "gift" };
  const m = path.match(/^\/products\/([^/]+)$/);
  if (!m) return null;
  const first = [...url.searchParams.entries()][0];
  return { kind: "product", slug: decodeURIComponent(m[1]), pick: first ? { option: first[0], choice: first[1] } : undefined };
}

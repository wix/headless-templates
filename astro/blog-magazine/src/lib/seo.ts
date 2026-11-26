// Item-page SEO: the tags a site owner edits in the dashboard (SEO & GEO > SEO Settings, or a single post's own SEO
// fields) resolve here at request time and render into the layout's `seo-tags` slot. Guarded: a failure leaves the slot empty.
import { loadSEOTagsServiceConfig } from "@wix/seo/services";
import { seoTags } from "@wix/seo";

/** The canonical page URL: Wix forwards the public one in a header (the internal `http:` URL is wrong behind hosting). */
export function pageUrlOf(request: Request, url: URL): string {
  const fwd = request.headers.get("x-wix-forwarded-url");
  return fwd && URL.canParse(fwd) && /^https?:$/.test(new URL(fwd).protocol) ? fwd : url.href;
}

export async function itemSeo(request: Request, url: URL, kind: "BLOG_POST" | "BLOG_CATEGORY", slug: string) {
  try {
    return await loadSEOTagsServiceConfig({ pageUrl: pageUrlOf(request, url), itemType: seoTags.ItemType[kind], itemData: { slug } });
  } catch (e) { console.error("[seo] failed", kind, slug, String(e).slice(0, 200)); return null; }
}

// The RSS feed: the 20 newest posts (title, link, date, excerpt). Read as the visitor, like every page.
import type { APIRoute } from "astro";
import { listPosts, esc } from "../lib/blog";
import { getCopy } from "../lib/content";
import { SITE_NAME_FALLBACK } from "../lib/site";

export const GET: APIRoute = async ({ request, url }) => {
  const fwd = request.headers.get("x-wix-forwarded-url");
  const origin = fwd && URL.canParse(fwd) ? new URL(fwd).origin : url.origin;
  const [{ items }, copy] = await Promise.all([listPosts({ limit: 20 }), getCopy()]);
  const site = copy.site?.title ?? SITE_NAME_FALLBACK;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site)}</title><link>${origin}/</link><description>${esc(copy.site?.body ?? site)}</description>
${items.map((p) => `<item><title>${esc(p.title)}</title><link>${origin}/post/${p.slug}</link><guid isPermaLink="true">${origin}/post/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join("\n")}
</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" } });
};

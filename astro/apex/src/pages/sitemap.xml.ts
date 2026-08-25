// GET /sitemap.xml — static pages plus one entry per live bookable service.
// Service slugs come from Wix Bookings at request time, so the sitemap tracks
// the catalog without a rebuild. A failed query degrades to the static pages
// (non-fatal, same policy as the home sessions query).
import type { APIRoute } from "astro";
import { services } from "@wix/bookings";
import { auth } from "@wix/essentials";

const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";
const STATIC_PATHS = ["/", "/about", "/faq", "/services", "/agents"];

export const GET: APIRoute = async ({ site }) => {
  const paths = [...STATIC_PATHS];

  try {
    const result = await auth
      .elevate(services.queryServices)()
      .eq("appId", BOOKING_APP_ID)
      .limit(100)
      .find();
    for (const s of (result.items ?? []) as any[]) {
      if (s.hidden) continue;
      const slug = s.mainSlug?.name ?? s.supportedSlugs?.[0]?.name;
      if (slug) paths.push(`/services/${slug}`);
    }
  } catch (err) {
    console.error("[sitemap] services query failed:", err);
  }

  const urls = paths
    .map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

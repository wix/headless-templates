// GET /robots.txt — a route rather than a static public/ file, because the
// Sitemap line has to name an absolute URL and the origin is only known once
// the site is provisioned and serving.
import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

export const GET: APIRoute = ({ site, url }) =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /booking-confirmation

Sitemap: ${absoluteUrl("/sitemap.xml", site, url)}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );

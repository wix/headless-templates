// Gallery page fetch: sort, filter, search and paging all happen on Wix.
import type { APIRoute } from "astro";
import { searchGallery } from "../../lib/server";

export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams;
  const num = (k: string) => (p.get(k) ? Number(p.get(k)) : undefined);
  try {
    const data = await searchGallery({
      categoryId: p.get("category") || undefined,
      sort: p.get("sort") || "featured",
      min: num("min"), max: num("max"),
      inStock: p.get("instock") === "1",
      choiceIds: p.get("choices")?.split(",").filter(Boolean),
      q: p.get("q") || undefined,
      cursor: p.get("cursor"),
      limit: num("limit"),
    });
    return new Response(JSON.stringify(data), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Could not load products" }), { status: 500, headers: { "content-type": "application/json" } });
  }
};

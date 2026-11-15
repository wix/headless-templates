// Full product for quick add — fetched only when the picker opens.
import type { APIRoute } from "astro";
import { getProductById } from "../../lib/server";

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  try {
    const product = await getProductById(id);
    if (!product) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ product }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Could not load product" }), { status: 500 });
  }
};

// Current cart: read (GET) and every price-affecting change (POST).
// Returns { cart, summary } so the drawer never computes totals itself.
import type { APIRoute } from "astro";
import { currentCartV2 } from "@wix/ecom";
import { readCart, withSummary } from "../../lib/server";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const message = (e: any) => e?.details?.applicationError?.description ?? e?.message ?? "Something went wrong";

export const GET: APIRoute = async () => {
  try { return json(await readCart()); } catch (e) { return json({ error: message(e) }, 500); }
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  try {
    if (body.action === "add") {
      const r: any = await currentCartV2.addLineItemsToCurrentCart({ catalogItems: body.items });
      return json(await withSummary(r.cart));
    }
    if (body.action === "update") {
      const r: any = await currentCartV2.updateLineItemsInCurrentCart({ lineItems: [{ lineItemId: body.lineItemId, quantity: { newQuantity: body.quantity } }] } as any);
      return json(await withSummary(r.cart));
    }
    if (body.action === "remove") {
      const r: any = await currentCartV2.removeLineItemsFromCurrentCart([body.lineItemId]);
      return json(await withSummary(r.cart));
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: message(e) }, 422);
  }
};

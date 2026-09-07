import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { countItems } from "../../../lib/cart";
import { json } from "../_json";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { lineItemId } = await request.json();
    if (!lineItemId) return json({ message: "lineItemId is required" }, 400);

    // Bare array of ids, not `{ lineItemIds: [...] }`.
    const { cart } = await currentCart.removeLineItemsFromCurrentCart([lineItemId]);

    return json({ count: countItems(cart) });
  } catch (err) {
    console.error("[api/cart/remove]", err);
    return json({ message: "Could not remove item" }, 500);
  }
};

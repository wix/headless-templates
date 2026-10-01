import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { countItems } from "../../../lib/cart";
import { json } from "../_json";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { lineItemId, quantity } = await request.json();
    if (!lineItemId) return json({ message: "lineItemId is required" }, 400);

    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      return json({ message: "quantity must be 1 or higher" }, 400);
    }

    // Takes a bare array of `{ _id, quantity }` — not `{ lineItems: [...] }`.
    const { cart } = await currentCart.updateCurrentCartLineItemQuantity([
      { _id: lineItemId, quantity: nextQuantity },
    ]);

    return json({ count: countItems(cart) });
  } catch (err) {
    console.error("[api/cart/update]", err);
    return json({ message: "Could not update quantity" }, 500);
  }
};

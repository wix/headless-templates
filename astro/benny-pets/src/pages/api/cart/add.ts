import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { countItems } from "../../../lib/cart";
import { resolveSoleVariantId } from "../../../lib/catalog";
import { STORES_APP_ID } from "../../../lib/constants";
import { json } from "../_json";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId, variantId, quantity = 1 } = await request.json();
    if (!productId) return json({ message: "productId is required" }, 400);

    // A Wix Stores line item resolves to a *variant*. Without one the call
    // succeeds and adds nothing, so only a product with a single variant may
    // be added without the shopper choosing.
    const variant = variantId ?? (await resolveSoleVariantId(productId));
    if (!variant) {
      return json({ message: "This product has options — choose one first." }, 409);
    }

    const { cart } = await currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: STORES_APP_ID,
            catalogItemId: productId,
            options: { variantId: variant },
          },
          quantity: Math.max(1, Number(quantity) || 1),
        },
      ],
    });

    return json({ count: countItems(cart) });
  } catch (err) {
    console.error("[api/cart/add]", err);
    return json({ message: "Could not add to cart" }, 500);
  }
};

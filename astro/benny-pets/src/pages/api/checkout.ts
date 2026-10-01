import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { json } from "./_json";

/**
 * A headless site has no Wix checkout page of its own, so the checkout lives
 * behind a redirect session — `checkout.getWixCheckoutUrl()` 404s here.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const origin = new URL(request.url).origin;
    const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({
      channelType: "WEB",
    });

    const { redirectSession } = await redirects.createRedirectSession({
      ecomCheckout: { checkoutId },
      // Where Wix sends the shopper back to when they leave the checkout.
      callbacks: { postFlowUrl: origin, cartPageUrl: `${origin}/cart` },
    });

    if (!redirectSession?.fullUrl) return json({ message: "Checkout is unavailable" }, 502);
    return json({ checkoutUrl: redirectSession.fullUrl });
  } catch (err) {
    console.error("[api/checkout]", err);
    return json({ message: "Could not start checkout" }, 500);
  }
};

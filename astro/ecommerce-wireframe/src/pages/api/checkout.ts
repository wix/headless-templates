// Hands the current cart to Wix's hosted checkout. The origin comes from the
// browser (window.location.origin): behind Wix's proxy the request URL is
// http://, and an http:// callback is not an allowed redirect domain.
import type { APIRoute } from "astro";
import { currentCartV2 } from "@wix/ecom";
import { redirects } from "@wix/redirects";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const { origin } = await request.json();
    const safeOrigin = typeof origin === "string" && /^https:\/\//.test(origin) ? origin : String(origin ?? "").replace(/^http:/, "https:");
    const { cart }: any = await currentCartV2.getCurrentCart();
    if (!cart?.lineItems?.length) return json({ error: "Your bag is empty." }, 400);
    const blocked = cart.lineItems.filter((l: any) => l.status && l.status !== "IN_STOCK" && l.status !== "PREORDER");
    if (blocked.length) return json({ error: `Remove unavailable items before checkout: ${blocked.map((l: any) => l.name?.original).join(", ")}` }, 409);
    const session: any = await redirects.createRedirectSession({
      ecomCheckout: { checkoutId: cart._id },
      callbacks: { postFlowUrl: `${safeOrigin}/`, thankYouPageUrl: `${safeOrigin}/` },
    } as any);
    return json({ url: session.redirectSession.fullUrl });
  } catch (e: any) {
    return json({ error: e?.message ?? "Checkout is unavailable right now. Please try again." }, 500);
  }
};

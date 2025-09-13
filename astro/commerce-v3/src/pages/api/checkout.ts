import type { APIRoute } from "astro";
import { createCheckoutUrl } from "../../lib/wix";

export const GET: APIRoute = async ({ redirect, request }) => {
  const checkoutUrl = await createCheckoutUrl(new URL(request.url).origin);

  return redirect(checkoutUrl);
};

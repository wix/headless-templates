import type { APIRoute } from "astro";
import { createCheckoutId } from "../../lib/wix";

export const GET: APIRoute = async ({ }) => {
  const checkoutId = await createCheckoutId();

  return new Response(JSON.stringify({ checkoutId }), { status: 200 });;
};

// PICKED — Wix eCommerce cart bridge.
//
// Replaces the previously committed `public/wix-cart.js`, which was a 193 KB
// esbuild bundle of @wix/sdk carrying a hardcoded OAuth clientId. Under
// @wix/astro the SDK is authenticated ambiently, so these are plain module
// imports and Astro bundles them — no createClient, no OAuthStrategy, no client
// id in the page.
//
// Product ids, prices and subscription cadences are resolved server-side in
// index.astro and handed over on `window.PICKED_BASKETS`; nothing about the
// store is hardcoded here.

import { currentCart, checkout } from "@wix/ecom";

/** Wix Stores catalog app id — constant across all Wix Stores sites. */
const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

type Subscription = { id: string; title: string; description: string };

type Basket = {
  productId: string;
  name: string;
  blurb: string;
  count: number;
  price: string;
  subscriptions: Subscription[];
};

type Baskets = { order: string[]; items: Record<string, Basket> };

declare global {
  interface Window {
    PICKED_BASKETS?: Baskets;
    wixCart?: typeof api;
  }
}

function baskets(): Baskets {
  return window.PICKED_BASKETS ?? { order: [], items: {} };
}

function basketFor(sizeKey: string): Basket {
  const basket = baskets().items[sizeKey];
  if (!basket) {
    throw new Error(`wixCart: no product mapped for basket size "${sizeKey}"`);
  }
  return basket;
}

/**
 * True when the store actually backs this design — i.e. the server found
 * products for at least one basket size. The page guards on this so it falls
 * back to its own on-page cart when the store is empty.
 */
function isConfigured() {
  return Object.keys(baskets().items).length > 0;
}

/** Whether this basket has any subscription cadence configured. */
function canSubscribe(sizeKey: string) {
  try {
    return basketFor(sizeKey).subscriptions.length > 0;
  } catch {
    return false;
  }
}

/** The delivery cadences configured on this basket's product, in store order. */
function subscriptionsFor(sizeKey: string): Subscription[] {
  try {
    return basketFor(sizeKey).subscriptions;
  } catch {
    return [];
  }
}

/**
 * Add one box to the visitor's Wix cart.
 *
 * `opts.mode` is `"once"` (default) or `"subscribe"`. A subscription sets
 * `catalogReference.options.subscriptionOptionId` so Wix bills it on that
 * option's cadence; `opts.subscriptionId` picks which cadence, defaulting to
 * the product's first.
 */
async function addBox(
  sizeKey: string,
  opts: { mode?: string; quantity?: number; subscriptionId?: string } = {},
) {
  const basket = basketFor(sizeKey);
  const quantity = opts.quantity || 1;
  const subscribe = opts.mode === "subscribe";

  const catalogReference: {
    appId: string;
    catalogItemId: string;
    options?: { subscriptionOptionId: string };
  } = {
    appId: WIX_STORES_APP_ID,
    catalogItemId: basket.productId,
  };

  if (subscribe) {
    const subscriptionId =
      opts.subscriptionId ?? basket.subscriptions[0]?.id ?? null;
    if (!subscriptionId) {
      throw new Error(
        `wixCart: basket "${sizeKey}" has no subscription option configured`,
      );
    }
    catalogReference.options = { subscriptionOptionId: subscriptionId };
  }

  const { cart } = await currentCart.addToCurrentCart({
    lineItems: [{ quantity, catalogReference }],
  });

  return cart;
}

/** The current cart, or null when the visitor has not added anything yet. */
async function getCart() {
  try {
    return await currentCart.getCurrentCart();
  } catch (error) {
    // NOT_FOUND is the normal answer for a cart that was never created.
    const code = (error as { details?: { applicationError?: { code?: string } } })
      ?.details?.applicationError?.code;
    if (code === "OWNED_CART_NOT_FOUND" || /not.?found/i.test(String(error))) {
      return null;
    }
    throw error;
  }
}

/**
 * Cart totals as Wix calculates them. The template renders
 * `priceSummary.total.formattedAmount` rather than summing prices locally —
 * Wix owns tax, shipping and currency formatting.
 */
async function getTotals() {
  try {
    const estimate = await currentCart.estimateCurrentCartTotals();
    return {
      formattedTotal:
        estimate.priceSummary?.total?.formattedAmount ?? "",
      itemCount: (estimate.cart?.lineItems ?? []).reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      ),
    };
  } catch (error) {
    console.error("wixCart: could not estimate cart totals", error);
    return null;
  }
}

/** Turn the current cart into a checkout and return the hosted checkout URL. */
async function getCheckoutUrl() {
  const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });
  const { checkoutUrl } = await checkout.getCheckoutUrl(checkoutId!);
  return checkoutUrl;
}

/** Add a box, then go straight to the hosted checkout. */
async function checkoutBox(
  sizeKey: string,
  opts: { mode?: string; quantity?: number; subscriptionId?: string } = {},
) {
  await addBox(sizeKey, opts);
  const url = await getCheckoutUrl();
  if (url) window.location.assign(url);
  return url;
}

const api = {
  isConfigured,
  canSubscribe,
  subscriptionsFor,
  addBox,
  getCart,
  getTotals,
  getCheckoutUrl,
  checkoutBox,
};

window.wixCart = api;

export default api;

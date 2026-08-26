// Exploded Horology Lab — the commission (reserve & pay) flow.
//
// Replaces an inline module that imported @wix/sdk from esm.sh, built its own
// client with createClient + OAuthStrategy({ clientId }), and carried hardcoded
// PRODUCT_ID / VARIANT_ID constants. Under @wix/astro the SDK authenticates
// ambiently, so these are plain imports that Astro bundles — no client, no
// client id, no CDN dependency at runtime.
//
// The product, its option choices and every variant price come from the server
// (window.HOROLOGY_PRODUCT, resolved in index.astro).

import { items } from "@wix/data";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";

/** Wix Stores catalog app id — constant across all Wix Stores sites. */
const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

/** Visitor-writable collection holding one row per commission. */
const COLLECTION = "Reservations";

type Variant = {
  id: string;
  inStock: boolean;
  formattedPrice: string;
  choices: { optionName: string; choiceName: string }[];
};

type Product = {
  productId: string;
  name: string;
  description: string;
  options: { name: string; choices: string[] }[];
  variants: Variant[];
  formattedPrice: string;
};

/** The visitor's five picks, keyed by Wix option name. */
type Selection = Record<string, string>;

declare global {
  interface Window {
    HOROLOGY_PRODUCT?: Product | null;
    horologyCommission?: typeof api;
  }
}

function product(): Product | null {
  return window.HOROLOGY_PRODUCT ?? null;
}

/** True once the store actually backs this design. */
function isConfigured() {
  const p = product();
  return !!(p && p.productId && p.variants.length);
}

/**
 * Resolve a selection to the one buyable variant that matches it.
 *
 * AGENTS.md is explicit that a product with options must resolve its variant
 * from `variantsInfo` rather than defaulting to `variants[0]` — a mismatched
 * variant would charge the wrong price for the wrong watch.
 */
function variantFor(selection: Selection): Variant | null {
  const p = product();
  if (!p) return null;

  const wanted = Object.entries(selection).map(([optionName, choiceName]) => ({
    optionName: optionName.toLowerCase(),
    choiceName: choiceName.toLowerCase(),
  }));

  return (
    p.variants.find((variant) =>
      wanted.every((want) =>
        variant.choices.some(
          (choice) =>
            choice.optionName.toLowerCase() === want.optionName &&
            choice.choiceName.toLowerCase() === want.choiceName,
        ),
      ),
    ) ?? null
  );
}

/**
 * The price of a selection, as Wix formats it. Returns "" when the selection
 * has no matching variant — the UI shows nothing rather than a made-up number.
 */
function priceFor(selection: Selection): string {
  return variantFor(selection)?.formattedPrice ?? "";
}

/**
 * Record the commission to the CMS, then hand off to the Wix-hosted checkout
 * for the configured variant's real price.
 *
 * The CMS write is a visitor insert, so `Reservations` must be `insert: ANYONE`
 * (and `read: ADMIN`, so customer names and emails stay private).
 */
async function reserve({
  selection,
  fullName,
  email,
}: {
  selection: Selection;
  fullName: string;
  email: string;
}) {
  const p = product();
  if (!p) throw new Error("No product is configured for this site");

  const variant = variantFor(selection);
  if (!variant) {
    throw new Error("That combination is not available in the store");
  }

  // Record the full configuration alongside the price actually charged.
  await items
    .insert(COLLECTION, {
      title: `${p.name} — ${fullName}`,
      fullName,
      email,
      ...selection,
      total: variant.formattedPrice,
      status: "Reserved",
    })
    .catch((error) => {
      // A failed record must not cost the customer their checkout; log and go on.
      console.error("Could not record the commission to the CMS", error);
    });

  await currentCart.deleteCurrentCart().catch(() => {
    /* no cart yet — nothing to clear */
  });

  await currentCart.addToCurrentCart({
    lineItems: [
      {
        quantity: 1,
        catalogReference: {
          appId: WIX_STORES_APP_ID,
          catalogItemId: p.productId,
          options: { variantId: variant.id },
        },
      },
    ],
  });

  const { checkoutId } = await currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });

  const { redirectSession } = await redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl: window.location.origin + window.location.pathname },
  });

  const url = redirectSession?.fullUrl;
  if (!url) throw new Error("Wix returned no checkout URL");

  window.location.assign(url);
  return url;
}

const api = { isConfigured, variantFor, priceFor, reserve };

window.horologyCommission = api;

export default api;

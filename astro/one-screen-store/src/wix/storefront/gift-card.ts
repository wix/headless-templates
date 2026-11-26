// Gift card: the ONE Wix gift card product a site supports, read and put in the visitor's cart as the visitor.
// A visitor CAN read the product
// (POST /gift-cards/v1/gift-card-products/query, 200) and CAN add a preset amount to the cart once the Wix Gift Cards app is
// installed, as { appId: GIFT_CARDS_APP_ID, catalogItemId: <product id>, options: { variantId: <preset variant id> } }.
// Limits found: a CUSTOM amount has no documented cart reference, so only preset amounts are sold here; the recipient and
// personal message cannot be set from a cart line (not found in any doc), so none is asked for.
// docs: https://dev.wix.com/docs/api-reference/business-solutions/gift-cards/gift-card-products/query-gift-card-products.md
// docs: https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/purchase-flow/cart-v2/add-line-items-to-current-cart.md
// docs (app id): https://dev.wix.com/docs/api-reference/articles/work-with-wix-apis/platform/about-apps-created-by-wix.md
import { currentCartV2 } from "@wix/ecom";
import { wixModule, wixFetch } from "../sdk";
import { imgSrc } from "../media";
import { refreshCart, setCartOpen } from "./cart-store";

const cartApi = wixModule(currentCartV2);
export const GIFT_CARDS_APP_ID = "d80111c5-a0f4-47a8-b63a-65b54d774a27";

export interface GiftCardProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  /** Preset amounts, ascending; `price` is formatted in the site currency. */
  presets: { variantId: string; price: string; amount: number }[];
}

type Raw = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function fetchGiftCardProduct(): Promise<GiftCardProduct | null> {
  try {
    const res = await wixFetch("/gift-cards/v1/gift-card-products/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: { cursorPaging: { limit: 1 } } }),
    });
    if (!res.ok) return null;
    const p: Raw = ((await res.json()).giftCardProducts ?? [])[0];
    if (!p) return null;
    const presets = ((p.presetVariants ?? []) as Raw[])
      .map((v) => ({ variantId: String(v.id), price: String(v.price?.formattedAmount ?? ""), amount: Number(v.price?.amount) }))
      .filter((v) => v.variantId && v.price && Number.isFinite(v.amount))
      .sort((a, b) => a.amount - b.amount);
    if (!presets.length) return null;
    return {
      id: String(p.id),
      name: String(p.name ?? "Gift Card"),
      description: String(p.description ?? ""),
      imageUrl: p.image?.url ? imgSrc(String(p.image.url), 1200, 800) : "",
      imageAlt: String(p.image?.altText ?? p.name ?? "Gift Card"),
      presets,
    };
  } catch (err) {
    console.error("[gift card]", err);
    return null;
  }
}

/** Add one preset amount to the cart and open the bag. Throws buyer copy on refusal. */
export async function addGiftCardToCart(productId: string, variantId: string): Promise<void> {
  try {
    const { cart } = await cartApi.addLineItemsToCurrentCart({
      catalogItems: [{ quantity: 1, catalogReference: { appId: GIFT_CARDS_APP_ID, catalogItemId: productId, options: { variantId } } }],
    });
    const added = ((cart?.lineItems ?? []) as Raw[]).some((l) => l.source?.catalogReference?.catalogItemId === productId && l.source?.catalogReference?.options?.variantId === variantId);
    if (!added) throw new Error("The gift card couldn’t be added. Try again.");
  } catch (e) {
    throw new Error(e instanceof Error && e.message ? e.message : "The gift card couldn’t be added. Try again.");
  }
  await refreshCart();
  setCartOpen(true);
}

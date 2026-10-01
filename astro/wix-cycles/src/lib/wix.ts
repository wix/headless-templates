import { media } from "@wix/sdk";
import { productsV3 } from "@wix/stores";
import { items } from "@wix/data";

import type { Kit, Review } from "@/lib/data";

// Wix Stores catalog app id — fixed across all sites.
export const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

/**
 * Resolve a product/line-item image to a plain URL. `wix:image://` URIs have
 * to go through the SDK resolver; absolute https URLs pass straight through.
 */
export function wixImageUrl(
  raw: string | undefined | null,
  width: number,
  height: number,
): string | undefined {
  if (!raw) return undefined;
  if (raw.startsWith("wix:image://")) {
    try {
      return media.getScaledToFillImageUrl(raw, width, height, {});
    } catch {
      return undefined;
    }
  }
  return raw.startsWith("https://") ? raw : undefined;
}

/**
 * The purchasable builds, straight from Wix Stores. Runs server-side in
 * `index.astro`, so the catalog is in the initial HTML rather than appearing
 * after hydration. `@wix/astro` authenticates the call ambiently — there is no
 * client to construct and no client id in this file.
 *
 * Prices are the SDK's `formattedAmount`: the store's own currency and
 * formatting, never a locally composed "$" string.
 */
export async function loadKits(): Promise<Kit[]> {
  try {
    const res = await productsV3
      .queryProducts({
        fields: ["CURRENCY", "PLAIN_DESCRIPTION", "VARIANT_OPTION_CHOICE_NAMES"],
      })
      .limit(50)
      .find();

    // Serialize only what the carousel and cart actually render.
    return (res.items ?? []).map((product) => ({
      productId: product._id ?? undefined,
      name: product.name ?? "",
      price: product.actualPriceRange?.minValue?.formattedAmount ?? "",
      spec: (product.plainDescription ?? "").replace(/<[^>]+>/g, "").trim(),
      image: wixImageUrl(product.media?.main?.image, 772, 1026),
    }));
  } catch (error) {
    console.error("Failed to load products from Wix Stores", error);
    return [];
  }
}

/** Review quotes from the public-read `reviews` CMS collection. */
export async function loadReviews(): Promise<Review[]> {
  try {
    const res = await items.query("reviews").ascending("order").find();

    return (res.items ?? []).map((row: Record<string, unknown>) => ({
      pre: (row.pre as string) ?? "",
      highlight: (row.highlight as string) ?? "",
      post: (row.post as string) ?? "",
      source: (row.source as string) ?? "",
      initials: (row.initials as string) ?? "",
    }));
  } catch (error) {
    console.error("Failed to load reviews from Wix Data", error);
    return [];
  }
}

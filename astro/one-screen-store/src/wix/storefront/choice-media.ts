// Per-choice photos: which gallery image belongs to which option choice (a colourway's own frame).
// NEW data-layer file. Why it exists: the kit's DTO reads a variant's image from `variant.media`, and Catalog V3 does NOT
// derive that from a choice's linked media (probed: every variant of the seeded product reports the product's main image,
// whatever the choices link to), so `ProductVariant.imageUrl` is null here. The choice carries its own link
// (`choicesSettings.choices[].media.items[].mediaId`, returned when PRODUCT_CHOICES_MEDIA_REFERENCES is requested), and
// the gallery item with that id has the URL. Result: choiceId -> https image URL; a choice with no linked media is absent.
// docs: https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v3/products-v3/get-product-by-slug.md
// docs: https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v3/products-v3/about-product-media.md
import { productsV3 } from "@wix/stores";
import { wixModule } from "../sdk";
import { imgSrc } from "../media";

const productsApi = wixModule(productsV3);
type Raw = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function fetchChoiceMedia(slug: string): Promise<Record<string, string>> {
  try {
    const res = await productsApi.getProductBySlug(slug, { fields: ["MEDIA_ITEMS_INFO", "PRODUCT_CHOICES_MEDIA_REFERENCES"] as any });
    const p: Raw = res.product;
    const byId = new Map<string, string>();
    for (const m of (p?.media?.itemsInfo?.items ?? []) as Raw[]) {
      const url = m.image ? imgSrc(m.image, 1200, 1500) : "";
      const id = m._id ?? m.id; // the SDK names it _id, REST id
      if (id && url) byId.set(String(id), url);
    }
    const out: Record<string, string> = {};
    for (const o of (p?.options ?? []) as Raw[]) {
      for (const c of (o.choicesSettings?.choices ?? []) as Raw[]) {
        const url = byId.get(String(c.media?.items?.[0]?.mediaId ?? ""));
        if (url && c.choiceId) out[String(c.choiceId)] = url;
      }
    }
    return out;
  } catch (err) {
    console.error("[choice media]", err);
    return {};
  }
}

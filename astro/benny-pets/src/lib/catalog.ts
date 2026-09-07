import { media } from "@wix/sdk";
import { categories } from "@wix/categories";
import { productsV3 } from "@wix/stores";

/**
 * Wix media fields are `wix:image://` identifiers, not URLs — they have to go
 * through the SDK helper. A hand-built CDN URL 403s.
 */
export function resolveImage(image: any, w = 600, h = 600): string | null {
  if (!image) return null;
  const url = typeof image === "string" ? image : image.url;
  if (!url) return null;
  if (!url.startsWith("wix:image://")) return url;
  try {
    return media.getScaledToFillImageUrl(url, w, h, {});
  } catch (err) {
    console.error("[catalog] could not resolve image:", err);
    return null;
  }
}

export type Product = {
  _id: string;
  slug: string;
  name: string;
  /** Already formatted by Wix, currency included — never build this yourself. */
  price: string;
  description: string;
  /** The description's opening line — pack size, count, or sizes available. */
  sub: string;
  imageUrl: string | null;
  /** More than one means the shopper has to pick a variant before adding. */
  variantCount: number;
  /** Real category ids, for the store's filter. */
  categoryIds: string[];
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
};

/** The Wix Stores install creates this root category; the filter has its own All. */
const ROOT_CATEGORY_SLUG = "all-products";

export type ProductOption = {
  name: string;
  choices: string[];
};

export type ProductVariant = {
  _id: string;
  /** Option name → chosen value, e.g. `{ Size: "M" }`. */
  choices: Record<string, string>;
  price: string;
  visible: boolean;
};

export type ProductDetail = Product & {
  options: ProductOption[];
  variants: ProductVariant[];
};

const LIST_FIELDS = ["CURRENCY", "PLAIN_DESCRIPTION", "DIRECT_CATEGORIES_INFO"] as const;
const DETAIL_FIELDS = ["CURRENCY", "PLAIN_DESCRIPTION", "VARIANT_OPTION_CHOICE_NAMES"] as const;

/** `plainDescription` is HTML — flatten it for anywhere it's bound as text. */
function descriptionText(product: any): string {
  const raw = product?.plainDescription;
  if (typeof raw !== "string") return "";
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** The opening sentence, which the seeded copy leads with ("5 KG / 11 LBS."). */
function leadLine(description: string): string {
  const [first] = description.split(/(?<=\.)\s/);
  return first && first.length <= 48 ? first.replace(/\.$/, "") : "";
}

function toProduct(product: any, w: number, h: number): Product {
  const description = descriptionText(product);
  return {
    _id: product._id,
    slug: product.slug ?? "",
    name: product.name ?? "",
    price: product.actualPriceRange?.minValue?.formattedAmount ?? "",
    description,
    sub: leadLine(description),
    imageUrl: resolveImage(product.media?.main?.image, w, h),
    variantCount: product.variantSummary?.variantCount ?? 1,
    categoryIds: (product.directCategoriesInfo?.categories ?? [])
      .map((category: any) => category._id ?? category.id)
      .filter(Boolean),
  };
}

/**
 * The store's real categories, read live so one the owner adds later appears
 * on its own. The query needs at least one filter — a bare `find()` is
 * rejected as an empty condition.
 */
export async function listCategories(): Promise<Category[]> {
  try {
    const { items } = await categories
      .queryCategories({ treeReference: { appNamespace: "@wix/stores" } })
      .exists("name", true)
      .find();
    return (items ?? [])
      .filter((category: any) => category.slug !== ROOT_CATEGORY_SLUG)
      .map((category: any) => ({ _id: category._id, name: category.name, slug: category.slug }));
  } catch (err) {
    console.error("[catalog] could not list categories:", err);
    return [];
  }
}

/**
 * Every read below runs in page frontmatter, where an unguarded throw would
 * truncate the response mid-stream. Each one logs and degrades instead.
 */
export async function listProducts(limit = 20, w = 600, h = 600): Promise<Product[]> {
  try {
    const { items } = await productsV3
      .queryProducts({ fields: [...LIST_FIELDS] as any })
      .limit(limit)
      .find();
    return items.map((product: any) => toProduct(product, w, h));
  } catch (err) {
    console.error("[catalog] could not list products:", err);
    return [];
  }
}

/**
 * The detail read has to be `getProductBySlug` rather than a query: only this
 * one returns `variantsInfo`, and a cart line item references a variant.
 */
export async function getProductBySlug(
  slug: string,
  w = 800,
  h = 800,
): Promise<ProductDetail | null> {
  try {
    const { product }: any = await productsV3.getProductBySlug(slug, {
      fields: [...DETAIL_FIELDS] as any,
    });
    if (!product) return null;

    const options: ProductOption[] = (product.options ?? []).map((option: any) => ({
      name: option.name ?? "",
      choices: (option.choicesSettings?.choices ?? []).map((choice: any) => choice.name ?? ""),
    }));

    const variants: ProductVariant[] = (product.variantsInfo?.variants ?? []).map((variant: any) => ({
      _id: variant._id,
      choices: Object.fromEntries(
        (variant.choices ?? [])
          .map((choice: any) => [
            choice.optionChoiceNames?.optionName,
            choice.optionChoiceNames?.choiceName,
          ])
          .filter(([name, value]: any[]) => name && value),
      ),
      price: variant.price?.actualPrice?.formattedAmount ?? "",
      visible: variant.visible !== false,
    }));

    return { ...toProduct(product, w, h), options, variants };
  } catch (err: any) {
    // A slug with nothing behind it is a 404, not something to shout about.
    if (err?.details?.applicationError?.code !== "NOT_FOUND") {
      console.error("[catalog] could not load product:", err);
    }
    return null;
  }
}

/**
 * Current catalog image per product id. A cart line item keeps the image it
 * was given when it was added, so a cart built before a product had one shows
 * an empty slot until this fills it in.
 */
export async function getProductImages(
  productIds: string[],
  w = 240,
  h = 240,
): Promise<Record<string, string | null>> {
  const ids = [...new Set(productIds.filter(Boolean))];
  if (ids.length === 0) return {};
  try {
    const { items } = await productsV3.queryProducts().in("_id", ids).limit(ids.length).find();
    return Object.fromEntries(
      items.map((product: any) => [product._id, resolveImage(product.media?.main?.image, w, h)]),
    );
  } catch (err) {
    console.error("[catalog] could not load product images:", err);
    return {};
  }
}

/**
 * The variant a "quick add" button may use: only ever returned when the
 * product has exactly one, so nothing is added on the shopper's behalf when
 * there was a choice to make.
 */
export async function resolveSoleVariantId(productId: string): Promise<string | null> {
  try {
    // `getProduct` returns the product itself, unlike `getProductBySlug`,
    // which wraps it in `{ product }`.
    const product: any = await productsV3.getProduct(productId);
    const visible = (product?.variantsInfo?.variants ?? []).filter((v: any) => v.visible !== false);
    return visible.length === 1 ? visible[0]._id : null;
  } catch (err) {
    console.error("[catalog] could not resolve variant:", err);
    return null;
  }
}

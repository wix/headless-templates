// Store logic shared by server pages and client islands. No SDK calls here —
// only the rules for reading Catalog V3 data: prices, variants, ribbons, the
// per-card buy path, images, and the Cart V2 catalog item.
import { media } from "@wix/sdk";

export const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

// Listing / gallery / rails — summary data.
export const LIST_FIELDS = ["CURRENCY", "PLAIN_DESCRIPTION", "MEDIA_ITEMS_INFO", "MIN_PRICE_VARIANT", "DISCOUNT_INFO"] as const;
// Product page and quick add — one complete purchasable product.
export const DETAIL_FIELDS = [
  ...LIST_FIELDS,
  "DESCRIPTION", "INFO_SECTION", "INFO_SECTION_DESCRIPTION", "INFO_SECTION_PLAIN_DESCRIPTION",
  "VARIANT_OPTION_CHOICE_NAMES", "PRODUCT_CHOICES_MEDIA_REFERENCES", "SUBSCRIPTION_PRICES_INFO", "BREADCRUMBS_INFO",
] as const;

export const PAGE_SIZE = 24;

// ---------- Images ----------
/** One helper for every image: resolves wix:image:// ids, passes absolute URLs through. */
export function imgSrc(m: any, w = 640, h = 800, opts: Record<string, any> = {}): string {
  const v = m?.image ?? m?.url ?? m;
  if (!v) return "";
  const s = typeof v === "string" ? v : v?.url ?? v?.id ?? "";
  if (!s) return "";
  if (s.startsWith("wix:image://")) return media.getScaledToFillImageUrl(s, w, h, opts);
  return s;
}
/** Responsive candidates at one ratio (h = w * ratio). */
export function imgSrcSet(m: any, ratio = 1.25, widths = [320, 480, 640, 960, 1280]): string {
  return widths.map((w) => `${imgSrc(m, w, Math.round(w * ratio))} ${w}w`).join(", ");
}
/** De-duplicated product media, main first, keyed on the media identity (not the URL). */
export function productImages(p: any): { m: any; alt: string; key: string }[] {
  const items = p?.media?.itemsInfo?.items ?? [];
  const seen = new Set<string>();
  const out: { m: any; alt: string; key: string }[] = [];
  const idOf = (it: any) => String(it?._id ?? it?.image?.id ?? it?.image ?? it?.url ?? "").split("#")[0];
  for (const it of [p?.media?.main, ...items].filter(Boolean)) {
    const key = idOf(it);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ m: it, alt: it.altText || p?.name || "", key });
  }
  return out;
}

// ---------- Prices ----------
export type Money = { amount?: string; formattedAmount?: string };
export function sellingPrice(price: any): { current?: Money; original?: Money } {
  if (price?.priceAfterDiscount !== undefined && price?.priceAfterDiscount !== null) {
    return { current: price.priceAfterDiscount, original: price.actualPrice };
  }
  return { current: price?.actualPrice, original: price?.compareAtPrice };
}
const higher = (a?: Money, b?: Money) => !!a?.amount && !!b?.amount && Number(a.amount) > Number(b.amount);

/** Card / pre-selection price: a range reads as a range, never a range with one struck "was". */
export function listPrice(p: any): { text: string; was?: string; isRange: boolean } {
  const min = p?.actualPriceRange?.minValue, max = p?.actualPriceRange?.maxValue;
  if (min && max && min.amount !== max.amount) return { text: `${min.formattedAmount} – ${max.formattedAmount}`, isRange: true };
  const v = p?.variantSummary?.minPriceVariant?.price;
  if (v) {
    const s = sellingPrice(v);
    return { text: s.current?.formattedAmount ?? min?.formattedAmount ?? "", was: higher(s.original, s.current) ? s.original?.formattedAmount : undefined, isRange: false };
  }
  const cmin = p?.compareAtPriceRange?.minValue;
  return { text: min?.formattedAmount ?? "", was: higher(cmin, min) ? cmin.formattedAmount : undefined, isRange: false };
}
export function variantPrice(v: any): { text: string; was?: string } {
  const s = sellingPrice(v?.price);
  return { text: s.current?.formattedAmount ?? "", was: higher(s.original, s.current) ? s.original?.formattedAmount : undefined };
}

// ---------- Ribbons ----------
export const ribbons = (p: any): string[] => [p?.ribbon?.name, ...(p?.additionalRibbons ?? []).map((r: any) => r?.name)].filter(Boolean);
// A semantic accent applied by label, not by which field the ribbon came from.
export const ribbonClass = (name: string) => (/sale/i.test(name) ? "ribbon ribbon--sale" : "ribbon");

// ---------- Options & variants ----------
export const isColorOption = (o: any) => o?.optionRenderType === "SWATCH_CHOICES" || o?.optionRenderType === "COLOR_CHOICES";
const key = (ids: string[]) => [...ids].sort().join("_");

export function variantIndex(p: any) {
  const map = new Map<string, any>();
  for (const v of p?.variantsInfo?.variants ?? []) {
    if (v.visible === false) continue;
    const k = key((v.choices ?? []).map((c: any) => c.optionChoiceIds?.choiceId));
    if (map.has(k)) console.warn(`Two variants share the choices ${k} on ${p?.name}`);
    else map.set(k, v);
  }
  return map;
}
export const available = (v: any) => v?.inventoryStatus?.inStock !== false || v?.inventoryStatus?.preorderEnabled === true;

/** Resolve the variant for a complete selection; null when incomplete or the combination doesn't exist. */
export function resolveVariant(p: any, idx: Map<string, any>, selected: Record<string, string>) {
  const opts = p?.options ?? [];
  if (!opts.length) return p?.variantsInfo?.variants?.[0] ?? null;
  if (!opts.every((o: any) => selected[o._id])) return null;
  return idx.get(key(opts.map((o: any) => selected[o._id]))) ?? null;
}

/** Is this choice selectable given the other picks? (in stock or pre-order in at least one compatible variant) */
export function choiceSelectable(p: any, idx: Map<string, any>, selected: Record<string, string>, optionId: string, choiceId: string) {
  const opts = p?.options ?? [];
  const others = Object.entries(selected).filter(([o]) => o !== optionId);
  for (const v of idx.values()) {
    const ids = new Set((v.choices ?? []).map((c: any) => c.optionChoiceIds?.choiceId));
    if (!ids.has(choiceId)) continue;
    if (others.every(([, c]) => ids.has(c)) && available(v)) return true;
  }
  if (!idx.size) {
    const ch = opts.find((o: any) => o._id === optionId)?.choicesSettings?.choices?.find((c: any) => c.choiceId === choiceId);
    return (ch?.inStock ?? true) && (ch?.visible ?? true);
  }
  return false;
}

// ---------- The buy path per card ----------
export type PurchasePath = "directAdd" | "quickAdd" | "pdp" | "soldOut";
export function purchasePath(p: any): PurchasePath {
  const mods = p?.modifiers ?? [];
  if (mods.some((m: any) => m.modifierRenderType === "FREE_TEXT") || p?.subscriptionPricesInfo?.subscriptionPrices?.length) return "pdp";
  if (p?.inventory?.availabilityStatus === "OUT_OF_STOCK" && p?.inventory?.preorderStatus !== "ENABLED") return "soldOut";
  if ((p?.options?.length ?? 0) > 0 || mods.some((m: any) => m.mandatory)) return "quickAdd";
  return "directAdd";
}

/**
 * The card's action label names the outcome. The card carries the colour
 * choice itself (swatches), so we count what is LEFT after that and ask only
 * for the first remaining option, by its own name ("Select size").
 */
export function cardActionLabel(p: any, pickedColor?: string): string {
  const path = purchasePath(p);
  if (path === "soldOut") return "Sold out";
  if (path === "pdp") return "Choose options";
  const preorder = p?.inventory?.preorderStatus === "ENABLED" && p?.inventory?.availabilityStatus === "OUT_OF_STOCK";
  if (path === "directAdd") return preorder ? "Pre-order" : "Add to bag";
  const remaining = (p?.options ?? []).filter((o: any) => !(isColorOption(o) && pickedColor));
  const mandatoryMods = (p?.modifiers ?? []).filter((m: any) => m.mandatory);
  if (!remaining.length && !mandatoryMods.length) return preorder ? "Pre-order" : "Add to bag";
  const first = remaining[0] ?? mandatoryMods[0];
  if (remaining.length + mandatoryMods.length > 1) return "Choose options";
  return `Select ${String(first.name).toLowerCase()}`;
}

// ---------- Cart V2 catalog item (one serializer for card, quick add, PDP) ----------
export function catalogItem({ product, variant, quantity = 1, modifierChoices = {}, customTextFields = {}, preorder = false }: {
  product: any; variant: any; quantity?: number; modifierChoices?: Record<string, string>; customTextFields?: Record<string, string>; preorder?: boolean;
}) {
  return {
    quantity,
    catalogReference: {
      appId: STORES_APP_ID,
      catalogItemId: product._id,
      options: {
        variantId: variant._id,
        ...(Object.keys(modifierChoices).length ? { options: modifierChoices } : {}),
        ...(Object.keys(customTextFields).length ? { customTextFields } : {}),
        ...(preorder ? { preOrderRequested: true } : {}),
      },
    },
  };
}

/** Cart V2 money has no formatted string: format it with the cart's currency. */
export function formatCartMoney(money: any, cart: any): string {
  const value = money?.convertedAmount ?? money?.amount;
  const currency = cart?.currency ?? cart?.customerInfo?.currencyCode ?? cart?.businessInfo?.currencyCode ?? "USD";
  if (value == null || value === "") return "";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value)); }
  catch { return String(value); }
}

export const stripTags = (html?: string) => (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
/** Minimal sanitizer for merchant HTML (descriptions, info sections, CMS rich text): drop scripts, handlers, js: URLs. */
export function sanitize(html?: string) {
  return (html ?? "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=\"#\"");
}

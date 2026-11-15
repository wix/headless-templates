// Server-only Wix reads/writes. Every SDK call in the site goes through here
// (pages + /api routes); islands never call the SDK directly. Managed Astro
// authenticates these calls as the current visitor automatically.
import { productsV3 } from "@wix/stores";
import { categories } from "@wix/categories";
import { currentCartV2 } from "@wix/ecom";
import { items } from "@wix/data";
import { siteProperties } from "@wix/business-tools";
import { auth } from "@wix/essentials";
import { LIST_FIELDS, DETAIL_FIELDS, PAGE_SIZE } from "./store";

const TREE = { appNamespace: "@wix/stores" };

// ---------- Site identity (Dashboard → Settings → Business info) ----------
// Read-only, public business profile; elevated because visitor tokens lack the Site Properties scope.
let siteCache: { at: number; info: { name: string; logo?: string } } | null = null;
export async function getSiteInfo() {
  if (siteCache && Date.now() - siteCache.at < 60_000) return siteCache.info;
  try {
    const r: any = await auth.elevate(siteProperties.getSiteProperties)({ fields: ["businessName", "siteDisplayName", "logo"] } as any);
    const p = r?.properties ?? {};
    const info = { name: p.businessName || p.siteDisplayName || "", logo: p.logo ? `https://static.wixstatic.com/media/${p.logo}` : undefined };
    siteCache = { at: Date.now(), info };
    return info;
  } catch (e) {
    console.error("getSiteInfo", e);
    return { name: "" };
  }
}

// ---------- Categories ----------
export type Category = { _id: string; name: string; slug: string; description?: string; image?: any; parentId?: string; itemCount: number; href: string; hoverImage?: any };
let catCache: { at: number; list: Category[]; all: Category | null } | null = null;
/** Live category tree (flat here). Non-fatal: an empty list just hides category navigation. */
export async function getCategories(): Promise<Category[]> {
  if (catCache && Date.now() - catCache.at < 30_000) return catCache.list;
  try {
    const res = await categories.queryCategories({ treeReference: TREE } as any).exists("name", true).limit(100).find();
    const allRaw: any = (res.items ?? []).find((c: any) => c.slug === "all-products");
    const all: Category | null = allRaw ? { _id: allRaw._id, name: "Shop All", slug: "all-products", image: allRaw.image, itemCount: allRaw.itemCounter ?? 0, href: "/shop" } : null;
    const list = (res.items ?? [])
      .filter((c: any) => c.visible !== false && c.slug !== "all-products")
      // Creation order = the order the owner built the store in (no explicit sort field on the tree).
      .sort((a: any, b: any) => new Date(a._createdDate ?? a.createdDate ?? 0).getTime() - new Date(b._createdDate ?? b.createdDate ?? 0).getTime())
      .map((c: any) => ({ _id: c._id, name: c.name, slug: c.slug, description: c.description, image: c.image, parentId: c.parentCategory?._id, itemCount: c.itemCounter ?? 0, href: `/category/${c.slug}` }));
    catCache = { at: Date.now(), list, all };
    return list;
  } catch (e) {
    console.error("getCategories", e);
    return [];
  }
}
/** Categories for navigation surfaces: "Shop All" (the store's all-products category, linking to /shop) first. */
export async function getNavCategories(): Promise<Category[]> {
  const [list, hover] = await Promise.all([getCategories(), getCategoryHoverImages()]);
  const all = catCache?.all ? [catCache.all, ...list] : list;
  return all.map((c) => ({ ...c, hoverImage: hover[c.slug] }));
}
/** Second (hover) image per category, from CMS → Category Hover Images (keyed by category slug). */
async function getCategoryHoverImages(): Promise<Record<string, any>> {
  try {
    const r = await items.query("CategoryHover").limit(100).find();
    return Object.fromEntries((r.items ?? []).filter((i: any) => i.category && i.image).map((i: any) => [i.category, i.image]));
  } catch (e) { console.error("getCategoryHoverImages", e); return {}; }
}
export async function getCategoryBySlug(slug: string) {
  try {
    const r: any = await categories.getCategoryBySlug(slug, TREE as any, { fields: ["DESCRIPTION"] } as any);
    return r?.category ?? null;
  } catch (e) { console.error("getCategoryBySlug", e); return null; }
}

// ---------- Gallery ----------
export type GalleryQuery = { categoryId?: string; sort?: string; min?: number; max?: number; inStock?: boolean; choiceIds?: string[]; q?: string; cursor?: string | null; limit?: number };
const SORTS: Record<string, any> = {
  // "Featured" = the order the owner added products (oldest first) — not a sales ranking.
  featured: [{ fieldName: "createdDate", order: "ASC" }, { fieldName: "name", order: "ASC" }],
  priceAsc: [{ fieldName: "actualPriceRange.minValue.amount", order: "ASC" }, { fieldName: "name", order: "ASC" }],
  priceDesc: [{ fieldName: "actualPriceRange.minValue.amount", order: "DESC" }, { fieldName: "name", order: "ASC" }],
  nameAsc: [{ fieldName: "name", order: "ASC" }],
  newest: [{ fieldName: "createdDate", order: "DESC" }, { fieldName: "name", order: "ASC" }],
};
export const SORT_LABELS: Record<string, string> = { featured: "Featured", newest: "Newest", priceAsc: "Price: low to high", priceDesc: "Price: high to low", nameAsc: "Name: A–Z" };

function buildFilter(q: GalleryQuery) {
  const c: any[] = [{ visible: true }];
  if (q.categoryId) c.push({ "allCategoriesInfo.categories": { $matchItems: [{ id: q.categoryId }] } });
  if (q.min != null && !Number.isNaN(q.min)) c.push({ "actualPriceRange.minValue.amount": { $gte: String(q.min) } });
  if (q.max != null && !Number.isNaN(q.max)) c.push({ "actualPriceRange.minValue.amount": { $lte: String(q.max) } });
  if (q.inStock) c.push({ "inventory.availabilityStatus": { $in: ["IN_STOCK", "PARTIALLY_OUT_OF_STOCK"] } });
  if (q.choiceIds?.length) c.push({ "options.choicesSettings.choices.choiceId": { $hasSome: q.choiceIds } });
  return { $and: c };
}

export async function searchGallery(q: GalleryQuery) {
  const limit = q.limit ?? PAGE_SIZE;
  const filter = buildFilter(q);
  const search: any = q.cursor
    ? { cursorPaging: { limit, cursor: q.cursor } } // a cursor continues the original query — send it alone
    : {
        filter,
        ...(SORTS[q.sort ?? "featured"] ? { sort: SORTS[q.sort ?? "featured"] } : {}),
        ...(q.q?.trim() ? { search: { expression: q.q.trim(), fields: ["name"] } } : {}),
        cursorPaging: { limit },
      };
  const [page, count] = await Promise.all([
    productsV3.searchProducts(search, { fields: LIST_FIELDS as any }),
    q.cursor ? Promise.resolve(null) : productsV3.countProducts({ filter, ...(q.q?.trim() ? { search: { expression: q.q.trim(), fields: ["name"] } } : {}) } as any).catch(() => null),
  ]);
  return {
    products: (page as any).products ?? [],
    nextCursor: (page as any).pagingMetadata?.cursors?.next ?? null,
    count: (count as any)?.count ?? null,
  };
}

/**
 * Facets from the scope's own products, so the panel never offers a filter
 * nothing matches. Kept: option facets with more than one choice, and the
 * scope's price span (for the price bounds' placeholders).
 */
export async function getFacets(categoryId?: string) {
  try {
    const res: any = await productsV3.searchProducts({ filter: buildFilter({ categoryId }), cursorPaging: { limit: 100 } } as any, { fields: ["CURRENCY"] as any });
    const byName = new Map<string, { name: string; swatch: boolean; choices: Map<string, any> }>();
    let lo = Infinity, hi = 0;
    for (const p of res.products ?? []) {
      lo = Math.min(lo, Number(p.actualPriceRange?.minValue?.amount ?? Infinity));
      hi = Math.max(hi, Number(p.actualPriceRange?.maxValue?.amount ?? 0));
      for (const o of p.options ?? []) {
        const k = o.name;
        const f = byName.get(k) ?? { name: o.name, swatch: o.optionRenderType === "SWATCH_CHOICES" || o.optionRenderType === "COLOR_CHOICES", choices: new Map() };
        for (const ch of o.choicesSettings?.choices ?? []) {
          if (ch.visible === false) continue;
          // Same visible name across products → one facet value carrying every matching choice id.
          const prev = f.choices.get(ch.name);
          f.choices.set(ch.name, { name: ch.name, colorCode: ch.colorCode, ids: [...(prev?.ids ?? []), ch.choiceId] });
        }
        byName.set(k, f);
      }
    }
    const facets = [...byName.values()].filter((f) => f.choices.size > 1).map((f) => ({ name: f.name, swatch: f.swatch, choices: [...f.choices.values()] }));
    return { facets, priceMin: Number.isFinite(lo) ? Math.floor(lo) : 0, priceMax: Math.ceil(hi), currency: res.products?.[0]?.currency };
  } catch (e) {
    console.error("getFacets", e);
    return { facets: [], priceMin: 0, priceMax: 0, currency: undefined };
  }
}

export async function getProductBySlug(slug: string) {
  const r: any = await productsV3.getProductBySlug(slug, { fields: DETAIL_FIELDS as any });
  return r?.product ?? null;
}
export async function getProductById(id: string) {
  const r: any = await productsV3.getProduct(id, { fields: DETAIL_FIELDS as any });
  return r?.product ?? r ?? null;
}

// ---------- Cart ----------
export async function readCart() {
  let cart: any = null;
  try { cart = (await currentCartV2.getCurrentCart() as any)?.cart ?? null; }
  catch (e: any) { if (!/404|not.?found/i.test(String(e?.message ?? e))) throw e; }
  return withSummary(cart);
}
/** Estimate only when there are lines — an empty cart 404s. A failed estimate is not fatal. */
export async function withSummary(cart: any) {
  let summary: any = null;
  if (cart?.lineItems?.length) {
    try { summary = (await currentCartV2.estimateCurrentCart() as any)?.summary ?? null; } catch (e) { console.error("estimate", e); }
  }
  return { cart, summary };
}

// ---------- CMS copy ----------
export type Section = { key: string; title?: string; body?: string; ctaLabel?: string; ctaLink?: string; image?: string; imageMobile?: string };
let secCache: { at: number; map: Record<string, Section> } | null = null;
/** All SiteSections items keyed by `key`. A missing key simply omits its section. */
export async function getSections(): Promise<Record<string, Section>> {
  if (secCache && Date.now() - secCache.at < 30_000) return secCache.map;
  try {
    const r = await items.query("SiteSections").limit(100).find();
    const map = Object.fromEntries((r.items ?? []).map((i: any) => [i.key, i as Section]));
    secCache = { at: Date.now(), map };
    return map;
  } catch (e) { console.error("getSections", e); return {}; }
}
export async function getTestimonials() {
  try { return (await items.query("Testimonials").ascending("order").limit(20).find()).items ?? []; }
  catch (e) { console.error("getTestimonials", e); return []; }
}
export async function getLegalPages() {
  try { return (await items.query("LegalPages").ascending("order").limit(20).find()).items ?? []; }
  catch (e) { console.error("getLegalPages", e); return []; }
}

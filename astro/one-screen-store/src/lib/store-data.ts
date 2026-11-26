// Server-side data for the one-screen store (Home, /shop, /products/[slug], /gift-card all render the same StoreApp).
// The catalog is a flat list of tiles: one tile per colour of each product (a product without a colour option is one
// tile), then the gift card as a tile of its own. Every product detail is loaded up front so a tile opens instantly,
// in place, without a page load. Every read is guarded: a failed read hides that piece rather than breaking the page.
import { getBenefits, getLegalPages, getSections, getTestimonials } from "./content";
import { fetchProductBySlug, fetchProducts } from "../wix/storefront/catalog";
import { fetchChoiceMedia } from "../wix/storefront/choice-media";
import { fetchGiftCardProduct, type GiftCardProduct } from "../wix/storefront/gift-card";
import type { ProductDetail } from "../wix/storefront/types";
import { mediaKey } from "../wix/media";
import { FEATURED_PRODUCT_SLUG } from "./site";

/** One colour of a product, with what its tile shows: picking the dot on a tile switches the tile to it. */
export type Swatch = {
  name: string; code: string; current: boolean;
  imageUrl: string; href: string; price: string; compareAtPrice: string | null; soldOut: boolean;
};

export type StoreItem = {
  key: string;
  kind: "product" | "gift";
  /** Product slug (kind "product"). */
  slug?: string;
  /** The colour this tile preselects: option name and choice name, as the URL carries them (?Colour=Colour+2). */
  pick?: { option: string; choice: string };
  href: string;
  name: string;
  /** Second caption line: the colour name, or "Gift Card". */
  label: string;
  colorCode: string | null;
  /** All colours of the product (its swatches), when it has a colour option; this tile's own colour is marked. */
  swatches: Swatch[];
  imageUrl: string;
  /** The second photo, shown on hover; "" when the item has only one. */
  hoverUrl: string;
  price: string;
  compareAtPrice: string | null;
  soldOut: boolean;
};

export type StoreData = {
  items: StoreItem[];
  details: Record<string, ProductDetail>;
  choiceMedia: Record<string, Record<string, string>>;
  gift: GiftCardProduct | null;
  giftTitle: string;
  giftIntro?: string;
  /** The Contact panel: its title and the business details (CMS → SiteSections: contact, contact-address / -details / -hours). */
  contact: { title: string; details: { title: string; body: string }[] };
  /** The business name (wordmark, page titles): CMS → SiteSections, row "business-name". */
  businessName: string;
  /** The Home title and welcome text (CMS → SiteSections, row "home-intro"). */
  intro: { title?: string; body?: string };
  about: { title?: string; body?: string; image?: string; ctaLabel?: string; ctaLink?: string; benefitsTitle?: string; benefits: string[] } | null;
  reviews: { title: string; quotes: { quote: string; name: string }[] };
  legal: { slug: string; title: string }[];
  credit?: string;
};

const MAX_PRODUCTS = 12;

export async function loadStore(): Promise<StoreData> {
  const [s, testimonials, benefits, legalRows, gift] = await Promise.all([
    getSections(), getTestimonials(), getBenefits(), getLegalPages(), fetchGiftCardProduct(),
  ]);

  let list: { slug: string }[] = [];
  try { list = await fetchProducts({ limit: MAX_PRODUCTS }); } catch (err) { console.error("[store] products", err); }
  // The pinned product (its colourways) leads; the rest follow newest first.
  list = [...list].sort((x, y) => Number(y.slug === FEATURED_PRODUCT_SLUG) - Number(x.slug === FEATURED_PRODUCT_SLUG));
  const loaded = await Promise.all(list.map(async (p) => {
    try { return { detail: await fetchProductBySlug(p.slug), media: await fetchChoiceMedia(p.slug) }; } catch (err) { console.error("[store] product", p.slug, err); return null; }
  }));

  const items: StoreItem[] = [];
  const details: StoreData["details"] = {};
  const choiceMedia: StoreData["choiceMedia"] = {};
  for (const row of loaded) {
    const f = row?.detail;
    if (!f) continue;
    details[f.slug] = f;
    choiceMedia[f.slug] = row.media;
    const base = `/products/${encodeURIComponent(f.slug)}`;
    const colour = f.options.find((o) => o.isColor);
    if (!colour) {
      const second = f.gallery.find((u) => mediaKey(u) !== mediaKey(f.imageUrl)) ?? "";
      items.push({ key: f.id, kind: "product", slug: f.slug, href: base, name: f.name, label: "", colorCode: null, swatches: [], imageUrl: f.imageUrl, hoverUrl: second, price: f.price, compareAtPrice: f.compareAtPrice ?? null, soldOut: f.availability === "OUT_OF_STOCK" });
      continue;
    }
    // A colour tile's second photo: the first gallery photo that belongs to no colour (a detail or group shot).
    const colourKeys = new Set(Object.values(row.media).map(mediaKey));
    const shared = f.gallery.find((u) => !colourKeys.has(mediaKey(u))) ?? "";
    // each colour as the tile would show it: its photo, its cheapest buyable price, whether any of it is in stock
    const looks = colour.choices.map((c) => {
      const vs = f.variants.filter((v) => v.choiceIds[colour.id] === c.choiceId);
      const buyable = vs.filter((v) => v.inStock || v.preorderEnabled);
      const best = [...(buyable.length ? buyable : vs)].sort((a, b) => a.priceAmount - b.priceAmount)[0];
      return {
        c, imageUrl: row.media[c.choiceId] ?? f.imageUrl, price: best?.price ?? f.price,
        compareAtPrice: best?.compareAtPrice ?? null, soldOut: buyable.length === 0,
        href: `${base}?${encodeURIComponent(colour.name)}=${encodeURIComponent(c.name)}`,
      };
    });
    // the pinned product shows every colourway as its own tile; any other product with colours gets one tile (its first
    // colour), and its dots switch that tile between them
    for (const l of f.slug === FEATURED_PRODUCT_SLUG ? looks : looks.slice(0, 1)) {
      items.push({
        key: `${f.id}:${l.c.choiceId}`, kind: "product", slug: f.slug, pick: { option: colour.name, choice: l.c.name },
        href: l.href, name: f.name, label: l.c.name, colorCode: l.c.colorCode, imageUrl: l.imageUrl, hoverUrl: shared,
        swatches: looks.map((o) => ({
          name: o.c.name, code: o.c.colorCode ?? "#cccccc", current: o.c.choiceId === l.c.choiceId,
          imageUrl: o.imageUrl, href: o.href, price: o.price, compareAtPrice: o.compareAtPrice, soldOut: o.soldOut,
        })),
        price: l.price, compareAtPrice: l.compareAtPrice, soldOut: l.soldOut,
      });
    }
  }

  const giftTitle = s["gift-card"]?.title ?? gift?.name ?? "Gift Card";
  if (gift) {
    const from = gift.presets[0]?.price;
    items.push({ key: "gift", kind: "gift", href: "/gift-card", name: giftTitle, label: "Gift Card", colorCode: null, swatches: [], imageUrl: gift.imageUrl, hoverUrl: "", price: from ? `From ${from}` : "", compareAtPrice: null, soldOut: false });
  }

  const a = s["home-about"];
  return {
    items: spread(items), details, choiceMedia, gift, giftTitle, giftIntro: s["gift-card"]?.body,
    businessName: s["business-name"]?.title ?? "",
    intro: { title: s["home-intro"]?.title, body: s["home-intro"]?.body },
    contact: {
      title: s.contact?.title ?? "Contact Us",
      details: ["contact-address", "contact-details", "contact-hours"].map((k) => s[k]).filter((d) => d?.title || d?.body).map((d) => ({ title: d!.title ?? "", body: d!.body ?? "" })),
    },
    about: a ? { title: a.title, body: a.body, image: a.image, ctaLabel: a.ctaLabel, ctaLink: a.ctaLink, benefitsTitle: s["home-why"]?.title, benefits: benefits.map((b) => String(b.text)) } : null,
    reviews: { title: s["home-testimonials"]?.title ?? "Testimonials", quotes: testimonials.map((t) => ({ quote: String(t.quote), name: String(t.name) })) },
    legal: legalRows.map((p) => ({ slug: String(p.slug), title: String(p.title) })),
    credit: s["footer-credit"]?.body,
  };
}

/**
 * Tile order with no photo repeated next to itself: no tile shows the same photo as either of the four before it. That
 * covers the tile beside it (in Grid and in Strip) and the tile above it in a 2-, 3- or 4-column grid. Greedy and stable:
 * the earliest tile that fits takes the slot, so the pinned product's colours stay first and the gift card stays last.
 */
function spread(items: StoreItem[]): StoreItem[] {
  const look = (it: StoreItem) => mediaKey(it.imageUrl);
  const pool = items.filter((it) => it.kind !== "gift");
  const out: StoreItem[] = [];
  while (pool.length) {
    const recent = new Set(out.slice(-4).map(look));
    const k = pool.findIndex((it) => !recent.has(look(it)));
    out.push(...pool.splice(k >= 0 ? k : 0, 1));
  }
  return [...out, ...items.filter((it) => it.kind === "gift")];
}

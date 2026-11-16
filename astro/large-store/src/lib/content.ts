// Server-side reads of the owner-editable copy (Wix CMS collections created by
// the site template). Every read is guarded: a failed read hides that piece of copy rather
// than breaking the page, because an unhandled SSR throw truncates the response mid-stream.
import { queryItems, getItemBy } from "../wix/cms/items";
import type { CmsItem } from "../wix/cms/types";
import { BUSINESS_NAME, GRID_BANNER_AT, RAIL_BANNER_AT, type GridBanner } from "./site";

/** One slot of site copy, addressed by its `key` (hero, new, spotlight-1, footer, …). */
export type Section = {
  key: string;
  kicker?: string;
  title?: string;
  body?: string;
  bodySecondary?: string;
  ctaLabel?: string;
  ctaLink?: string;
  /** A product rail's category — changes WHAT it shows, never how it is composed. */
  categorySlug?: string;
  image?: string;
  imageMobile?: string;
};

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items } = await queryItems("SiteSections", { limit: 100 });
    return Object.fromEntries(items.map((i) => [String(i.key), i as unknown as Section]));
  } catch (err) {
    console.error("content: SiteSections read failed", err);
    return {};
  }
}

async function ordered(collection: string): Promise<CmsItem[]> {
  try {
    return (await queryItems(collection, { sort: [{ field: "order", direction: "asc" }], limit: 50 })).items;
  } catch (err) {
    console.error(`content: ${collection} read failed`, err);
    return [];
  }
}
export const getTestimonials = () => ordered("Testimonials");
export const getLegalPages = () => ordered("LegalPages");

export async function getLegalPage(slug: string): Promise<CmsItem | null> {
  try {
    return await getItemBy("LegalPages", "slug", slug);
  } catch (err) {
    console.error(`content: legal page "${slug}" read failed`, err);
    return null;
  }
}

/** Banner content from the CMS rows banner-fresh / banner-sale; a banner whose row is missing is simply not shown. */
export function getBanners(sections: Record<string, Section>): { grid: GridBanner[]; rail: Partial<Record<"new" | "best", GridBanner>> } {
  const make = (sec: Section | undefined, at: number): GridBanner | undefined =>
    sec?.title && sec.ctaLabel && sec.image ? { at, kicker: sec.kicker, title: sec.title, body: sec.body, ctaLabel: sec.ctaLabel, href: sec.ctaLink || "/shop", image: sec.image } : undefined;
  const fresh = sections["banner-fresh"], sale = sections["banner-sale"];
  return {
    grid: [make(fresh, GRID_BANNER_AT[0]), make(sale, GRID_BANNER_AT[1])].filter((b): b is GridBanner => !!b),
    rail: { new: make(fresh, RAIL_BANNER_AT.new), best: make(sale, RAIL_BANNER_AT.best) },
  };
}

/** The rating cell of the reviews strip: CMS row reviews-summary (title = rating, kicker = count, body = note); none = no cell. */
export function getReviewSummary(sections: Record<string, Section>): { rating: string; count: string; note: string } | null {
  const r = sections["reviews-summary"];
  return r?.title ? { rating: r.title, count: r.kicker ?? "", note: r.body ?? "" } : null;
}

/** Footer social links: CMS rows social-* (title = label, ctaLink = URL). */
export function getSocialLinks(sections: Record<string, Section>): { label: string; href: string }[] {
  return Object.values(sections).filter((x) => x.key.startsWith("social-") && x.title && x.ctaLink).map((x) => ({ label: x.title!, href: x.ctaLink! }));
}

export const getBrand = (sections: Record<string, Section>) => sections.brand?.title || BUSINESS_NAME;

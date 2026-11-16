// Server-side reads of the owner-editable copy (Wix CMS collections created by
// the site template). Every read is guarded: a failed read hides that piece of copy
// rather than breaking the page, because an unhandled SSR throw truncates the response.
import { queryItems, getItemBy } from "../wix/cms/items";
import type { CmsItem } from "../wix/cms/types";
import { BUSINESS_NAME, NAV, PRODUCT_URL } from "./site";

/** One home-page section, addressed by its `key` (hero, statement, about, …). */
export type Section = {
  key: string;
  kicker?: string;
  title?: string;
  body?: string;
  bodySecondary?: string;
  ctaLabel?: string;
  image?: string;
  imageMobile?: string;
  /** Footer item only: the business name (header wordmark, footer, page titles). */
  brand?: string;
  /** Header menu label; a section without one is not in the menu. */
  navLabel?: string;
};

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items } = await queryItems("HomeSections", { limit: 50 });
    return Object.fromEntries(items.map((i) => [String(i.key), i as unknown as Section]));
  } catch (err) {
    console.error("HomeSections read failed", err);
    return {};
  }
}

/** The business name, editable in CMS → HomeSections → footer → "Brand name". */
export const brandOf = (s: Record<string, Section>) => s.footer?.brand?.trim() || BUSINESS_NAME;

/** Header / footer menu, built from the sections' "Header menu label" in the CMS (About, Features, Technology
 *  anchors on the home page; the buy section's label links to the product page). Falls back to the built-in list. */
export function navOf(s: Record<string, Section>): { label: string; href: string }[] {
  const links = [
    ["about", "/#about"],
    ["features", "/#features"],
    ["technology", "/#technology"],
    ["buy", PRODUCT_URL],
  ].flatMap(([key, href]) => (s[key]?.navLabel?.trim() ? [{ label: s[key].navLabel!.trim(), href }] : []));
  return links.length ? links : [...NAV, { label: "Product", href: PRODUCT_URL }];
}

async function ordered(collection: string): Promise<CmsItem[]> {
  try {
    return (await queryItems(collection, { sort: [{ field: "order", direction: "asc" }], limit: 50 })).items;
  } catch (err) {
    console.error(`${collection} read failed`, err);
    return [];
  }
}
export const getFeatures = () => ordered("Features");
export const getTestimonials = () => ordered("Testimonials");
export const getLegalPages = () => ordered("LegalPages");

export async function getLegalPage(slug: string): Promise<CmsItem | null> {
  try {
    return await getItemBy("LegalPages", "slug", slug);
  } catch (err) {
    console.error(`LegalPages lookup failed for "${slug}"`, err);
    return null;
  }
}

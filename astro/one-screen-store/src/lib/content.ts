// Server-side reads of the owner-editable copy (Wix CMS collections: SiteSections, Testimonials, Benefits, Faqs, LegalPages). Every read is
// guarded: a failed read hides that piece of copy rather than breaking the page, because an unhandled SSR throw
// truncates the response mid-stream.
import { queryItems, getItemBy } from "../wix/cms/items";
import type { CmsItem } from "../wix/cms/types";

/** One slot of site copy, addressed by its `key` (home-intro, shop, contact-address, …). */
export type Section = { key: string; title?: string; body?: string; ctaLabel?: string; ctaLink?: string; image?: string };

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items } = await queryItems("SiteSections", { limit: 100 });
    return Object.fromEntries(items.map((i) => [String(i.key), i as unknown as Section]));
  } catch (err) {
    console.error("[CMS read]", err);
    return {};
  }
}

async function ordered(collection: string): Promise<CmsItem[]> {
  try {
    return (await queryItems(collection, { sort: [{ field: "order", direction: "asc" }], limit: 50 })).items;
  } catch (err) {
    console.error("[CMS read]", err);
    return [];
  }
}
export const getTestimonials = () => ordered("Testimonials");
export const getLegalPages = () => ordered("LegalPages");
export type Faq = { question: string; answer: string; linkLabel?: string; linkHref?: string };
export const getFaqs = async () => (await ordered("Faqs")) as unknown as Faq[];

export async function getLegalPage(slug: string): Promise<CmsItem | null> {
  try {
    return await getItemBy("LegalPages", "slug", slug);
  } catch (err) {
    console.error("[CMS read]", err);
    return null;
  }
}

/** "Why Us": the benefit points, in the owner's order. A failed read hides the section. */
export const getBenefits = async () => (await ordered("Benefits")) as unknown as { text: string }[];

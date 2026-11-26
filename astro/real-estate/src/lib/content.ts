// Server-side reads of the owner-editable copy (Wix CMS collections provisioned with the site template).
// Every read is guarded: a failed read is logged and hides that piece of copy rather than breaking the page.
import { items } from "@wix/data";

/** One block of page copy in the SiteContent collection, addressed by `key` (site, hero, browse, listings, agents, neighborhoods, about, aboutPage,
 *  aboutStory, valueBand, stats, benefits, testimonials, faq, contact, sell, sellSteps, sold, valuation, rating, footer). */
export type CopyBlock = { key: string; title?: string; body?: string; bodySecondary?: string; ctaLabel?: string; hours?: string; credit?: string; image?: string };
export type Platform = "facebook" | "x" | "instagram" | "youtube" | "tiktok" | "pinterest" | "linkedin" | "threads" | "whatsapp";
export type SocialLink = { _id: string; platform: Platform; url: string; order: number };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };
export type Testimonial = { _id: string; name: string; quote: string; title?: string; order: number };
export type FaqItem = { _id: string; question: string; answer: string; order: number };
export type Stat = { _id: string; value: string; label: string; order: number };
export type Benefit = { _id: string; title: string; body: string; order: number; image?: string };

export const PLATFORMS: Platform[] = ["facebook", "x", "instagram", "youtube", "tiktok", "pinterest", "linkedin", "threads", "whatsapp"];

async function rows<T>(collection: string, limit = 50, sort = "order"): Promise<T[]> {
  try {
    const { items: r } = await items.query(collection).ascending(sort).limit(limit).find();
    return r as unknown as T[];
  } catch (e) { console.error("[content] read failed", collection, e); return []; }
}

export async function getCopy(): Promise<Record<string, CopyBlock>> {
  try {
    const { items: r } = await items.query("SiteContent").limit(50).find();
    return Object.fromEntries(r.map((x: any) => [String(x.key), x as CopyBlock]));
  } catch (e) { console.error("[content] SiteContent read failed", e); return {}; }
}
export const getSocialLinks = async () => (await rows<SocialLink>("SocialLinks", 10)).filter((r) => PLATFORMS.includes(r.platform) && !!r.url);
export const getLegalPages = () => rows<LegalPage>("LegalPages", 20);
export const getTestimonials = () => rows<Testimonial>("Testimonials", 12);
export const getFaq = () => rows<FaqItem>("Faq", 30);
export const getStats = () => rows<Stat>("Stats", 8);
export const getBenefits = () => rows<Benefit>("Benefits", 12);
export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: r } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (r[0] as unknown as LegalPage) ?? null;
  } catch (e) { console.error("[content] legal page read failed", slug, e); return null; }
}

export type SellStep = { _id: string; title: string; body: string; order: number };
export const getSellSteps = () => rows<SellStep>("SellSteps", 8);

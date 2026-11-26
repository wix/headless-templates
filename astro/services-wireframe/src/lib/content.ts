// Server-side reads of the owner-editable copy (Wix CMS collections provisioned with the site template).
// Every read is guarded: a failed read is logged and hides that piece of copy rather than breaking the page.
import { items } from "@wix/data";

/** One block of page copy in the SiteContent collection, addressed by `key` (site, hero, browse, services, team, locations, about, aboutPage,
 *  stats, benefits, testimonials, faq, contact, closing, footer). */
export type CopyBlock = {
  key: string; title?: string; body?: string; bodySecondary?: string; ctaLabel?: string; hours?: string; credit?: string; image?: string;
  /** Two-tone headline (About on Home): the dark part, then the muted part. */
  headline?: string; headlineMuted?: string;
  /** Two detail tiles (About on Home). */
  item1Title?: string; item1Body?: string; item2Title?: string; item2Body?: string;
};
export type Platform = "facebook" | "x" | "instagram" | "youtube" | "tiktok" | "pinterest" | "linkedin" | "threads" | "whatsapp";
export type SocialLink = { _id: string; platform: Platform; url: string; order: number };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };
/** A client review; `service` and `location` point at what the client booked and where. */
export type Testimonial = { _id: string; name: string; quote: string; order: number; service?: string; location?: string };
export type FaqItem = { _id: string; question: string; answer: string; order: number; category?: string; service?: string; page?: string };
/** A text topic of the About The Service block (ServiceAbout collection), tied to a category or a service. */
export type AboutTopic = { _id: string; title: string; body: string; order: number; category?: string; service?: string };
export type Stat = { _id: string; value: string; label: string; order: number };
export type Benefit = { _id: string; title: string; body: string; order: number };

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
/** Every FAQ row. A row may point at a category or a service; one that points at neither is a general question. */
const allFaq = () => rows<FaqItem>("Faq", 200);
const refId = (v: unknown) => (v && typeof v === "object" ? String((v as any)._id ?? "") : String(v ?? ""));
const normPath = (p?: string) => { const v = (p ?? "").trim().replace(/\/+$/, ""); return v && !v.startsWith("/") ? "/" + v : v; };
/** Rows whose `page` field names this path (e.g. /about): a custom question for any page. */
const onPage = (f: FaqItem, path?: string) => !!path && !!normPath(f.page) && normPath(f.page) === normPath(path);
/** The general questions (Home): no category, no service, and no page other than Home. */
export const getFaq = async () => (await allFaq()).filter((f) => !refId(f.category) && !refId(f.service) && (!normPath(f.page) || normPath(f.page) === ""));
/** Custom questions for any page, by its path. */
export const getPageFaq = async (path: string) => (await allFaq()).filter((f) => onPage(f, path));
/** A category page's questions: rows pinned to its path, then rows whose category points here. */
export async function getCategoryFaq(categoryId: string, path?: string) {
  const rows = await allFaq();
  return [...rows.filter((f) => onPage(f, path)), ...rows.filter((f) => refId(f.category) === categoryId && !onPage(f, path))];
}
/** A service page's questions: rows pinned to its path, its own, then its category's. */
export async function getServiceFaq(serviceId: string, categoryId?: string, path?: string) {
  const rows = await allFaq();
  return [...rows.filter((f) => onPage(f, path)), ...rows.filter((f) => !onPage(f, path) && refId(f.service) === serviceId),
    ...(categoryId ? rows.filter((f) => !onPage(f, path) && !refId(f.service) && refId(f.category) === categoryId) : [])];
}
/** About The Service topics for a category (or a service). */
export async function getAbout(opts: { category?: string; service?: string }) {
  const rows = await (async () => { try { const { items: r } = await items.query("ServiceAbout").ascending("order").limit(100).find(); return r as unknown as AboutTopic[]; } catch (e) { console.error("[content] ServiceAbout read failed", e); return []; } })();
  return rows.filter((r) => (opts.service && refId(r.service) === opts.service) || (opts.category && !refId(r.service) && refId(r.category) === opts.category));
}
export const getStats = () => rows<Stat>("Stats", 8);
export const getBenefits = () => rows<Benefit>("Benefits", 12);
export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: r } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (r[0] as unknown as LegalPage) ?? null;
  } catch (e) { console.error("[content] legal page read failed", slug, e); return null; }
}

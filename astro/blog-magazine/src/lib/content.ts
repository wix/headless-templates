// Server-side reads of the owner-editable copy (Wix CMS collections: SiteContent, SocialLinks, TeamMembers, LegalPages, Sections — provisioned with the site template) and of the Wix Forms ids.
// Every read is guarded: a failed read hides that piece of copy rather than breaking the page.
import { items } from "@wix/data";
import { forms } from "@wix/forms";

/** One block of page copy in the SiteContent collection, addressed by `key` (site, welcome, subscribe, about, contact, footer). */
export type CopyBlock = { key: string; title?: string; body?: string; bodySecondary?: string; ctaLabel?: string; hours?: string; credit?: string; image?: string };
export type Platform = "facebook" | "x" | "instagram" | "youtube" | "tiktok" | "pinterest" | "linkedin" | "threads" | "whatsapp";
export type SocialLink = { _id: string; platform: Platform; url: string; order: number };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };
/** A team row. With `memberId` it is also that author's profile: photo and bio on the byline and on /author/<slug>. */
export type TeamMember = { _id: string; name: string; bio: string; image?: string; order: number; memberId?: string; slug?: string };
/** A section groups Blog categories (Wix Blog categories are flat): `categories` holds category slugs, in order. */
export type SectionRow = { _id: string; title: string; slug: string; description?: string; order: number; categories?: string[] };

// The site template provisions four; the other icons are ready for the owner's own networks.
export const PLATFORMS: Platform[] = ["facebook", "x", "instagram", "youtube", "tiktok", "pinterest", "linkedin", "threads", "whatsapp"];

export async function getCopy(): Promise<Record<string, CopyBlock>> {
  try {
    const { items: rows } = await items.query("SiteContent").limit(50).find();
    return Object.fromEntries(rows.map((r: any) => [String(r.key), r as CopyBlock]));
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return {}; }
}

/** The social bar: one row per platform in SocialLinks. Unknown platforms and rows without a URL are dropped. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { items: rows } = await items.query("SocialLinks").ascending("order").limit(10).find();
    return (rows as unknown as SocialLink[]).filter((r) => PLATFORMS.includes(r.platform) && !!r.url);
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return []; }
}

export async function getLegalPages(): Promise<LegalPage[]> {
  try {
    const { items: rows } = await items.query("LegalPages").ascending("order").limit(20).find();
    return rows as unknown as LegalPage[];
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return []; }
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: rows } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (rows[0] as unknown as LegalPage) ?? null;
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return null; }
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    const { items: rows } = await items.query("TeamMembers").ascending("order").limit(12).find();
    return rows as unknown as TeamMember[];
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return []; }
}

let teamCache: { at: number; rows: TeamMember[] } | null = null;
/** The team, cached 60 s (bylines on every card ask for it). */
export async function getTeamCached(): Promise<TeamMember[]> {
  if (teamCache && Date.now() - teamCache.at < 60_000) return teamCache.rows;
  const rows = await getTeam();
  teamCache = { at: Date.now(), rows };
  return rows;
}

/** The sections (CMS Sections), ordered. An empty or failed read means the site has no sections: navigation falls back to categories. */
export async function getSectionRows(): Promise<SectionRow[]> {
  try {
    const { items: rows } = await items.query("Sections").ascending("order").limit(12).find();
    return rows as unknown as SectionRow[];
  } catch (e) { console.error("[content] CMS read failed", String(e).slice(0, 200)); return []; }
}

/** The site's Wix Forms by name (Contact, Newsletter), read live so a cloned site finds its own. */
let formList: any[] | null = null;
async function siteForms(): Promise<any[]> {
  if (!formList) {
    const res: any = await forms.queryForms().eq("namespace" as any, "wix.form_app.form").find();
    formList = res.items ?? [];
  }
  return formList!;
}
export async function getFormId(name: string): Promise<string | null> {
  try { const f = (await siteForms()).find((x) => x.name === name); return f ? f._id ?? f.id : null; }
  catch (e) { console.error("[forms] list failed", String(e).slice(0, 200)); return null; }
}

/** One visible field of a form, as the contact page renders it (labels, required flags and limits come from the form schema). */
export type FormField = { target: string; label: string; required: boolean; format?: string; textarea: boolean; min?: number; max?: number };
/** The Contact form (or the site's first form) with its fields, for the server to render; null when the site has none. */
export async function getContactForm(): Promise<{ formId: string; fields: FormField[] } | null> {
  try {
    const list = await siteForms();
    const form = list.find((f) => f.name === "Contact") ?? list[0];
    if (!form) return null;
    const fields: FormField[] = (form.fields ?? []).filter((f: any) => f.target && !f.hidden).map((f: any) => ({
      target: f.target, label: f.view?.label ?? f.target, required: !!f.validation?.required, format: f.validation?.string?.format,
      textarea: f.view?.fieldType === "TEXT_AREA" || f.target === "message", min: f.validation?.string?.minLength, max: f.validation?.string?.maxLength,
    }));
    return fields.length ? { formId: form._id ?? form.id, fields } : null;
  } catch (e) { console.error("[forms] contact form failed", String(e).slice(0, 200)); return null; }
}

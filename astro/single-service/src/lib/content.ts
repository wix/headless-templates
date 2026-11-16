// Server-side reads of the owner-editable copy (Wix CMS collections created by seed/cms-plan.json).
// Every read is guarded: a failed read hides that piece of copy rather than breaking the page,
// because an unhandled SSR throw truncates the response (astro.md Caveat A3).
import { items } from "@wix/data";

/** One page section, addressed by its `key`. */
export type Section = {
  key: string;
  title?: string;
  body?: string;
  bodySecondary?: string;
  ctaLabel?: string;
  ctaSecondaryLabel?: string;
  hours?: string;
  credit?: string;
  image?: string;
  imageMobile?: string;
};
/** A repeated item in a group (step, stat, testimonial, faq, included), ordered by `order`. */
export type Item = { _id: string; group: string; order: number; title: string; body: string; avatar?: string; image?: string };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items: rows } = await items.query("HomeSections").limit(50).find();
    return Object.fromEntries(rows.map((r: any) => [String(r.key), r as Section]));
  } catch (e) {
    console.error("CMS read failed", e);
    return {};
  }
}

export async function getItems(): Promise<Record<string, Item[]>> {
  try {
    const { items: rows } = await items.query("HomeItems").ascending("order").limit(100).find();
    const out: Record<string, Item[]> = {};
    for (const r of rows as unknown as Item[]) (out[r.group] ??= []).push(r);
    return out;
  } catch (e) {
    console.error("CMS read failed", e);
    return {};
  }
}

export async function getLegalPages(): Promise<LegalPage[]> {
  try {
    const { items: rows } = await items.query("LegalPages").ascending("order").limit(50).find();
    return rows as unknown as LegalPage[];
  } catch (e) {
    console.error("CMS read failed", e);
    return [];
  }
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: rows } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (rows[0] as unknown as LegalPage) ?? null;
  } catch (e) {
    console.error("CMS read failed", e);
    return null;
  }
}

// Server-side reads of the owner-editable copy (Wix CMS collections).
// Every read is guarded: a failed read hides that piece of copy rather than breaking the page,
// because an unhandled SSR throw truncates the response.
import { items } from "@wix/data";

/** One page section, addressed by its `key` (hero, services, footer). */
export type Section = {
  key: string;
  title?: string;
  body?: string;
  bodySecondary?: string;
  ctaLabel?: string;
  hours?: string;
  credit?: string;
  image?: string;
  imageMobile?: string;
  value?: string;
  endDate?: string;
};
export type SocialLink = { _id: string; platform: "instagram" | "tiktok" | "facebook"; url: string; order: number };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items: rows } = await items.query("HomeSections").limit(50).find();
    return Object.fromEntries(rows.map((r: any) => [String(r.key), r as Section]));
  } catch (err) { console.error(err);
    return {};
  }
}

export async function getLegalPages(): Promise<LegalPage[]> {
  try {
    const { items: rows } = await items.query("LegalPages").ascending("order").limit(50).find();
    return rows as unknown as LegalPage[];
  } catch (err) { console.error(err);
    return [];
  }
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: rows } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (rows[0] as unknown as LegalPage) ?? null;
  } catch (err) { console.error(err);
    return null;
  }
}

/** The footer's social bar: one row per platform in the SocialLinks collection (platform, url, order). Unknown platforms and rows without a URL are dropped. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { items: rows } = await items.query("SocialLinks").ascending("order").limit(10).find();
    return (rows as unknown as SocialLink[]).filter((r) => ["instagram", "tiktok", "facebook"].includes(r.platform) && r.url);
  } catch (err) { console.error(err);
    return [];
  }
}

/** The repeated blocks of Home and About (proof numbers, features, testimonials): rows of ContentItems by `group`, ordered. */
export type ContentItem = { _id: string; group: string; order: number; title?: string; body?: string; value?: string; subtitle?: string; image?: string; link?: string };
export async function getContentItems(group: string): Promise<ContentItem[]> {
  try {
    const { items: rows } = await items.query("ContentItems").eq("group", group).ascending("order").limit(20).find();
    return rows as unknown as ContentItem[];
  } catch (err) { console.error(err);
    return [];
  }
}

/** Level tags on timetable cards: ContentItems group "levels" (title = class name, value = Beginner / Advanced ...). Sets svc.level. */
export async function applyLevels<T extends { name: string; level?: string }>(services: T[]): Promise<T[]> {
  const rows = await getContentItems("levels");
  const m = new Map(rows.map((r) => [String(r.title ?? "").trim().toLowerCase(), String(r.value ?? "").trim()]));
  for (const s of services) s.level = m.get(s.name.trim().toLowerCase()) || undefined;
  return services;
}

/** Testimonials for the reviews rail: name (title), quote (body), favourite class (subtitle), years with us (value), photo (image; else an instructor photo). */
export function toReviews(rows: ContentItem[], photos: (string | undefined)[], cls?: string) {
  return rows.slice(0, 9).map((r, i) => ({ name: r.title ?? "", body: r.body ?? "", years: Number(r.value) || 1, cls: cls ?? r.subtitle ?? "", photo: r.image || photos[i % Math.max(photos.length, 1)] }));
}

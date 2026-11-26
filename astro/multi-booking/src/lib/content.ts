// Server-side reads of the owner-editable copy (Wix CMS collections: HomeSections, ContentItems, LegalPages, SocialLinks, GalleryItems).
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
};
export type SocialLink = { _id: string; platform: "instagram" | "tiktok" | "facebook"; url: string; order: number };
export type LegalPage = { _id: string; title: string; slug: string; body: string; order: number };

export async function getSections(): Promise<Record<string, Section>> {
  try {
    const { items: rows } = await items.query("HomeSections").limit(50).find();
    return Object.fromEntries(rows.map((r: any) => [String(r.key), r as Section]));
  } catch (e) {
    console.error("content read failed", e);
    return {};
  }
}

export async function getLegalPages(): Promise<LegalPage[]> {
  try {
    const { items: rows } = await items.query("LegalPages").ascending("order").limit(50).find();
    return rows as unknown as LegalPage[];
  } catch (e) {
    console.error("content read failed", e);
    return [];
  }
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  try {
    const { items: rows } = await items.query("LegalPages").eq("slug", slug).limit(1).find();
    return (rows[0] as unknown as LegalPage) ?? null;
  } catch (e) {
    console.error("content read failed", e);
    return null;
  }
}

/** The footer's social bar: one row per platform in the SocialLinks collection (platform, url, order). Unknown platforms and rows without a URL are dropped. */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { items: rows } = await items.query("SocialLinks").ascending("order").limit(10).find();
    return (rows as unknown as SocialLink[]).filter((r) => ["instagram", "tiktok", "facebook"].includes(r.platform) && r.url);
  } catch (e) {
    console.error("content read failed", e);
    return [];
  }
}

/** The repeated blocks of Home and About (proof numbers, features, testimonials, FAQ): rows of ContentItems by `group`, ordered. */
export type ContentItem = { _id: string; group: string; order: number; title?: string; body?: string; value?: string };
export async function getContentItems(group: string): Promise<ContentItem[]> {
  try {
    const { items: rows } = await items.query("ContentItems").eq("group", group).ascending("order").limit(20).find();
    return rows as unknown as ContentItem[];
  } catch (e) {
    console.error("content read failed", e);
    return [];
  }
}

/** The Gallery: rows of GalleryItems (image, alt, caption, order). Rows without an image are dropped. */
export type GalleryItem = { _id: string; order: number; image?: string; alt?: string; caption?: string };
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const { items: rows } = await items.query("GalleryItems").ascending("order").limit(12).find();
    return (rows as unknown as GalleryItem[]).filter((r) => r.image);
  } catch (e) {
    console.error("content read failed", e);
    return [];
  }
}

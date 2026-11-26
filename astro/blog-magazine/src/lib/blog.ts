// Server-side reads of the Wix Blog (Blog V3): posts, categories, tags, authors. Every read is guarded: a failed read
// returns an empty result rather than throwing, because an unhandled SSR throw truncates the response.
//
// Two ways of reading posts, on purpose:
//   - LISTS (Home, category, tag, related): direct queryPosts, always fresh, paged by `skip`/`limit`.
//   - SEARCH: one cached index of every post (title, excerpt, tags, categories and the first 3000 characters of
//     the body, from the CONTENT_TEXT fieldset), because queryPosts can only match the START of a title. The index lives in
//     module memory for 60 seconds and is built in pages of 100. It is comfortable for a few hundred posts; past ~1000,
//     move the index to a CMS collection kept up to date by a Blog event (README "Search").
import { posts, categories, tags } from "@wix/blog";
import { members } from "@wix/members";
import { media } from "@wix/sdk";
import { getTeamCached } from "./content";

export type Cat = { id: string; label: string; slug: string; description: string; count: number };
export type Tag = { id: string; label: string; slug: string; count: number };
export type Card = {
  id: string; slug: string; title: string; excerpt: string; date: string; minutes: number;
  categoryIds: string[]; tagIds: string[]; cover: any; featured: boolean; authorId: string;
};
export type Doc = Card & { text: string };

const TTL = 60_000;
const SKEW = (r: any) => r?.items ?? [];

export function toCard(p: any): Card {
  return {
    id: p._id, slug: p.slug, title: p.title ?? "", excerpt: p.excerpt ?? "", date: new Date(p.firstPublishedDate ?? p._createdDate ?? Date.now()).toISOString(),
    minutes: p.minutesToRead ?? 1, categoryIds: p.categoryIds ?? [], tagIds: p.tagIds ?? [], cover: p.media?.wixMedia?.image ?? null,
    featured: !!p.featured, authorId: p.memberId ?? "",
  };
}

/** A cover as a URL cropped to w x h. Wix images come back as `wix:image://` ids (never hand-build a CDN URL); an absolute URL passes through. */
export function img(c: any, w: number, h: number): string {
  if (!c) return "";
  try {
    const v = typeof c === "string" ? c : c.url ?? c.id ?? c;
    if (typeof v === "string" && v.startsWith("wix:image://")) return media.getScaledToFillImageUrl(v, w, h, {});
    if (typeof v === "string" && /^https?:/.test(v)) return v;
    if (typeof c === "object" && c.id) return media.getScaledToFillImageUrl(`wix:image://v1/${c.id}/${c.filename ?? "image.jpg"}#originWidth=${c.width ?? w}&originHeight=${c.height ?? h}`, w, h, {});
  } catch (e) { console.error("[blog] image url failed", String(e).slice(0, 200)); /* fall through to the quiet frame */ }
  return "";
}

// ── categories and tags ─────────────────────────────────────────────────────────────────────────────────────
let catCache: { at: number; list: Cat[] } | null = null;
export async function getCategories(): Promise<Cat[]> {
  if (catCache && Date.now() - catCache.at < TTL) return catCache.list;
  try {
    const res: any = await categories.queryCategories().limit(100).find();
    // Dashboard order = displayPosition (the owner drags categories in Blog > Categories); unpositioned ones (-1) come last, by name.
    const pos = (c: any) => (c.displayPosition ?? -1) < 0 ? Number.MAX_SAFE_INTEGER : c.displayPosition;
    const list = SKEW(res).sort((a: any, b: any) => pos(a) - pos(b) || String(a.label).localeCompare(String(b.label), undefined, { numeric: true }))
      .map((c: any): Cat => ({ id: c._id, label: c.label, slug: c.slug, description: c.description ?? "", count: c.postCount ?? 0 }));
    catCache = { at: Date.now(), list };
    return list;
  } catch (e) { console.error("[blog] categories failed", e); return catCache?.list ?? []; }
}

let tagCache: { at: number; list: Tag[] } | null = null;
export async function getTags(): Promise<Tag[]> {
  if (tagCache && Date.now() - tagCache.at < TTL) return tagCache.list;
  try {
    const res: any = await tags.queryTags().limit(100).find();
    const list = SKEW(res).map((t: any): Tag => ({ id: t._id, label: t.label, slug: t.slug, count: t.postCount ?? 0 }))
      .filter((t: Tag) => t.count > 0).sort((a: Tag, b: Tag) => b.count - a.count || a.label.localeCompare(b.label, undefined, { numeric: true }));
    tagCache = { at: Date.now(), list };
    return list;
  } catch (e) { console.error("[blog] tags failed", e); return tagCache?.list ?? []; }
}

export const bySlug = <T extends { slug: string }>(list: T[], slug: string) => list.find((x) => x.slug === slug);

// ── lists ───────────────────────────────────────────────────────────────────────────────────────────────────
/** categoryIds matches posts in ANY of them (a section page); memberId lists one author's posts. */
export type ListOpts = { categoryId?: string; categoryIds?: string[]; tagId?: string; memberId?: string; featured?: boolean; skip?: number; limit?: number; sort?: "PUBLISHED_DATE_DESC" | "VIEW_COUNT" };
/** Newest first, offset-paged. listPosts (not queryPosts): the query builder pages by cursor only, which cannot give numbered pages. */
export async function listPosts(o: ListOpts = {}): Promise<{ items: Card[]; total: number }> {
  try {
    const res: any = await posts.listPosts({
      featured: o.featured || undefined, categoryIds: o.categoryIds?.length ? o.categoryIds.slice(0, 50) : o.categoryId ? [o.categoryId] : undefined, tagIds: o.tagId ? [o.tagId] : undefined, memberId: o.memberId || undefined,
      sort: o.sort ?? "PUBLISHED_DATE_DESC", paging: { offset: o.skip ?? 0, limit: o.limit ?? 12 }, fieldsets: ["URL"],
    });
    const items = (res?.posts ?? []).map(toCard);
    return { items, total: res?.metaData?.total ?? items.length };
  } catch (e) { console.error("[blog] listPosts failed", e); return { items: [], total: 0 }; }
}

export async function getPostBySlug(slug: string): Promise<any | null> {
  try {
    const res: any = await posts.queryPosts({ fieldsets: ["RICH_CONTENT", "URL", "METRICS"] }).eq("slug", slug).find();
    return SKEW(res)[0] ?? null;
  } catch (e) { console.error("[blog] getPostBySlug failed", e); return null; }
}

// ── authors ─────────────────────────────────────────────────────────────────────────────────────────────────
/** A post's author: the member's name, enriched with the team row that carries the same memberId (photo, bio, profile slug). */
export type Author = { id: string; name: string; photo: string; slug?: string; bio?: string };
const authors = new Map<string, Author>();
export async function getAuthor(id: string): Promise<Author> {
  if (!id) return { id: "", name: "", photo: "" };
  const hit = authors.get(id);
  if (hit) return hit;
  let a: Author = { id, name: "", photo: "" };
  try {
    const m: any = await members.getMember(id, { fieldsets: ["PUBLIC"] as any });
    const profile = (m?.member ?? m)?.profile ?? {};
    a = { id, name: profile.nickname ?? "", photo: profile.photo?.url ?? "" };
  } catch (e) { console.error("[blog] getAuthor failed", String(e).slice(0, 200)); /* name stays empty: the byline drops the author rather than guessing */ }
  authors.set(id, a);
  return a;
}
export async function getAuthors(ids: string[]): Promise<Record<string, Author>> {
  const uniq = [...new Set(ids.filter(Boolean))];
  const [got, team] = await Promise.all([Promise.all(uniq.map(getAuthor)), getTeamCached()]);
  return Object.fromEntries(got.map((a) => {
    const row = team.find((t) => t.memberId === a.id);
    return [a.id, row ? { ...a, name: a.name || row.name, photo: row.image || a.photo, slug: row.slug, bio: row.bio } : a];
  }));
}

// ── the search index ────────────────────────────────────────────────────────────────────────────
let indexCache: { at: number; docs: Doc[] } | null = null;
export async function getIndex(): Promise<Doc[]> {
  if (indexCache && Date.now() - indexCache.at < TTL) return indexCache.docs;
  try {
    const docs: Doc[] = [];
    let res: any = await posts.queryPosts({ fieldsets: ["URL", "CONTENT_TEXT"] }).descending("firstPublishedDate").limit(100).find();
    for (;;) {
      for (const p of SKEW(res)) docs.push({ ...toCard(p), text: String(p.contentText ?? "").slice(0, 3000) });
      if (!res.hasNext?.()) break;
      res = await res.next();
    }
    indexCache = { at: Date.now(), docs };
    return docs;
  } catch (e) { console.error("[blog] index failed", e); return indexCache?.docs ?? []; }
}

// ── formatting ──────────────────────────────────────────────────────────────────────────────────────────────
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// The tags carried by a set of posts, most used first (by the site-wide count); the popular tags when none of them has any.
export async function tagsOfPosts(list: Card[], max = 10): Promise<Tag[]> {
  const all = await getTags();
  const ids = new Set(list.flatMap((p) => p.tagIds));
  const found = all.filter((t) => ids.has(t.id));
  return (found.length ? found : all).slice(0, max);
}

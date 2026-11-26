// What every page's header and footer need, read once per request (each underlying read is cached or cheap).
//
// The navigation model. A small publication still needs its posts organised, so the site has two levels:
//   SECTION   a CMS row (Sections) that groups categories: "the desk". Top level of the nav, its own page (/section/<slug>).
//   CATEGORY  a Wix Blog category: "the beat". A post is filed in one or two categories; categories sit under a section.
// Wix Blog categories are flat, so the grouping lives in the CMS. With no sections, the nav falls back to the categories
// themselves (one level), so a cloning user who wants a flat blog only has to leave the collection empty.
import { getCategories, getTags, getIndex, listPosts, type Cat, type Card } from "./blog";
import { getCopy, getSocialLinks, getLegalPages, getSectionRows, type CopyBlock, type SocialLink, type LegalPage } from "./content";

export type NavSection = { id: string; title: string; slug: string; description: string; cats: Cat[] };
export type Chrome = {
  cats: Cat[]; catMap: Record<string, Cat>;
  sections: NavSection[];
  /** The section each category belongs to (the first one, if the owner listed it twice). */
  sectionOf: Record<string, NavSection>;
  /** Categories in no section: shown after the sections in the nav and on Home. */
  loose: Cat[];
  copy: Record<string, CopyBlock>; social: SocialLink[]; legal: LegalPage[]; latest: Card | null;
  /** The newest posts for the top bar's news ticker. */
  ticker: Card[];
  /** The newest few posts of each category (by id): the header's hover previews. */
  catPosts: Record<string, Card[]>;
  /** The search popup: the most viewed posts (shown before typing) and every post with its lower-cased search text. */
  popular: string[];
  searchable: (Card & { hay: string })[];
};

// Memoized for 30s in module memory: the layout and the page both ask for it within one request.
let memo: { at: number; value: Chrome } | null = null;
export async function getChrome(): Promise<Chrome> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  const value = await load();
  memo = { at: Date.now(), value };
  return value;
}

async function load(): Promise<Chrome> {
  const [cats, rows, copy, social, legal, latest] = await Promise.all([getCategories(), getSectionRows(), getCopy(), getSocialLinks(), getLegalPages(), listPosts({ limit: 8 })]);
  const [pop, docs, tags] = await Promise.all([listPosts({ sort: "VIEW_COUNT", limit: 8 }), getIndex(), getTags()]);
  const catLabel = Object.fromEntries(cats.map((c) => [c.id, c.label])), tagLabel = Object.fromEntries(tags.map((t) => [t.id, t.label]));
  const searchable = docs.map(({ text, ...d }) => ({ ...d, hay: [d.title, d.excerpt, ...d.categoryIds.map((i) => catLabel[i] ?? ""), ...d.tagIds.map((i) => tagLabel[i] ?? ""), (text ?? "").slice(0, 400)].join(" ").toLowerCase() }));
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));
  // A section lists category slugs; unknown slugs (a renamed or deleted category) are dropped, and a section left with no categories is hidden.
  const sections: NavSection[] = rows
    .map((r) => ({ id: r._id, title: r.title, slug: r.slug, description: r.description ?? "", cats: (r.categories ?? []).map((s) => bySlug[s]).filter(Boolean) }))
    .filter((s) => s.title && s.slug && s.cats.length > 0);
  const sectionOf: Record<string, NavSection> = {};
  for (const s of sections) for (const c of s.cats) sectionOf[c.id] ??= s;
  // The header previews: the newest eight of each category, read with the rest of the chrome (memoized with it).
  const catPosts = Object.fromEntries(await Promise.all(cats.map(async (c) => [c.id, (await listPosts({ categoryId: c.id, limit: 8 })).items] as const)));
  return {
    catPosts, popular: pop.items.map((p) => p.id), searchable,
    cats, catMap: Object.fromEntries(cats.map((c) => [c.id, c])), sections, sectionOf, loose: cats.filter((c) => !sectionOf[c.id]),
    copy, social, legal, latest: latest.items[0] ?? null, ticker: latest.items,
  };
}

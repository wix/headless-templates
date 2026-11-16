// The category tree, read once per isolate and shared by every surface that navigates it (mega menu,
// phone drawer, footer, home tiles, category pages). The tree is LIVE: a category the owner adds or
// renames in the dashboard appears everywhere with no code change.
import { fetchCategories } from "../wix/storefront/catalog";
import type { Category } from "../wix/storefront/types";
import { COLLECTION_SLUGS } from "./site";

export type Department = Category & { children: Category[] };
export type Tree = {
  departments: Department[];
  collections: Record<"new" | "best" | "sale", Category | null>;
  bySlug: Map<string, Category>;
  byId: Map<string, Category>;
};

const bySort = (a: Category, b: Category) => (a.index ?? 0) - (b.index ?? 0) || a.name.localeCompare(b.name, undefined, { numeric: true });

function build(all: Category[]): Tree {
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const byId = new Map(all.map((c) => [c.id, c]));
  const collectionSlugs = new Set<string>(Object.values(COLLECTION_SLUGS));
  const roots = all.filter((c) => !c.parentId && !collectionSlugs.has(c.slug)).sort(bySort);
  const departments = roots.map((d) => ({ ...d, children: all.filter((c) => c.parentId === d.id).sort(bySort) }));
  const pick = (slug: string) => bySlug.get(slug) ?? null;
  return { departments, collections: { new: pick(COLLECTION_SLUGS.new), best: pick(COLLECTION_SLUGS.best), sale: pick(COLLECTION_SLUGS.sale) }, bySlug, byId };
}

// Cached for a minute: the chrome of every page needs the tree, and a category edit showing up within
// a minute is soon enough. A failed read is not cached — the next request tries again.
let cache: { at: number; tree: Tree } | null = null;
export async function getTree(): Promise<Tree> {
  if (cache && Date.now() - cache.at < 60_000) return cache.tree;
  const tree = build(await fetchCategories());
  if (tree.byId.size) cache = { at: Date.now(), tree };
  return tree;
}

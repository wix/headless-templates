// The two linked collections: Services and TeamMembers (a service lists its team members, a team member lists their services),
// and the ServiceCategories a service belongs to. Read whole (MAX_ROWS), cached 30 s in module memory, then filtered, sorted and
// paged here: search and filters can look at several fields at once, which the query builder cannot do in one call.
import { items } from "@wix/data";
import { media } from "@wix/sdk";
import { MAX_ROWS, PAGE_SIZE } from "./site";

export type Category = {
  _id: string; title: string; slug: string; order: number; description?: string;
  stat1Value?: string; stat1Label?: string; stat2Value?: string; stat2Label?: string; stat3Value?: string; stat3Label?: string;
};
/** A category's figures (the first screen of its page): only the pairs that are filled in. */
export const categoryStats = (c: Category) =>
  ([[c.stat1Value, c.stat1Label], [c.stat2Value, c.stat2Label], [c.stat3Value, c.stat3Label]] as const)
    .filter(([v, l]) => v && l).map(([value, label]) => ({ value: value!, label: label! }));
export const categoryHref = (c: { slug: string }) => `/services/category/${c.slug}`;
export type Service = {
  _id: string; title: string; slug: string; category?: string; shortDescription?: string; description?: string;
  price?: number; duration?: string; location?: string; participants?: number; featured?: boolean; order: number;
  image?: string; gallery1?: string; gallery2?: string; gallery3?: string;
};
export type Member = {
  _id: string; name: string; slug: string; jobTitle?: string; shortBio?: string; about?: string; order: number;
  image?: string; gallery1?: string; gallery2?: string; gallery3?: string;
};

export type Location = {
  _id: string; title: string; slug: string; address?: string; city?: string; phone?: string; shortDescription?: string; description?: string; order: number;
  image?: string; gallery1?: string; gallery2?: string; gallery3?: string;
};

/** An IMAGE field is a `wix:image://` id (dashboard upload) or an absolute Wix Media URL (sample rows). One helper for every render path. */
export function imgSrc(v: unknown, w = 800, h = 600): string {
  if (!v || typeof v !== "string") return "";
  if (v.startsWith("wix:image://")) return media.getScaledToFillImageUrl(v, w, h, {});
  // A bare Wix Media URL (sample rows) is served at full size; ask the CDN for the frame's size instead.
  const m = v.match(/^https:\/\/static\.wixstatic\.com\/media\/([^/?#]+)$/);
  return m ? `${v}/v1/fill/w_${w},h_${h},al_c,q_85/${m[1]}` : v;
}
export const gallery = (r: { gallery1?: string; gallery2?: string; gallery3?: string }) => [r.gallery1, r.gallery2, r.gallery3].filter((x): x is string => !!x);
/** A long text field: paragraphs split on blank lines. */
export const paragraphs = (s?: string) => (s ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

type Cache<T> = { at: number; rows: T[] } | null;
const memo: Record<string, Cache<any>> = {};
async function all<T>(collection: string, key = "order"): Promise<T[]> {
  const hit = memo[collection];
  if (hit && Date.now() - hit.at < 30_000) return hit.rows;
  try {
    const { items: r } = await items.query(collection).ascending(key).limit(MAX_ROWS).find();
    memo[collection] = { at: Date.now(), rows: r as unknown as T[] };
    return r as unknown as T[];
  } catch (e) { console.error("[cms] read failed", collection, String(e).slice(0, 160)); return []; }
}
export const getCategories = () => all<Category>("ServiceCategories");
export const getServices = () => all<Service>("Services");
export const getMembers = () => all<Member>("TeamMembers");
export const getLocations = () => all<Location>("Locations");
export type Award = { _id: string; title: string; issuer?: string; year?: string; image?: string; order: number };
export const getAwards = () => all<Award>("Awards");
/** Locations grouped by city, cities in the order their first location appears (dashboard order). Used by the header city picker. */
export function citiesOf(rows: Location[]) {
  const map = new Map<string, Location[]>();
  for (const l of rows) { const c = (l.city ?? "").trim() || "Other"; map.set(c, [...(map.get(c) ?? []), l]); }
  return [...map.entries()].map(([city, locations]) => ({ city, locations }));
}
export const telHref = (phone?: string) => `tel:${(phone ?? "").replace(/[^\d+]/g, "")}`;
export const addressLines = (s?: string) => (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
/** "Get directions": a Google Maps search for the address (a link, no embedded map, no key). */
export const mapsUrl = (l: Location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines(l.address).join(", "))}`;

export const bySlug = <T extends { slug: string }>(rows: T[], slug: string) => rows.find((r) => r.slug === slug) ?? null;
/** The row before and after `slug` in dashboard order: the previous / next links on an item page. */
export function neighbours<T extends { slug: string }>(rows: T[], slug: string) {
  const i = rows.findIndex((r) => r.slug === slug);
  return { prev: i > 0 ? rows[i - 1] : null, next: i >= 0 && i < rows.length - 1 ? rows[i + 1] : null };
}

/** The other side of a link: a service's team members and locations, a team member's services and locations, a location's services and team. Guarded: a failed read shows no related block. */
export async function related<T>(holder: "Services" | "TeamMembers" | "Locations", id: string, field: "teamMembers" | "services" | "locations"): Promise<T[]> {
  try {
    // queryReferenced is not a builder: it takes (collection, holdingItem or id, field, options) and resolves to the result.
    const res: any = await items.queryReferenced(holder, id, field, { limit: 50 } as any);
    const rows = (res.items ?? []) as T[];
    return rows.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  } catch (e) { console.error("[cms] related failed", holder, field, String(e).slice(0, 160)); return []; }
}

export type SortKey = "recommended" | "price-asc" | "price-desc" | "name";
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" }, { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" }, { key: "name", label: "Name: A to Z" },
];
export const TEAM_SORTS = SORTS.filter((s) => s.key === "recommended" || s.key === "name");

const norm = (s: unknown) => String(s ?? "").toLowerCase();
/** Every typed word must appear in one of the fields. */
const matches = (q: string, ...fields: unknown[]) => {
  const hay = fields.map(norm).join(" ");
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

export function queryServices(rows: Service[], o: { q?: string; category?: string; sort?: SortKey; page?: number }) {
  let r = rows.filter((s) => (!o.category || s.category === o.category) && (!o.q || matches(o.q, s.title, s.shortDescription, s.description)));
  if (o.sort === "price-asc") r = [...r].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (o.sort === "price-desc") r = [...r].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else if (o.sort === "name") r = [...r].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  return paged(r, o.page);
}
export function queryMembers(rows: Member[], o: { q?: string; sort?: SortKey; page?: number }) {
  let r = rows.filter((m) => !o.q || matches(o.q, m.name, m.jobTitle, m.shortBio, m.about));
  if (o.sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return paged(r, o.page);
}
function paged<T>(r: T[], page = 1) {
  const pages = Math.max(1, Math.ceil(r.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  return { total: r.length, page: p, pages, rows: r.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE) };
}

export function queryLocations(rows: Location[], o: { q?: string; sort?: SortKey; page?: number }) {
  let r = rows.filter((l) => !o.q || matches(o.q, l.title, l.address, l.description));
  if (o.sort === "name") r = [...r].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  return paged(r, o.page);
}

/** One search over all three collections: every typed word must appear in a row's text. Used by /search. */
export async function searchAll(q: string) {
  const [services, members, locations] = await Promise.all([getServices(), getMembers(), getLocations()]);
  return {
    services: services.filter((s) => matches(q, s.title, s.shortDescription, s.description)),
    members: members.filter((m) => matches(q, m.name, m.jobTitle, m.shortBio, m.about)),
    locations: locations.filter((l) => matches(q, l.title, l.address, l.description)),
  };
}

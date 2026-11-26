// The linked collections: Listings (each in a Category, in a Neighborhood, with an Agent), Agents, Neighborhoods, ListingCategories.
// A listing holds three single references (category, neighborhood, agent); an agent's or a neighborhood's listings are the rows
// that point at it. Read whole (MAX_ROWS), cached 30 s in module memory, then filtered, sorted and paged here: search and
// filters can look at several fields at once, which the query builder cannot do in one call.
import { items } from "@wix/data";
import { media } from "@wix/sdk";
import { MAX_ROWS, PAGE_SIZE, ACTIVE_STATUSES, CLOSED_STATUSES, NEW_DAYS } from "./site";

export type Category = { _id: string; title: string; slug: string; order: number };
export type Listing = {
  _id: string; title: string; slug: string; category?: string; type?: string; status?: string; price?: number;
  bedrooms?: number; bathrooms?: number; area?: number; neighborhood?: string; agent?: string;
  street?: string; city?: string; state?: string; zip?: string; propertyId?: string; listedDate?: unknown;
  lotSize?: number; yearBuilt?: number; parking?: number; features?: string[]; videoUrl?: string;
  floorPlanImage?: string; floorPlanUrl?: string; brochureUrl?: string; priceWas?: number; openHouseStart?: unknown; openHouseEnd?: unknown;
  shortDescription?: string; description?: string; featured?: boolean; trending?: boolean; order: number;
  image?: string; gallery1?: string; gallery2?: string; gallery3?: string; gallery4?: string; gallery5?: string; gallery6?: string; gallery7?: string; gallery8?: string;
};
export type Agent = { _id: string; name: string; slug: string; jobTitle?: string; shortBio?: string; about?: string; order: number; image?: string; phone?: string; email?: string };
export type Neighborhood = {
  _id: string; title: string; slug: string; description?: string; order: number;
  image?: string; gallery1?: string; gallery2?: string; gallery3?: string;
};

/** An IMAGE field is a `wix:image://` id (dashboard upload) or an absolute URL. One helper for every render path. */
export function imgSrc(v: unknown, w = 800, h = 600): string {
  if (!v || typeof v !== "string") return "";
  return v.startsWith("wix:image://") ? media.getScaledToFillImageUrl(v, w, h, {}) : v;
}
export const gallery = (r: Partial<Record<`gallery${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`, string>>) => [r.gallery1, r.gallery2, r.gallery3, r.gallery4, r.gallery5, r.gallery6, r.gallery7, r.gallery8].filter((x): x is string => !!x);
export const paragraphs = (s?: string) => (s ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
/** A listing's address as two lines: the street, then "city, state ZIP". */
export const addressLines = (l: Pick<Listing, "street" | "city" | "state" | "zip">) =>
  [l.street, [l.city, [l.state, l.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter((x): x is string => !!x);
export const addressOneLine = (l: Pick<Listing, "street" | "city" | "state" | "zip">) => addressLines(l).join(", ");
/** "Get directions" and the embedded map both search for the address (no API key). */
export const mapsUrl = (l: Pick<Listing, "street" | "city" | "state" | "zip">) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOneLine(l))}`;
export const mapsEmbed = (l: Pick<Listing, "street" | "city" | "state" | "zip">) => `https://www.google.com/maps?q=${encodeURIComponent(addressOneLine(l))}&output=embed`;

/** A DATETIME field reads back as a Date, an `{ $date }` object or a string: one reader. Times are wall-clock as typed (shown with no zone shift). */
export function toDate(v: unknown): Date | null {
  if (!v) return null;
  const x: any = v;
  const d = x instanceof Date ? x : new Date(x.$date ?? x);
  return Number.isNaN(d.getTime()) ? null : d;
}
const UTC = { timeZone: "UTC" } as const;
export const fmtDate = (v: unknown) => toDate(v)?.toLocaleDateString("en-US", { ...UTC, day: "numeric", month: "short", year: "numeric" }) ?? "";
export function fmtWindow(start: unknown, end: unknown) {
  const s = toDate(start), e = toDate(end);
  if (!s) return "";
  const day = s.toLocaleDateString("en-US", { ...UTC, weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) => d.toLocaleTimeString("en-US", { ...UTC, hour: "numeric", minute: "2-digit" }).replace(" AM", " am").replace(" PM", " pm");
  return `${day}, ${t(s)}${e ? ` – ${t(e)}` : ""}`;
}
/** The open house, only while it is still ahead. */
export const upcomingOpenHouse = (l: Listing) => { const s = toDate(l.openHouseStart); return s && s.getTime() > Date.now() ? fmtWindow(l.openHouseStart, l.openHouseEnd) : ""; };
export const isNew = (l: Listing) => { const d = toDate(l.listedDate); return !!d && Date.now() - d.getTime() < NEW_DAYS * 86_400_000 && l.status === "Available"; };
export const isReduced = (l: Listing) => !!l.priceWas && !!l.price && l.priceWas > l.price;
export const isActive = (l: Listing) => !l.status || ACTIVE_STATUSES.includes(l.status);
export const isClosed = (l: Listing) => !!l.status && CLOSED_STATUSES.includes(l.status);
export const pricePerSqft = (l: Listing) => (l.price && l.area ? Math.round(l.price / l.area) : 0);

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
export const getCategories = () => all<Category>("ListingCategories");
export const getListings = () => all<Listing>("Listings");
export const getAgents = () => all<Agent>("Agents");
export const getNeighborhoods = () => all<Neighborhood>("Neighborhoods");

export const bySlug = <T extends { slug: string }>(rows: T[], slug: string) => rows.find((r) => r.slug === slug) ?? null;
/** The row before and after `slug` in dashboard order: the previous / next links on an item page. */
export function neighbours<T extends { slug: string }>(rows: T[], slug: string) {
  const i = rows.findIndex((r) => r.slug === slug);
  return { prev: i > 0 ? rows[i - 1] : null, next: i >= 0 && i < rows.length - 1 ? rows[i + 1] : null };
}
export const distinct = (rows: (string | undefined)[]) => [...new Set(rows.filter((x): x is string => !!x))].sort();

export type SortKey = "recommended" | "newest" | "price-asc" | "price-desc" | "area-desc" | "name";
export const LISTING_SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" }, { key: "newest", label: "Newest" }, { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" }, { key: "area-desc", label: "Largest first" },
];
export const NAME_SORTS: { key: SortKey; label: string }[] = [{ key: "recommended", label: "Recommended" }, { key: "name", label: "Name: A to Z" }];

const norm = (s: unknown) => String(s ?? "").toLowerCase();
/** Every typed word must appear in one of the fields. */
export const matches = (q: string, ...fields: unknown[]) => {
  const hay = fields.map(norm).join(" ");
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

/** "Must haves" in the filters popup: each one narrows the list to listings that have it. */
export type MustHave = "video" | "openhouse" | "reduced" | "new";
export const MUST_HAVES: { key: MustHave; label: string; test: (l: Listing) => boolean }[] = [
  { key: "video", label: "Video tour", test: (l) => !!l.videoUrl },
  { key: "openhouse", label: "Open house", test: (l) => !!upcomingOpenHouse(l) },
  { key: "reduced", label: "Price reduced", test: (l) => isReduced(l) },
  { key: "new", label: "New listing", test: (l) => isNew(l) },
];
export type ListingQuery = { q?: string; category?: string; type?: string; status?: string; min?: number; max?: number; beds?: number; baths?: number; neighborhood?: string; agent?: string; must?: MustHave[]; sort?: SortKey; page?: number };
/** The text a search looks at: title, type, the whole address (so a ZIP or a city matches), property ID, neighborhood name, descriptions. */
const listingText = (l: Listing, hoods: Neighborhood[]) =>
  [l.title, l.type, l.street, l.city, l.state, l.zip, l.propertyId, hoods.find((n) => n._id === l.neighborhood)?.title, l.shortDescription, l.description];
/** `status`: "" = active listings (Available, Under offer), "any" = every status, otherwise that one status. */
export function queryListings(rows: Listing[], o: ListingQuery, hoods: Neighborhood[] = []) {
  let r = rows.filter((l) =>
    (!o.category || l.category === o.category) && (!o.type || l.type === o.type) &&
    (!o.status ? isActive(l) : o.status === "any" || l.status === o.status) &&
    (!o.neighborhood || l.neighborhood === o.neighborhood) && (!o.agent || l.agent === o.agent) &&
    (!o.min || (l.price ?? 0) >= o.min) && (!o.max || (l.price ?? 0) <= o.max) &&
    (!o.beds || (l.bedrooms ?? 0) >= o.beds) && (!o.baths || (l.bathrooms ?? 0) >= o.baths) &&
    (!o.must?.length || o.must.every((k) => MUST_HAVES.find((m) => m.key === k)?.test(l))) &&
    (!o.q || matches(o.q, ...listingText(l, hoods))));
  if (o.sort === "price-asc") r = [...r].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (o.sort === "price-desc") r = [...r].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else if (o.sort === "area-desc") r = [...r].sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
  else if (o.sort === "newest") r = [...r].sort((a, b) => (toDate(b.listedDate)?.getTime() ?? 0) - (toDate(a.listedDate)?.getTime() ?? 0));
  return paged(r, o.page);
}
export function queryAgents(rows: Agent[], o: { q?: string; sort?: SortKey; page?: number }) {
  let r = rows.filter((a) => !o.q || matches(o.q, a.name, a.jobTitle, a.shortBio, a.about));
  if (o.sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return paged(r, o.page);
}
export function queryNeighborhoods(rows: Neighborhood[], o: { q?: string; sort?: SortKey; page?: number }) {
  let r = rows.filter((n) => !o.q || matches(o.q, n.title, n.description));
  if (o.sort === "name") r = [...r].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  return paged(r, o.page);
}
function paged<T>(r: T[], page = 1) {
  const pages = Math.max(1, Math.ceil(r.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  return { total: r.length, page: p, pages, rows: r.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE) };
}


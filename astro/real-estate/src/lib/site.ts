// Constants of the site chrome. Strings the owner edits live in the CMS (SiteContent and the collections); what is here is
// interface wording (labels of controls) that no dashboard collection owns, and is listed in the README.
export const SITE_NAME_FALLBACK = "Business Name";
/** ISO currency of listing prices. The Listings collection stores prices as plain numbers with no currency field, so the
 *  agency's currency is set here once; every price is formatted with Intl from it (change it for a non-USD agency). */
export const CURRENCY = "USD";
const fmtMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
/** Header links (the Contact button sits beside them). */
export const NAV = [
  { label: "Buy", href: "/listings?category=buy" },
  { label: "Rent", href: "/listings?category=rent" },
  { label: "Sell", href: "/sell" },
  { label: "Agents", href: "/agents" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "About", href: "/about" },
];
/** Cards per page on the lists. */
export const PAGE_SIZE = 6;
/** Collections are read whole (up to this many rows) and filtered, sorted and paged on the server. A few hundred rows is the
 *  intended size of a small agency; past it, move the filters into the query. */
export const MAX_ROWS = 100;
/** The category whose price is per month (a listing in it shows "/ month"). */
export const RENT_SLUG = "rent";
export const money = (n: number | undefined) => (n == null ? "" : fmtMoney.format(n));

/** A listing is "active" while it is on the market; the list shows only active listings unless the visitor asks for another status. */
export const ACTIVE_STATUSES = ["Available", "Under offer"];
/** Statuses that count as "sold" for the Recently Sold block. */
export const CLOSED_STATUSES = ["Sold", "Rented"];
/** A listing is "New" for this many days after its listed date. */
export const NEW_DAYS = 14;

/** Price steps in the filters popup. The list follows "Looking to": sale prices, or monthly rent when Rent is picked. */
export const SALE_PRICES = [100_000, 200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000];
export const RENT_PRICES = [500, 1_000, 1_500, 2_000, 2_500, 3_000, 4_000, 5_000, 7_500, 10_000];

/** Headline Case: every word starts with a capital letter (the rest of each word is left as written). */
export const hc = (s?: string) => (s ?? "").replace(/(^|[\s(\-–—\/"“])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
/** Headline Case for the headings inside a rich-text HTML body (text only; tags and entities untouched). */
export const hcHtml = (html?: string) => (html ?? "").replace(/<(h[1-6])(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (_, t: string, a: string, inner: string) => `<${t}${a}>${inner.replace(/(^|>)([^<]+)/g, (_m: string, p: string, txt: string) => p + hc(txt))}</${t}>`);

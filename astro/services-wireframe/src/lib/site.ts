// Constants of the site chrome. Strings the owner edits live in the CMS (SiteContent and the collections); what is here is
// interface wording (labels of controls) that no dashboard collection owns, and is listed as hardcoded in the README.
export const SITE_NAME_FALLBACK = "Business Name";
/** ISO currency of the Services `price` field. The CMS stores a plain number with no currency, so the template states it here;
 *  change it to the business's currency. Prices are formatted with Intl.NumberFormat, never a hand-written symbol. */
export const CURRENCY = "USD";
/** Header links (the Contact button sits beside them). "Categories" is not a page: the header renders it as a dropdown of the
 *  service categories, placed right after Services. */
export const NAV = [
  { label: "Services", href: "/services" },
  { label: "Team", href: "/team" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
];
/** Cards per page on the Services and Team lists. */
export const PAGE_SIZE = 6;
/** Services and Team are read whole (up to this many rows) and filtered, sorted and paged on the server. A few hundred rows is the
 *  intended size of a small business; past it, move the filters into the query. */
export const MAX_ROWS = 100;
const priceFormat = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: Number.isInteger(n) ? 0 : 2 });
export const money = (n: number | undefined) => (n == null ? "" : priceFormat(n).format(n));

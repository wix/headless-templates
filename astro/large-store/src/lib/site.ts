// Site-wide constants: the single place each of these decisions lives.

/** The business name in the header wordmark, footer and page titles. */
export const BUSINESS_NAME = "Business Name";

/**
 * Store-wide collections: categories that CUT ACROSS departments. They are linked from the header and
 * footer on their own, and are kept out of the department list (mega menu, drawer, home tiles), so the
 * departments stay the shape of the assortment. Slugs, not ids, so a re-seeded site still matches.
 */
export const COLLECTION_SLUGS = { new: "new-arrivals", best: "best-sellers", sale: "sale" } as const;
export const HEADER_COLLECTIONS = [
  { label: "New Arrivals", slug: COLLECTION_SLUGS.new },
  { label: "Best Sellers", slug: COLLECTION_SLUGS.best },
  { label: "Sale", slug: COLLECTION_SLUGS.sale },
] as const;

/** Static pages linked from the header and footer. */
export const PAGE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Banners inserted into product grids (shop, category, search) and into the home rails. Only WHERE they sit lives here:
 * their content (kicker, title, text, button, image) is the CMS rows banner-fresh / banner-sale in SiteSections.
 * `at` = the product index the banner is placed before; a banner is skipped when the list is shorter.
 */
export type GridBanner = { at: number; kicker?: string; title: string; body?: string; ctaLabel: string; href: string; image: string };
export const GRID_BANNER_AT = [5, 13] as const;
export const RAIL_BANNER_AT = { new: 3, best: 4 } as const;

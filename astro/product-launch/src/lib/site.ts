// Site-wide constants: the single place each of these decisions lives.

/**
 * The one product this launch site sells. Every "Buy Now" on the site goes to its page, and the
 * home page's buy band reads its live name, price and colours. Change the slug here if the
 * product's URL changes in the dashboard (Store Products → the product → SEO → URL slug).
 * Read by slug rather than "the first product" because a fresh Stores install also carries
 * Wix's sample catalog, which this site deliberately never lists.
 */
export const LAUNCH_PRODUCT_SLUG = "product-name";
export const PRODUCT_URL = `/products/${LAUNCH_PRODUCT_SLUG}`;

/** The business name in the header wordmark and the page titles. */
export const BUSINESS_NAME = "Business Name";

/**
 * The newsletter form (Wix Forms) rendered in the footer is found BY NAME at request time, never by id:
 * a site created from this template gets its own copy of the form with its own id. Rename or replace
 * the form in the dashboard (Forms & Submissions) and keep this name in sync.
 */
export const NEWSLETTER_FORM_NAME = "Newsletter";

/** Home-page section anchors, used by the header nav and the footer. */
export const NAV = [
  { label: "About", href: "/#about" },
  { label: "Features", href: "/#features" },
  { label: "Technology", href: "/#technology" },
];

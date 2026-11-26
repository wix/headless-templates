// Site-wide constants: the single place each of these decisions lives.

/** The fallback business name (the CMS `SiteSections` row `business-name` overrides it) in the header, footer and titles. */
export const BUSINESS_NAME = "Business Name";

/**
 * The Wix Form rendered on the Contact page (Dashboard → Forms & Submissions). This GUID is the form the template's site
 * (templates.json → siteTemplateId) ships with; on another site, replace it with that site's form ID.
 */
export const CONTACT_FORM_ID = "8b14af6d-a3ed-4214-89a3-868a13b1e6d7";

/**
 * The product shown with one tile per colour: this slug, else no product is split by colour. Change it when another
 * product should lead.
 */
export const FEATURED_PRODUCT_SLUG = "product-name";

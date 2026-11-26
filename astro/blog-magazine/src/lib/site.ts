// Constants of the site chrome. Strings the owner edits live in the CMS (SiteContent); what is here is interface wording
// (labels of controls and sections) that no dashboard collection owns, and is listed in the README as the only hardcoded copy.
export const SITE_NAME_FALLBACK = "Business Name";
/** The header shows at most this many items (sections, then categories in no section); the rest go to "More". Home shows as many
 *  blocks. Bounded so the nav never wraps: a small publication runs 3 to 6 sections of 2 to 5 categories. */
export const NAV_MAX = 6;
/** Pages beyond the categories, in the footer and the phone menu. */
export const PAGES = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];
export const PAGE_SIZE = 12;

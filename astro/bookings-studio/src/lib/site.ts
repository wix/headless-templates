// Site-wide constants: the single place each of these decisions lives.

/** The business name in the header wordmark and the page titles (the dummy text's "Site Title"). */
export const BUSINESS_NAME = "Business Name";

/** Wix Bookings app id: the cart's catalogReference.appId and the queryServices appId filter. */
export const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

/** Staff-member resource type id (names a session's staff member in availableResources). */
export const STAFF_RESOURCE_TYPE_ID = "1cd44cf8-756f-41c3-bd90-3e2ffcaf1155";

/** How many class / course tiles Home shows. A deliberate bound: a 7th adds no row, "View full schedule" holds the rest. */
export const HOME_TILES = 9;

/** How far ahead the week switcher can go, in weeks. */
export const WEEKS_AHEAD = 26;

/** Where the details of the last placed booking live for /book/done (sessionStorage key; guarded: storage can throw). */
export const PLACED_STORAGE_KEY = "placed.v1";

/** Header and footer links, in the order the flow file lists them (the wordmark is the way Home). Every booking path starts at /schedule. */
export const NAV = [
  { label: "Schedule", href: "/#schedule" },
  { label: "About", href: "/about" },
  { label: "Membership", href: "/#membership" },
  { label: "Contact", href: "/contact" },
];

/** How many instructors Home shows (a 3-up row). The /team page lists everyone. */
export const HOME_TEAM = 3;

/** Wix Pricing Plans app id (the plans' catalog reference). */
export const PRICING_PLANS_APP_ID = "1522827f-c56c-a5c9-2ac9-00f9e6ae12d3";

/** The label of the header call to action (Figma: a pill, "Book now"), and the hero's. */
export const BOOK_LABEL = "Book now";

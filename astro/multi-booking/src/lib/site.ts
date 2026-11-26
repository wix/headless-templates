// Site-wide constants: the single place each of these decisions lives.

/** The business name in the header wordmark and the page titles (the dummy text's "Site Title"). */
export const BUSINESS_NAME = "Business Name";

/** Wix Bookings app id: the cart's catalogReference.appId and the queryServices appId filter. */
export const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

/** Staff-member resource type id: availability filtering and staff picking. */
export const STAFF_RESOURCE_TYPE_ID = "1cd44cf8-756f-41c3-bd90-3e2ffcaf1155";

/** How many service tiles Home shows (6). A deliberate bound: a 7th service adds no row, "See all services" holds the rest. */
export const HOME_TILES = 6;

/** How far ahead the week strip can go, in weeks. The availability API accepts at most 7 months per query. */
export const WEEKS_AHEAD = 26;

/** The next-availability window for "next available" lookups, in days (the API caps a query at 7 months). */
export const NEXT_AVAILABLE_DAYS = 90;

/** How many upcoming times the details modal lists. */
export const MODAL_NEXT_TIMES = 4;

/** Where the "Appointment" list lives across pages: sessionStorage key (guarded: storage can throw). */
export const CART_STORAGE_KEY = "appointments.v1";

/** Header and footer links, in the order the designer set (the wordmark is the way Home). Every booking path starts at /book. */
export const NAV = [
  { label: "Services", href: "/book" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** How many team members Home shows (a 3-up row). /about lists everyone. */
export const HOME_TEAM = 3;


/** The label of every call to action that starts a booking. */
export const BOOK_LABEL = "Book now";

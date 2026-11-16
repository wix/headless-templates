// Site-wide constants: the single place each of these decisions lives.

/** The business name in the header wordmark and the page titles (the dummy text's "Site Title"). */
export const BUSINESS_NAME = "Business Name";

/** Wix Bookings app id: the cart's catalogReference.appId and the queryServices appId filter. */
export const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

/** Staff-member resource type id: availability filtering. */
export const STAFF_RESOURCE_TYPE_ID = "1cd44cf8-756f-41c3-bd90-3e2ffcaf1155";

/** How far ahead the calendars can go, in months. The availability API accepts at most 7 months per query. */
export const MONTHS_AHEAD = 6;

/** The "next available" window in days (the API caps a query at 7 months). */
export const NEXT_AVAILABLE_DAYS = 180;

/** Where the chosen time lives between pages: sessionStorage key (guarded: storage can throw). */
export const SELECTION_STORAGE_KEY = "selection.v1";

/**
 * The two services this site is built around, found LIVE (never by a pinned id or slug): the intro call is the free
 * service, the service is the paid one. If the owner adds more services, the first of each kind by dashboard order is used.
 */
export const isIntro = (s: { price: unknown }) => !s.price;

/**
 * The free intro call is presented as an online video call. Wix did not let us switch conferencing on for the service
 * (the field is accepted and silently stays false, BOOKINGS_EVIDENCE.md probe 0), so this is a design state, not a service
 * property: the line says a video link is sent after booking and every surface that says it also says this site does not show it.
 */
export const INTRO_LOCATION_LABEL = "Online";

/** Header links. Service and About are sections of Home; Contact is the header's outlined button. */
export const NAV = [
  { label: "Service", href: "/#service" },
  { label: "About", href: "/#about" },
];

/** The header's Contact link: an outlined button on a wide screen, a plain menu item on a tablet and a phone. It leads to the Book an Intro Call page. */
export const CONTACT = { label: "Contact", href: "/intro" };

/** Labels of the calls to action that start a booking. */
export const BOOK_NOW = "Book now";
export const BOOK_INTRO = "Book intro call";

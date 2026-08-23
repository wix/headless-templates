// Business name shown across the app. To fetch it dynamically instead, see the
// Site Properties API (@wix/business-tools) — out of scope for this template.
export const BUSINESS_NAME = 'Rentals';

// Time display format, rendered in the visitor's local timezone.
export const TIME_FORMAT = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
} as Intl.DateTimeFormatOptions;

// Generic Wix Bookings catalog app id. Used to scope member booking reads (an
// `extendedBookings.query` without an `appId` filter returns nothing).
export const BOOKINGS_APP_ID = '13d21c63-b5ec-5912-8397-c3a5ddb27a97';

// Wix Rentals app id, used as the checkout `catalogReference.appId` for a booking
// line item — per the Rentals sample flow. Always set; unlike RENTALS_APP_ID below
// this is not a user-tunable filter, so checkout can't be accidentally broken.
export const RENTALS_CATALOG_APP_ID = 'ff5d6eb1-65e4-4f9a-8b14-64d34c12cc2e';

// Optional: scope the rental list to a single Bookings app by its `appId`. Leave
// empty to treat every visible Bookings service as a rental (the default, so the
// template works on any Bookings-provisioned site). Set it to a specific app id
// to exclude unrelated services (e.g. classes) that live on the same site.
export const RENTALS_APP_ID = 'ff5d6eb1-65e4-4f9a-8b14-64d34c12cc2e';

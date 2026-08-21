// Business name shown across the app. To fetch it dynamically instead, see the
// Site Properties API (@wix/business-tools) — out of scope for this template.
export const BUSINESS_NAME = 'Rentals';

// Time display format, rendered in the visitor's local timezone.
export const TIME_FORMAT = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
} as Intl.DateTimeFormatOptions;

// Wix Bookings' eCommerce catalog app id — used as the `catalogReference.appId`
// for a booking line item in the eCom checkout, regardless of which app owns the
// underlying service.
export const BOOKINGS_APP_ID = '13d21c63-b5ec-5912-8397-c3a5ddb27a97';

// Optional: scope the rental list to a single Bookings app by its `appId`. Leave
// empty to treat every visible Bookings service as a rental (the default, so the
// template works on any Bookings-provisioned site). Set it to a specific app id
// to exclude unrelated services (e.g. classes) that live on the same site.
export const RENTALS_APP_ID = 'ff5d6eb1-65e4-4f9a-8b14-64d34c12cc2e';

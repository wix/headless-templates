// Business name shown across the app. To fetch it dynamically instead, see the
// Site Properties API (@wix/business-tools) — out of scope for this template.
export const BUSINESS_NAME = "Business Name";

// Time display format, rendered in the visitor's local timezone
export const TIME_FORMAT = {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
} as Intl.DateTimeFormatOptions;

export const BOOKINGS_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

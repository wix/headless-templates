# Wix Astro Rentals Template

A rental-marketplace template built with Astro and [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction). Rentals are modeled as bookable services, so the whole flow runs against a real Wix site:

- Listing rentals with `@wix/bookings` (`services.queryServices`), enriched with features (Bookings attributes) and business locations
- Filtering by location, features, category, rental type (hourly/daily), payment, and live availability over a date range (`availabilityCalendar.queryAvailability`)
- Reserving a space — hourly rentals pick a day + a start/end time span, daily rentals pick a check-in/check-out range — then `bookings.createBooking` → `@wix/ecom` checkout → redirect to the Wix-hosted checkout (`@wix/redirects`)
- Member login via the Astro integration's built-in auth routes, plus a **My bookings** account page that lists a member's bookings and lets them cancel or reschedule (`@wix/members`, `extendedBookings.query`)

All Wix integration logic lives in `src/utils/rentals-service.ts`. Pages are in `src/pages` (rentals list, `rental/[slug]` detail, confirmation, account, 404), and the interactive pieces (calendars, filters, reservation panels, reschedule modal) are lightweight vanilla-JS islands under `src/components`.

Times are always queried and displayed in the business's timezone, and prices come straight from the SDK's formatted values — never assume a currency or timezone.

## Wix apps used

Wix Bookings, Wix eCommerce (checkout), and Wix Members. Member login relies on the Astro integration's auth routes, enabled with `wix({ auth: true })` in `astro.config.mjs`. Make sure `/account` is listed in your project's [allowed redirect URIs](https://dev.wix.com/docs/go-headless/authentication/setup/allow-redirect-uris-and-domains) so login returns cleanly.

> **Scoping rentals:** by default every visible Bookings service is treated as a rental. To exclude unrelated services on the same site, set `RENTALS_APP_ID` in `src/utils/constants.ts` to the `appId` of the app that owns your rental services.

## Getting started

Use this template with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev     # start the dev server
npm run build   # build for production
```

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

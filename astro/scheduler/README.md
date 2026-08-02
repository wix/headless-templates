# Wix Astro Scheduler Template

An appointment scheduling template built with Astro and [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction). It demonstrates the full booking flow against a Wix site:

- Listing bookable services with `@wix/bookings` (`services.queryServices`)
- Fetching availability in the visitor's timezone (`availabilityCalendar.queryAvailability`)
- Creating bookings for free services (`bookings.createBooking` + `@wix/ecom` checkout)
- Redirecting to the Wix-hosted checkout for paid services (`@wix/redirects`)

The Wix integration logic lives in `src/utils/booking-service.ts`; pages are in `src/pages` (home, schedule, confirmation, 404).

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

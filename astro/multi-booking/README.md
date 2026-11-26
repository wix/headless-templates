# Wix Astro Multi-Booking Template

A booking site built with Astro and [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction) where a visitor books **several appointments in one checkout**. A visitor picks a service, picks a time, can add another service, and pays for all of them at once. A marketing home page, About, Contact and legal pages come with it, and all their copy comes from the Wix CMS.

It demonstrates:

- Listing services, categories and staff with `@wix/bookings` (`services.queryServices`, `staffMembers`)
- Availability in the visitor's time zone (`availabilityTimeSlots`), grouped by day and Morning / Afternoon / Evening
- A multi-appointment list kept in the browser (`src/lib/cart.ts`): add, edit and remove appointments, block overlaps for the same staff member
- The booking form from Wix Forms (the service's form, read with `forms.getFormSummary`)
- One checkout for every appointment: `bookings.createBooking` per appointment → one Cart V2 → Wix-hosted checkout (`@wix/redirects`) when money is due, `placeOrder` when it is free
- A contact form rendered from its Wix Forms schema and submitted as the visitor (`@wix/forms`)
- Owner-editable copy from Wix CMS collections (`@wix/data`): `HomeSections`, `ContentItems`, `LegalPages`, `SocialLinks`, `GalleryItems`

**Wix apps used:** Wix Bookings, Wix Forms, Wix CMS (and Wix eCommerce checkout through Bookings).

## Where things live

- Pages: `src/pages/` — Home `index.astro`, `about`, `contact`, `book/` (`index` = services, `time`, `confirm`, `done`), `policies/[slug]`, `404`
- Booking UI (React islands): `src/components/booking/`; the Confirm step also opens as a side drawer (`ConfirmDrawer.tsx`)
- Wix calls: `src/lib/` — `services.ts`, `availability.ts`, `booking.ts`, `content.ts`, `team.ts`
- Design tokens and type: `src/styles/global.css`; page blocks: `src/styles/home.css`; scroll motion: `src/scripts/home-motion.ts`

## Getting started

Use this template with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev     # start the dev server
npm run build   # build for production
```

Bookings can only be completed once the site accepts payments (connect a payment provider in the dashboard).

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

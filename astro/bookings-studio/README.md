# Wix Astro Bookings Studio Template

A studio website (fitness, yoga, dance) built with Astro and [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction). Visitors browse classes, pick a session on a weekly timetable, book it, and choose a membership plan. It demonstrates:

- Classes and courses from `@wix/bookings` (`services.queryServices`), staff members as the team
- A weekly timetable of class sessions (`eventTimeSlots`) and course events (`@wix/calendar`), read and shown in the visitor's time zone, with spots left, Full and Waitlist states
- A booking form whose fields come from the service's Wix form (`@wix/forms`), placed through the cart (`@wix/auto_sdk_ecom_cart-v-2`) and, when money is due, the Wix-hosted checkout (`@wix/redirects`)
- Membership plans from `@wix/pricing-plans`, with a plan checkout page that hands off to the Wix-hosted Pricing Plans checkout
- A contact form rendered from its Wix Forms schema and submitted as the visitor
- Page copy, photos, testimonials, legal pages and social links from Wix CMS collections (`@wix/data`): `HomeSections`, `ContentItems`, `LegalPages`, `SocialLinks`

Pages: home, about (with the whole team), contact, class detail (`/classes/[slug]`), booking form (`/schedule/book`), booking result (`/book/done`), plan checkout (`/membership/checkout`), legal pages (`/policies/[slug]`), 404.

The Wix integration lives in `src/lib` (`services.ts`, `schedule.ts`, `booking.ts`, `plans.ts`, `team.ts`, `content.ts`); the React islands are in `src/components/schedule`.

## Wix apps used

Wix Bookings, Wix Pricing Plans, Wix Forms, Wix CMS (and Wix eCommerce for the booking checkout).

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

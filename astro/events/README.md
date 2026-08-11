# Wix Astro Events Template

A minimal Astro + React events site backed by Wix Events. It exists to show the right way to wire an Astro site to Wix business solutions — the UI is a thin starting point for your own design.

Our Astro templates are still in development and subject to change.

## How it connects to Wix

- **Listing & detail** — the home page and `/events/[slug]` query and read events server-side with `@wix/events` (`wixEventsV2.queryEvents`, `getEventBySlug`).
- **Ticketed events** — `orders.queryAvailableTickets` reads the visitor-public ticket tiers; the React island reserves them with `ticketReservations.createTicketReservation` and hands off to Wix's hosted checkout via `@wix/redirects` `createRedirectSession`.
- **RSVP events** — the built-in name + email form submits with `rsvpV2.createRsvp`.
- **Members** — `@wix/members` reads the current member where one is signed in (e.g. the header shows their name). This minimal template doesn't ship a login UI; wire the built-in `/api/auth/login` and `/api/auth/logout` routes wherever your design needs them.
- **SEO** — `/events/[slug]` registers itself in the page manifest and renders `<SEO.Tags>` from `@wix/seo`, so each event's dashboard-managed title, description, and OG tags reach the live page.
- **Media** — event images are scaled with `media.getScaledToFillImageUrl` from `@wix/sdk`.

## Commands

```sh
npm install
npm run dev     # local dev via the Wix CLI
npm run build   # production build
```

Get started with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli).

## Need help?

For documentation and support, check out:

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

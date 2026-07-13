# Wix Astro Rentals Template

A headless space-rentals + booking storefront built with [Astro](https://astro.build), React, and the [Wix SDK](https://dev.wix.com/docs/sdk). Browse rentable spaces, pick a date/time (by the hour or by the day), and check out through Wix's hosted checkout. Members can sign in to see and manage their bookings.

> Our Astro templates are still in development and subject to change.

## Features

- **Browse & filter** rentable spaces backed by Wix Bookings services
- **Hourly and daily** reservations with a live availability calendar
- **Hosted checkout** via the Wix eCom checkout redirect (no card handling in-app)
- **Member area** — sign in with Wix Headless OAuth to view, cancel, and reschedule bookings
- **Anonymous browsing** — a visitor session is created automatically; login is only needed for the account area

## Tech stack

Astro 5 (server output) · React 18 + react-router · Tailwind CSS v4 · `@wix/astro`, `@wix/sdk`, `@wix/bookings`, `@wix/ecom`, `@wix/members`, `@wix/redirects`.

## Getting started

### Prerequisites

- Node.js 18+
- A Wix site with the **Bookings** app installed and at least one bookable service
- A **Headless OAuth** app on that site (dashboard → Settings → Headless) — copy its **Client ID**

### Setup

```bash
npm install
cp .env.example .env
# edit .env and set PUBLIC_WIX_CLIENT_ID to your Headless OAuth Client ID
```

Whitelist `http://localhost:4321/login-callback` (and your production equivalent) as an allowed redirect URI in the Headless OAuth app settings, so member login can return to the app.

### Run

```bash
npm run dev      # dev server at http://localhost:4321
npm run build    # production build
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PUBLIC_WIX_CLIENT_ID` | yes | Your Headless OAuth app Client ID (public, non-secret). |
| `PUBLIC_WIX_RENTALS_APP_ID` | no | Restrict the catalog to a single Bookings app by its `appId`. When unset, all non-hidden services are listed. |

## Project structure

```
src/
├── pages/            # Astro entry (index + catch-all) that mount the React app
├── App.tsx           # react-router routes (/, /rental/:slug, /confirmation, /account, /login-callback)
├── views/            # Page-level React views (RentalsList, RentalDetail, Account, …)
├── components/       # Reusable UI (Navbar, ReservationPanel, icons, ui primitives, …)
├── lib/
│   ├── wix-client.ts # Wix SDK client + OAuth/session helpers
│   ├── rentals.ts    # Services, availability, booking + checkout, member bookings
│   ├── auth.tsx      # Auth React context
│   ├── format.ts     # Formatting + Wix media helpers
│   └── types.ts
├── layouts/          # Astro layout
└── styles/           # Tailwind theme + global CSS
```

## Known limitation

The member **My bookings** list can currently come back empty even when a booking is correctly attached to the member in the dashboard. The checkout already stamps the member's `contactId` and buyer email onto the booking/checkout; the read-side scoping is still under investigation.

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

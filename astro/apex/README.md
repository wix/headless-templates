# Wix Astro Apex Template

**[Live demo](https://apex-test-rig-tuvitk-0d06.wix-site-host.com)**

A cinematic booking template built with Astro and [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction) — a supercar driving-experience outfit where visitors pick a session, a time, and an instructor, then pay through the Wix-hosted checkout.

It demonstrates:

- Listing and filtering bookable services with `@wix/bookings` (`services.queryServices`, `services.queryLocations`)
- A week-grid availability calendar with instructor and location scoping (`availabilityTimeSlots`, `eventTimeSlots`)
- The full booking sequence — `bookings.createBooking` → `@wix/ecom` cart → `@wix/redirects` hosted checkout for paid sessions, straight to confirmation for free ones
- A schema-driven booking form whose fields come from Wix, not from hardcoded JSX
- CMS-backed About and FAQ pages with Ricos rich content (`@wix/data`)
- An `/api/concierge` chat agent that answers availability questions over the site's own MCP endpoint

The Wix integration logic lives in `src/components/bookingDriver.ts` (booking sequence), `src/utils/booking-form-fields.ts` (form schema), and `src/utils/cms-html.ts` (Ricos); pages are in `src/pages`.

## Wix apps required

| App | Used for |
|---|---|
| Wix Bookings | services, staff, availability, bookings |
| Wix CMS (Wix Data) | `About`, `FAQ`, and `BookingFormFields` collections |
| Wix eCommerce | cart + hosted checkout (installed as a Bookings dependency) |

## Backing collections

Three CMS collections back the content pages. `About` (`heading`, `body`) and `FAQ` (`question`, `answer`) are ordinary content collections.

`BookingFormFields` holds the **booking form schema** — one row per field:

| Field | Type | Notes |
|---|---|---|
| `sortOrder` | Number | display order |
| `label` | Text | visible label |
| `target` | Text | the key `createBooking` expects in `formSubmission` |
| `required` | Boolean | |
| `componentType` | Text | `TEXT_INPUT` \| `PHONE_INPUT` \| `DROPDOWN` |
| `identifier` | Text | `TEXT_AREA` renders a textarea |
| `options` | Text | JSON array for `DROPDOWN`: `[{"value":"a","label":"A"}]` |
| `serviceSlug` | Text | blank = every service; set = overrides that one service |

> **`target` is a code contract, not content.** It is the key `bookings.createBooking` expects in `formSubmission` (the Bookings default form uses `first_name`, `last_name`, `email`, `phone`). Changing it in the CMS grid silently breaks submission.

`src/pages/api/_seed-booking-form-fields.ts` creates and seeds the collection. Astro's router ignores `_`-prefixed files, so it ships in neither the route table nor the server bundle — drop the underscore, run `npm run dev`, `GET /api/seed-booking-form-fields`, then rename it back. It is idempotent.

## Getting started

Use this template with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev     # start the dev server
npm run build   # build for production
```

Before publishing, set `site` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt` to your own origin — they drive canonical tags, JSON-LD, `sitemap.xml`, and `llms.txt`.

The `/api/concierge` chat agent needs an Anthropic API key:

```bash
wix env set --key ANTHROPIC_API_KEY --value <key>
wix env pull
```

Without one it degrades to a clean "off the air" notice, so the rest of the site runs fine.

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

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
| Wix CMS (Wix Data) | `About` and `FAQ` collections |
| Wix eCommerce | cart + hosted checkout (installed as a Bookings dependency) |

## Backing collections

Two CMS collections back the content pages: `About` (`heading`, `body`) and `FAQ` (`question`, `answer`). Both render rich content through `src/utils/cms-html.ts`, which normalizes Ricos node trees, Ricos JSON, HTML, and plain text to safe HTML.

The booking form is **not** one of them — its schema comes from the service's own Wix Form (`service.form._id`), read in `src/utils/booking-form-fields.ts`. Each field's `target` is the key `bookings.createBooking` expects in `formSubmission`.

> **Why that file uses REST instead of `@wix/forms`:** the package re-exports an 11 MB generated module through a namespace import, so nothing tree-shakes and a single `getForm` call costs ~4.2 MB of server bundle — one 4,212 KB chunk, over the ~4 MB per-file limit the template registry enforces. `httpClient.fetchWithAuth` hits the same endpoint (`GET /v4/forms/{formId}`) from a package already in the bundle. Same API, same data, ~0 KB. Don't "simplify" it back to the SDK import.

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

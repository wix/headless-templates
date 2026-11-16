# Single Service (Wix Bookings)

A booking site for a solo provider with one paid service and a free intro call (a consultant, a coach, a lash artist). Astro 5 with React islands and Tailwind 4, on Wix Headless.

## What it shows

| Route | What it is |
| --- | --- |
| `/` | Hero with a booking widget that docks into the header on scroll, why-choose-us, about, Instagram ring, testimonials, intro-call card, FAQ, closing call to action, footer |
| `/service` | The service (name, promise, duration, location, price), the provider, and the booking card |
| `/intro` | The free intro call's booking card |
| `/book/confirm` | Client details (the service's booking form), booking summary, **Book now** or **Continue to payment** |
| `/book/done` | Where a placed booking and the hosted checkout return |
| `/policies/<slug>` | Terms & Conditions, Privacy Policy, Refund Policy, Accessibility Statement |

## Wix apps it uses

- **Wix Bookings**: the services, staff, availability and the booking itself (`@wix/bookings`).
- **Wix eCommerce**: the cart and hosted checkout (`@wix/auto_sdk_ecom_cart-v-2`, `@wix/redirects`).
- **Wix Forms**: the booking form's fields (`@wix/forms`).
- **Wix CMS**: every page's copy lives in the `HomeSections`, `HomeItems` and `LegalPages` collections (`@wix/data`), so the owner edits it in the dashboard.

Nothing the site owns is hardcoded: services, prices (in the site's currency), times (in the visitor's time zone) and copy are read live. The intro call is the free service, the service is the paid one, found at runtime.

## Quick start

```bash
npm install
npm run dev
```

Every booking call runs as the site visitor (no server endpoint). Placing a booking needs payments connected on the Wix site.

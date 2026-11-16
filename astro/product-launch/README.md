# Product Launch (Wix Stores)

A single-product launch site on Wix Headless: one scroll-driven home page whose every call to action
leads to a Wix Stores product page, with a bottom-pinned product pill that grows into a pinned
three-column buy showcase.

- Astro 7 + React islands, Tailwind 4, hosted on Wix (`@wix/astro` + `@wix/astro-wix-hosting-adapter`).
- Page copy, features, reviews, legal pages, the business name and the header menu all come from the
  site's CMS (collections `HomeSections`, `Features`, `Testimonials`, `LegalPages`), so the owner edits
  them in the dashboard.
- Wix Stores: the product page (gallery, options, stock, quantity), the cart drawer and Wix-hosted checkout.
- Wix Forms: the footer newsletter form, rendered from the form's live schema and found **by its name**
  (`Newsletter`, see `src/lib/site.ts`).

## Wix apps used

Wix Stores, Wix Forms, Wix CMS (Wix Data), Wix SEO.

## Quick start

```bash
npm install
npx wix dev        # local dev
npx wix build && npx wix release
```

## Where things live

| What | Where |
| --- | --- |
| Design tokens (colours, type, spacing, buttons) | `src/styles/global.css` |
| Home page + its scroll effects | `src/pages/index.astro` |
| Product page | `src/pages/products/[slug].astro` → `src/components/storefront/ProductDetailView.tsx` |
| Header, footer, cart mount | `src/layouts/SiteLayout.astro` |
| Bottom pill / buy showcase | `src/components/BuyPill.astro`, `BuyPanel.tsx` |
| Which product the site sells | `LAUNCH_PRODUCT_SLUG` in `src/lib/site.ts` |

Motion (parallax, word reveal) runs on desktop widths only and respects `prefers-reduced-motion`.
Placeholder copy ("Business Name", lorem text) is meant to be replaced in the dashboard.

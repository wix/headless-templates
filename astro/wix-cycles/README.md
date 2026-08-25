# WX140 — Wix Cycles template

A single-product mountain-bike launch page: a rotating 3D bike, scroll-driven
feature sections, purchasable builds from Wix Stores, and a working cart and
hosted checkout.

**[Live demo](https://maor-zohar-headless-tuvitk-1306.wix-site-host.com)**

It demonstrates:

- **Server-loaded commerce** — `productsV3.queryProducts` and the `reviews` CMS
  collection are read in `src/pages/index.astro` and passed into the island as
  props, so the catalogue is in the initial HTML rather than appearing after
  hydration
- **One React island per page**, rooted at a component that supplies
  `CartProvider`, so the header cart badge and the section add-to-cart buttons
  share state (separate islands would each get their own React root)
- A React 19 + Three.js hero (`@react-three/fiber` + `drei`) that is
  **dynamically imported behind a media query** — desktop only, and skipped for
  `prefers-reduced-motion` — so it never runs during SSR
- A full cart: `currentCart` mutations, quantity stepping, and
  `@wix/redirects` hosted checkout with a thank-you callback
- Framer Motion scroll choreography, an Embla carousel, and a compare slider

The Wix integration lives in `src/lib/wix.ts` (server-side reads) and
`src/lib/cart.tsx` (client-side cart mutations). Neither constructs a client:
under `@wix/astro` the SDK is authenticated ambiently, so module-level imports
just work and no client id appears in the source.

## Wix apps required

| App | Used for |
|---|---|
| Wix Stores | the purchasable builds |
| Wix eCommerce | cart + hosted checkout |
| Wix CMS (Wix Data) | the `reviews` collection |

## Backing collection

`reviews` (`read: ANYONE`): `pre`, `highlight`, `post`, `source`, `initials`,
`order`. A headless visitor read cannot elevate, so a public collection has to
be `ANYONE` or the query returns zero rows with no error. With no rows, the
reviews section renders nothing.

## Notes

- **Install with `npm install --legacy-peer-deps`.** `@react-three/fiber` v9
  declares a React 18 peer range while this template runs React 19.
- Product names, prices, descriptions and images all come from the store.
  Prices are the SDK's `formattedAmount`, so the store's own currency is
  rendered — the template never composes a `$` string itself.
- A store with no published products renders an empty state in the builds
  carousel rather than sample builds.
- The non-product imagery (hero, feature sections, geometry diagrams) is design
  material bundled with the template, not Wix content.

## Getting started

Use this template with the [Wix CLI for Headless quick start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install --legacy-peer-deps
npm run dev
```

`npm run build` produces the Wix-hosted server bundle.

# Benny Pets — Wix Stores storefront

A designed storefront on top of [Wix Stores](https://dev.wix.com/docs/sdk/backend-modules/stores/introduction)
and [Wix eCommerce](https://dev.wix.com/docs/sdk/backend-modules/ecom/introduction): a catalog,
a product page with variant selection, a cart, and checkout — plus a contact
form rendered from [Wix Forms](https://dev.wix.com/docs/sdk/backend-modules/forms/introduction).

Everything on screen comes from Wix at request time. Every route is
server-rendered, and the page ships no framework runtime — the animation and
cart interactions are plain modules, so there are no islands to hydrate.

## Wix apps used

| App | What it powers |
|---|---|
| Wix Stores | The catalog: products, prices, images, options and variants |
| Wix eCommerce | The visitor's cart and the checkout session |
| Wix Forms | The footer contact form — fields come from the form definition |

## Routes

| Route | What it does |
|---|---|
| `/` | Home — best sellers, a catalog-driven gallery, and the contact form |
| `/store` | The full catalog |
| `/store/[slug]` | Product detail with option selection; unknown slugs 404 |
| `/cart` | The visitor's cart, with quantity, removal, and checkout |
| `POST /api/cart/add` | `{ productId, variantId?, quantity }` — refuses to guess a variant |
| `POST /api/cart/update` | `{ lineItemId, quantity }` |
| `POST /api/cart/remove` | `{ lineItemId }` |
| `POST /api/checkout` | Creates a checkout and returns its redirect-session URL |
| `POST /api/contact` | Submits the contact form, keyed by each field's Wix target |

## Getting started

```bash
npm install
npm run dev
```

The `@wix/astro` integration authenticates every SDK call from the visitor's
session, so there is no client to construct and no client id in the source.

## Notes

- **Prices** are the `formattedAmount` Wix returns, so the store's own currency
  is always what shows.
- **Variants**: a product with options can't be added until one is chosen, and
  the price updates to the chosen variant. Single-variant products get a
  one-click add.
- **The contact form's id** lives in `src/lib/constants.ts`. It matches the form
  this template's site provisions; point it at your own form if you connect
  this code to a site you built yourself.

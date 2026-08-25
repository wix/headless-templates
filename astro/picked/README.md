# PICKED — Wix Stores subscription template

A seasonal veg-box subscription service. Visitors spin a 3D vegetable, pick a
basket size and a delivery cadence, and subscribe through Wix Stores.

**[Live demo](https://picked-tuvitk-0606.wix-site-host.com)**

It demonstrates:

- **Subscribing rather than buying once** — each basket product carries
  `subscriptionDetails.subscriptions`, and the cart line item is built with
  `catalogReference.options.subscriptionOptionId`
- Basket sizes, names, prices and delivery cadences resolved **server-side**
  from `productsV3.queryProducts` and handed to the page, so nothing about the
  store is hardcoded in the design
- A small cart bridge (`src/scripts/wix-cart.ts`) over `@wix/ecom` —
  `addToCurrentCart`, `estimateCurrentCartTotals`, and
  `createCheckoutFromCurrentCart` into the Wix-hosted checkout
- Interactive 3D produce models (Three.js + GLTFLoader) with a live model
  switcher, over a Claude Design canvas export

## Wix apps required

| App | Used for |
|---|---|
| Wix Stores | the basket products and their subscription options |
| Wix eCommerce | cart + hosted checkout |

## How baskets map to products

The design offers three sizes. Each is matched to a Wix Stores product **by
name** — a product whose name contains "small", "medium" or "large" backs that
box. Only sizes the store actually has a product for are offered; with no
matching products the page renders with no purchasable baskets rather than
inventing any.

Each product's subscription options become the delivery-frequency picker, and
the option's `_id` is what the cart bills on — so the cadence a visitor picks is
the one they are charged for.

Prices are the SDK's `formattedAmount` and the cart total comes from
`estimateCurrentCartTotals().priceSummary`, so the store's own currency is
rendered and Wix owns tax and shipping. The template never composes a currency
string itself.

## Notes

- **Rendering.** This template is a Claude Design canvas export: the page body
  is filled in by `public/support.js` in the browser from `{{ }}` bindings, so
  the server sends placeholders rather than final markup. The Wix integration
  is server-side; the design's own rendering is not.
- **`public/image-slots.state.json` must not be a dotfile.** `image-slot.js`
  fetches it document-relative to restore filled image slots; static asset
  servers refuse to serve dotfiles.
- **Large assets.** `public/models/bellpepper.glb` (16 MB),
  `public/models/tomato.glb` (7.3 MB), `public/models/potato.glb` (5.3 MB) and
  the 11 MB screenshot exceed the ~4 MB per-file limit the headless template
  registry enforces, and need compressing or moving off-bundle before a
  registry publish.

## Getting started

Use this template with the [Wix CLI for Headless quick start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev
```

`npm run build` produces the Wix-hosted server bundle.

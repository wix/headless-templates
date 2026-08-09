# Wix Astro Commerce Template

**[Live demo](https://jlgivq-headlessstack.wix-app-host.com)**

A minimal Astro + React storefront wireframe backed by Wix Stores and Wix eCommerce. It exists to show the right way to wire an Astro site to Wix business solutions — the UI is a thin starting point for your own design.

## How it connects to Wix

> Cart V2 is the evolution of the old cart + checkout: one **cart** now carries the whole purchase flow through placing the order. "Checkout" below means only the Wix-hosted checkout page the buyer is redirected to. Migrating from Cart V1 / Checkout V1? See the [migration guide](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/purchase-flow/cart-v2/migration-guide).

- **Catalog** — pages query products server-side with `@wix/stores` (`productsV3.queryProducts`).
- **Cart** — the React island uses `@wix/ecom` `currentCartV2` to add items, read the cart, and estimate totals.
- **Checkout** — Cart V2 has no separate checkout entity (the cart id is the checkout id), so `@wix/redirects` `createRedirectSession` is given the current cart's id to send the visitor to Wix Checkout.
- **Members** — `@wix/members` reads the current member; login/logout go through the built-in `/api/auth/*` routes.
- **Media** — product images are scaled with `media.getScaledToFillImageUrl` from `@wix/sdk`.

## Commands

```sh
npm install
npm run dev     # local dev via the Wix CLI
npm run build   # production build
```

Get started with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli). Docs: [Wix Headless](https://dev.wix.com/docs/go-headless) · [Wix SDK](https://dev.wix.com/docs/sdk).

# Wix Astro One-Screen Store Template

A store on one screen, built with Astro and [Wix Stores](https://dev.wix.com/docs/sdk/backend-modules/stores/introduction). The home page is the catalog: tiles in a **Grid** or a horizontal **Strip**, and a tile opens the product in place (the URL follows, so it can be shared and reloaded).

- Products from `@wix/stores` (Catalog V3, `searchProducts` / `getProductBySlug` with explicit fields); the featured product shows one tile per colour, with its colour dots on the tile
- Product view in place: a gallery that swaps to the picked colour's photos, a fullscreen viewer, option pickers resolved against `variantsInfo`, quantity, Add to cart
- A slide-in cart (`@wix/ecom` Cart V2, totals from `estimateCurrentCart`) with "You may also like", and the Wix-hosted checkout (`@wix/redirects`)
- A Wix Gift Cards product sold as one of the tiles (preset amounts into the same cart)
- About and Reviews side panels, FAQ, and legal pages (Terms, Privacy, Shipping, Refund, Accessibility), all from Wix CMS collections
- A Contact page with a Wix Form rendered from its live schema (Wix Forms REST, read as the visitor) and submitted as the visitor (`@wix/forms`)

All Wix calls live in `src/wix/` (storefront, forms, cms); `src/lib/store-data.ts` loads what the pages render. Pages are in `src/pages` (home, shop, `products/[slug]` with owner-editable SEO, gift card, contact, FAQ, `policies/[slug]`, 404) and the interface is a set of React islands under `src/components`.

Prices come from the SDK's formatted values and the cart's currency code — never assume a currency.

## Wix apps used

Wix Stores, Wix eCommerce (cart and checkout), Wix Gift Cards, Wix Forms and Wix CMS. The CMS collections the pages read are `SiteSections`, `Testimonials`, `Benefits`, `Faqs` and `LegalPages`.

> **Site-specific values** live in `src/lib/site.ts`: `CONTACT_FORM_ID` (the Contact form; replace it with your site's form ID if it differs) and `FEATURED_PRODUCT_SLUG` (the product shown per colour).

## Getting started

Use this template with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev     # start the dev server
npm run build   # build for production
```

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

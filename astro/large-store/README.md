# Wix Astro Large Commerce Wireframe

A dense, fashion-style storefront wireframe for large, multi-category catalogs, built on Wix Stores and the Wix CMS.

Our Astro templates are still in development and subject to change.

## What it shows

- **Home**: two-banner hero, category slider that expands into a grid, product rails with inline banners, split promo banners, About block, reviews strip.
- **Catalog** (`/shop`, `/category/<slug>`): subcategory tiles, filter drawer (price, availability, product options), sort, a grid layout switch (mix / 4 / 2 columns), banners inside the grid, hover photo carousel, and quick add that opens inside the product card.
- **Product page**: photo gallery, option picker, details drawer, related items.
- **Search**: header pop-up with trending categories, live product suggestions and related terms.
- **Cart drawer**: quantity steps, promo code, free-shipping progress (threshold read from the store's shipping rules), best-seller recommendations; checkout is the Wix hosted checkout.
- **Content pages**: About, Contact (Wix Form), legal pages (Terms, Privacy, Shipping, Refund, Accessibility) from the CMS.

## Wix apps used

Wix Stores (catalog v3), Wix eCommerce (cart and checkout), Wix CMS (Wix Data), Wix Forms, Wix SEO.

## Content lives in Wix, not in code

CMS collections provisioned by the site template:

- `SiteSections`: one row per slot, addressed by `key` (`hero`, `hero-2`, `promo-1`, `promo-2`, `about`, `banner-fresh`, `banner-sale`, `reviews-summary`, `social-*`, `brand`, `footer`, `footer-credit`, `announcement`, ...). Titles, copy, button labels, links and images are edited there.
- `Testimonials`, `LegalPages`.
- Forms are found by name (`Newsletter`, `Contact`) at request time.
- Products, categories, prices, shipping rules and currency come from the Wix dashboard.

## Quick start

Follow the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli) and select this template, then:

```bash
npm install
npm run dev
```

Design tokens (colors, type scale, spacing, motion) are in `src/styles/global.css`.

## Need help?

For documentation and support, check out the [Wix Headless docs](https://dev.wix.com/docs/go-headless).

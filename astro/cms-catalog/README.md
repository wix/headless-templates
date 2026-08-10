# Wix Astro CMS Template

A minimal Astro + React catalog wireframe backed by a Wix CMS (Wix Data) collection. It exists to show the right way to wire an Astro site to a Wix CMS collection — the UI is a thin starting point for your own design.

## How it connects to Wix

- **Catalog** — the home page queries the `catalog-items` collection server-side with `@wix/data` (`items.query`), and the item detail route (`/catalog/[id]`) resolves a single item with `items.get`.
- **Media** — item images are scaled with `media.getScaledToFillImageUrl` from `@wix/sdk`.
- **Rich text** — the `description` field is rendered defensively: it accepts either a plain HTML string or a Ricos node tree (what the Wix dashboard's rich text editor writes when an owner edits the item) — see `src/lib/richText.js`.
- **Currency** — item prices are formatted with `Intl.NumberFormat` from each item's own `currency` field, not a hardcoded symbol.
- **SEO** — main pages get their `<title>`/meta/OG/structured data injected automatically by Wix's Astro integration, no code required. The item detail route builds its own `<title>`, description, canonical link, and `Product` JSON-LD from the item's own data, because **Wix's item-page SEO registry (`@wix/seo` + `WIX_APPS`) currently has no entry for CMS collections** — only Stores, Bookings, Events, and Blog are supported there. See the comment at the top of `src/pages/catalog/[id].astro`.

## Collection schema

This template expects a `catalog-items` collection (public read) with the fields:

| Field | Type | Notes |
|---|---|---|
| `name` | Text | |
| `description` | Rich Text | plain HTML string or Ricos, see above |
| `price` | Number | |
| `currency` | Text | ISO 4217, e.g. `USD` |
| `category` | Text | used for the home page's filter tabs |
| `image` | Image | |

## Commands

```sh
npm install
npm run dev     # local dev via the Wix CLI
npm run build   # production build
```

Get started with the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli). Docs: [Wix Headless](https://dev.wix.com/docs/go-headless) · [Wix SDK](https://dev.wix.com/docs/sdk).

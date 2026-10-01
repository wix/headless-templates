# Exploded Horology Lab — Wix Stores configurator template

A bespoke watch atelier: the movement hangs in an interactive 3D stage,
disassembles plate-by-plate as you scroll, and can be configured and
commissioned through a real Wix checkout.

**[Live demo](https://exploded-horology--1-tuvitk-1406.wix-site-host.com)**

It demonstrates:

- **A configurator backed by real product options** — the five axes (bezel,
  dial, strap, crown, movement) are Wix Stores product options; the visitor's
  picks resolve to one variant from `variantsInfo`, and that variant's
  `formattedAmount` is the price shown and charged
- A single scroll-driven 3D product stage (Three.js), with no React anywhere
- The full purchase sequence — `addToCurrentCart` with the resolved
  `variantId` → `createCheckoutFromCurrentCart` → `@wix/redirects` hosted
  checkout
- Recording the configuration to a **visitor-writable** CMS collection
  (`items.insert`) before handing off to payment

The Wix integration lives in `src/scripts/wix-commission.ts` (variant
resolution, CMS write, checkout) and the product query in the frontmatter of
`src/pages/index.astro`. Neither builds a client: under `@wix/astro` the SDK
authenticates ambiently, so there is no client id anywhere in the source.

## Wix apps required

| App | Used for |
|---|---|
| Wix Stores | the commissioned watch, its five options and their variants |
| Wix eCommerce | cart + hosted checkout |
| Wix CMS (Wix Data) | the `Reservations` collection |

## What the store must provide

One product carrying five options named **Bezel**, **Dial**, **Strap**,
**Crown** and **Movement**. Each option's choices are matched to the
configurator by name, so the choice names must be the ones the design uses
(`Brushed Steel`, `DLC Black`, `Rose Gold 5N`, and so on — see the arrays at the
top of the component). Every buyable combination needs a variant with a price.

With no matching product the page still renders the 3D lab and the
configurator; only the reserve flow is unavailable, and no price is shown.

## Backing collection

`Reservations` holds one row per commission: `title`, `fullName`, `email`, the
five chosen options, `total` and `status`. Permissions are **`insert: ANYONE`**
(visitors submit from the browser) and **`read: ADMIN`**, so customer names and
emails are only readable by the site owner.

## Notes

- **Pricing.** Wix prices whole variants, not individual choices, so the
  configurator shows no per-option surcharges — the total is the configured
  variant's own formatted price, in the store's currency. The earlier
  base-plus-delta model (charge a base now, arrange upgrades separately) is
  gone; the customer is charged for exactly what they configured.
- **Rendering.** This template is a Claude Design canvas export: the page body
  is filled in by `public/support.js` in the browser from `{{ }}` bindings, so
  the server sends placeholders rather than final markup. The Wix integration
  is server-side; the design's own rendering is not.

## Getting started

Use this template with the [Wix CLI for Headless quick start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev
```

`npm run build` produces the Wix-hosted server bundle.

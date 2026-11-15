# eCommerce Wireframe — template guide

A non-branded wireframe storefront for a medium-size, general multi-category store.
Wix Headless (managed, Astro 5) + Wix Stores (Catalog V3) + Wix eCommerce Cart V2 + Wix Forms + Wix CMS.

- `npm run dev` (local), `npm run build && npm run release` (publish)

---

## 1. Decisions made on your behalf (defaults)

| Input | Decision | Why |
| --- | --- | --- |
| Design direction | Non-branded wireframe: warm-neutral greys, ink as the only emphasis colour, Inter | "Wireframe" in the brief; the cloning user brings the brand |
| Copy voice | Wix Studio dummy text (July 2024 doc), fitted per slot. Slots the doc doesn't cover get short lines in the same voice | Requested |
| Placeholder media | Generated studio still-lifes (a tonal field plus a simple shaded object), 5 tones, no text | Reads as "a product goes here" without scaffolding marks |
| Catalog scale | 38 products ("Product 01–38"), 7 flat categories ("Category 01–07") + Sale | See §6 |
| Currency | ILS (₪). It's the site's own setting and was left untouched | Change in Dashboard → Settings → Language & Region |

## 2. Design direction as built

All tokens live in **`src/styles/tokens.css`**. That file is the one place colour, type, spacing, radius and motion are decided.

- **Palette:** `--bg #fff`, `--surface #f3f2ef` (quiet fills), `--line #dcdbd6` (hairlines), `--ink #161616`, `--muted #5c5c5a`. All text pairs pass WCAG AA (muted 6.6:1 on white).
- **Type:** Inter Variable. The scale is 12 / 14 / 16 / 18 / 20 / 26→38 / 32→52 / 40→76 (fluid). Body text is 16px with 1.55 line height.
- **Spacing tiers:**
  - 8: label → control
  - 16: control → control
  - 24: group → group
  - 40: last decision → next block
  - Section → section: 56 (phone), 80 (tablet), 104 (desktop)
  - Gutter: 20 / 32 / 48
  - Content stops at 1440px; wider screens add gutter, not width.
- **Shape:** 6px radius on controls, round swatches and chips, square-edged full-bleed media.
- **Motion:** one easing (`cubic-bezier(.2,.7,.2,1)`), 160ms for states and 260ms for panels. Motion is off under reduced-motion settings.
- **Restraint budget:**
  - Outlines only on form fields and choice controls (size pills, swatch rings).
  - Buttons, chips, ribbons, steppers and sort use fills.
  - Horizontal rules: the header hairline, the drawer-footer hairline, and the PDP accordion rows. Nothing else.
- **Media ratios:**
  - Product: 4:5
  - Category tile: 1:1
  - Hero: 2:1 on desktop, 4:3 on phone
  - Promo band: 3:2
  - About: 4:5

## 3. Conversion and mobile decisions

| Surface | Phone | Desktop |
| --- | --- | --- |
| Navigation | Left drawer: search, every category (live), site pages | Inline "Shop" disclosure (click, not hover), About, Contact, inline search |
| Home collections | Snapping rails with a peek (categories ~37%, products ~53%, testimonials ~78%) | Categories and testimonials as rails with prev/next buttons; Featured is a fixed 4×2 grid (capped at 8) |
| Gallery | Filter as a bottom sheet with "Show results" (staged); Filter and Sort as two equal buttons | Left filter rail, commits immediately; sort in the toolbar; 3 columns |
| Card buy path | The label names the outcome: "Add to bag", "Select size", "Choose options", "Sold out". Colour swatches on the card count as a choice, so a colour-only product adds in one tap | Same |
| Quick add | Bottom sheet | Side panel |
| Product page | Image capped at 46% of the screen; swipe with a "1 / 4" indicator; name, price and first choice in the first screen; a buy bar with the price and action whenever the in-flow button is off-screen | Gallery + thumbnail strip; sticky purchase column (drops to static on screens under 760px tall) |
| Bag | Slide-in drawer after every add: "Added to bag", editable lines, Wix-calculated subtotal, "Shipping and taxes are calculated at checkout", checkout from the drawer | Same (440px panel) |

**Tap count, landing → checkout:** 4 for a colour-only product (Shop → swatch → Add to bag → Continue to checkout). One more for a product that also has a size.

**Removed on request:** the home "Shipping & Delivery / Returns & Refunds / Customer Support" section and the matching links beside the buy button. Shipping and returns are now reached through the footer's legal links only.

## 4. Feature-fit decisions

| Feature | Decision |
| --- | --- |
| Search | **Built.** Name search on the shop gallery; header search on desktop, drawer search on phone |
| Filters and sort | **Built.** Price bounds, in-stock, and the option facets that actually vary in scope (Color as swatches, Size). Result count, removable chips, clear-all, state kept in the URL |
| Quick add | **Built**, routed per product from the list data |
| Category pages | **Built.** Every category at `/category/<slug>` with owner-managed SEO |
| Mega menu | **Rejected.** The taxonomy is flat, so it's a one-column disclosure that doesn't grow sideways |
| PDP gallery | Thumbnail strip (fixed height at any image count), not a mosaic |
| Image zoom | **Rejected for now.** Placeholder imagery carries no detail worth zooming; add a full-screen viewer once real photography exists |
| Wishlist / recently viewed | **Rejected.** No storefront API; a browser-storage version wouldn't sync, and the catalog doesn't reward comparison |
| Product groups, subscriptions | **Not seeded**, not built (not typical of this vertical) |
| Pre-order, modifiers | **Built** and exercised (Product 14 pre-order; Product 24 initials; Product 08 gift wrap) |
| Newsletter | **Built** in the footer (Wix Forms "Newsletter" with a consent checkbox) |
| Contact | **Built** (Wix Forms "Contact"), rendered from the live form schema |

## 5. Where to change what

| To change… | Edit |
| --- | --- |
| Any colour, size, spacing, radius, motion | `src/styles/tokens.css` |
| Buttons, chips, swatches, fields, cards, rails, overlays | `src/styles/global.css` (one class per concept) |
| Header, footer, home sections, gallery, PDP, bag, forms layout | `src/styles/surfaces.css` |
| Card anatomy / buy-path labels | `src/components/ProductCard.tsx`, rules in `src/lib/store.ts` (`purchasePath`, `cardActionLabel`) |
| Price, variant, ribbon rules | `src/lib/store.ts` |
| Every Wix SDK call (server-only) | `src/lib/server.ts` and `src/pages/api/*` |
| Cart state shared across islands | `src/lib/cart-client.ts` |
| Overlay behaviour (scrim, focus trap, Escape, return focus) | `src/components/Overlay.tsx` |
| Home composition and order | `src/pages/index.astro` |
| Store name in header/footer; nav pages | `src/lib/site.ts` |
| Form ids | `src/lib/forms-config.ts` |

Content (text, images, products) is in the dashboard; see §7.

## 6. Catalog manifest

**Scale and why:** a general store carries several distinct product families but navigates them flat. There are 6 families (Category 01–06), a cross-category set (Category 07), and "Sale". "All products" (38) and Category 07 (26) both exceed one 24-product page, so paging is exercised. Category 06 (3) is deliberately sparse.

| Category | Products | Shaped like |
| --- | --- | --- |
| Category 01 | 8 (Products 01–08) | home goods |
| Category 02 | 8 (09–16) | kitchen |
| Category 03 | 7 (17–23) | bags & accessories |
| Category 04 | 6 (24–29) | stationery |
| Category 05 | 6 (30–35) | personal care |
| Category 06 | 3 (36–38) | outdoor (sparse) |
| Category 07 | 26 | cross-category collection |
| Sale | 5 | every product with a real "was" price; the home promo band links here, so it keeps its name |

**Naming:** products and categories are generic and numbered ("Product 01" … "Product 38", "Category 01" … "Category 07"; slugs `product-01`, `category-01` …). The shape of each placeholder is below.

**States covered:**

| State | Product(s) |
| --- | --- |
| No options | 01, 13, and others |
| One text option | 05 (Size) |
| One swatch option | 09 (Color) |
| Two options | 18 (Color × Size) |
| Swatch choice out of stock | 02, Slate |
| Partly out of stock | 23 (size M); 18 (Sand / Large) |
| Fully out of stock | 12; 34 (with options) |
| Pre-order | 14 |
| Ranged price | 05, 07, 17, 18, 31, 34 |
| Sale with compare-at | 04, 10, 18, 20, 29 |
| Primary ribbon | New, Sale, Limited Edition, Coming Soon |
| Multiple ribbons | 18: New + Sale + Limited Edition |
| Free-text modifier (mandatory) | 24 (Initials) |
| Choice modifier (optional) | 08 (Gift Wrap) |
| Images | 1, 3 or 4 per product |
| Shared info sections | Product Info, Specifications, Shipping Info, Return & Refund Policy |

Every product has a main category, so its breadcrumbs name a real category.

**Provisioned on the site template:**
- 38 products, 8 categories, 4 info sections, 4 ribbons
- CMS collections `SiteSections` (15 items), `Testimonials` (4), `LegalPages` (5)
- Forms "Newsletter" and "Contact"
- 104 images in Media Manager `/placeholders`

## 7. Shopper-visible copy inventory

| String(s) | Managed in |
| --- | --- |
| Product names, prices, descriptions, options, ribbons, images | Dashboard → Store Products |
| Info sections (Product Info, Specifications, Shipping Info, Return & Refund Policy) | Dashboard → Store Products → each product → Additional info sections |
| Category names, descriptions, tile images | Dashboard → Store Products → Categories |
| Announcement bar, hero (title, text, button, desktop and phone images), section intros, promo band, about (home and About page), testimonials heading, subscribe heading and text, contact intro and details, footer blurb, footer credit | Dashboard → CMS → **Site Sections** (one item per `key`) |
| Testimonials | Dashboard → CMS → **Testimonials** |
| Terms, Privacy, Shipping, Refund, Accessibility pages | Dashboard → CMS → **Legal Pages** |
| Newsletter and Contact form fields, labels, button text, thank-you message | Dashboard → Forms |
| Page `<title>`/description: main pages and product/category pages | Dashboard → Marketing → SEO settings |
| Checkout page | Wix hosted checkout (Dashboard → Settings → Checkout) |

**Hardcoded, with no back-office home:**
- Store name "Business Name" in the header and footer: `src/lib/site.ts`
- Nav page labels "About", "Contact": `src/lib/site.ts`
- UI chrome:
  - "Shop", "All products", "Filter", "Sort", "Clear all", "Load more", "Show results", sort labels
  - Button states: "Add to bag", "Select …", "Choose options", "Sold out", "Pre-order", "Out of stock"
  - Bag: "Your bag", "Subtotal", "Discount", "Shipping and taxes are calculated at checkout.", "Continue to secure checkout", "Keep shopping"
  - Empty, error and 404 messages, breadcrumbs, "More from …"

## 8. Before this store goes live

This template ships with placeholder content so the layout can be judged. Everything below must be replaced, made true, or removed.

**Invented content — replace or remove**
- **Customer testimonials** (CMS → Testimonials): dummy text and "Customer Name". Never publish these against a live store.
- **Contact details** (CMS → Site Sections `contact-address`, `contact-details`, `contact-hours`): the Wix dummy address "500 Terry Francine St., San Francisco", 123-456-7890, info@mysite.com, and opening hours.
- **Legal pages** (CMS → Legal Pages): Wix's guidance text, not policies. Write real Terms, Privacy, Shipping, Refund and Accessibility statements.
- **Footer credit** "© 2035 by Business Name. Powered by Wix", and the store name in `src/lib/site.ts`.
- **All products, prices, categories, info sections and images.** This is a placeholder catalog.
- **Ribbons** "Limited Edition", "Coming Soon", "New" and **pre-order**: labels only, with no real scarcity or dates behind them.
- **The Sale category and promo band:** make sure the "was" prices reflect real previous prices, or remove them.

**Operational claims:** none are fabricated. No delivery windows, thresholds, return windows or guarantees appear anywhere. The bag says only that shipping and taxes are calculated at checkout.

**Not configured on this site**
- **Payments:** hosted checkout currently shows "We can't accept online payments". Connect a payment provider in Dashboard → Settings → Accept Payments.
- **Shipping:** no shipping regions or rates are set.
- **Custom domain:** the site runs on the free `wix-site-host.com` address.

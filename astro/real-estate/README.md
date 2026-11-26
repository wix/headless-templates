# Real Estate (Wix CMS)

An estate-agency wireframe built on **Wix Headless**: sale, rental and commercial listings, the agents who handle them, the neighborhoods they sit in, and lead forms. Content, copy and images all come from the site's **Wix CMS** collections; the contact and valuation forms are **Wix Forms**, rendered from each form's own fields.

## What it shows

- **Home** — a hero with a listing search (location / property ID, category, type, bedrooms, price range), Browse by Category, Buy and Rent sections, benefits, a neighborhoods map, agents, recently sold, About and FAQ.
- **Listings** (`/listings`) — search, a filters drawer (area, category, price, bedrooms, bathrooms, property types, must-haves, status), sort and pagination; the state lives in the URL.
- **Listing page** (`/listings/<slug>`) — photo slider with floor plan and map tabs, facts, key features, folding details, a mortgage estimate, the listing agent, and a viewing-day picker that opens the contact form pre-filled. Listing JSON-LD is in the page.
- **Neighborhoods** (`/neighborhoods`, `/neighborhoods/<slug>`), **Agents** (`/agents`), **About**, **Sell** (with the valuation form), **Contact**, **FAQ**, legal pages (`/policies/<slug>`) and a 404.

## Wix apps and data

- **Wix CMS** (`@wix/data`) collections: `Listings`, `ListingCategories`, `Agents`, `Neighborhoods`, `SiteContent` (page copy keyed by `key`), `Benefits`, `Stats`, `Testimonials`, `Faq`, `SocialLinks`, `LegalPages`.
- **Wix Forms** (`@wix/forms`): forms named **Contact** and **Valuation**, looked up by name on the server and submitted as the visitor.

Prices are plain numbers in the CMS; their currency is set once in `src/lib/site.ts` (`CURRENCY`, USD by default) and formatted with `Intl`. Interface wording (button labels, filter steps, viewing time slots) lives in code.

The neighborhoods map (`public/maps/city-streets.svg`) is an original, procedurally drawn street network — no third-party map data, so no attribution is needed. Swap in your own drawing if you like.

## Quick start

```bash
npm install
npm run dev
```

Build and publish with the Wix CLI: `npx wix build && npx wix release`.

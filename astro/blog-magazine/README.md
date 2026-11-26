# Magazine (Wix Blog)

An editorial, magazine-style blog on Wix Headless and Astro. The home page reads like a newspaper front page; every word of content
comes from the Wix site, so the owner edits it in the dashboard, not in code.

## What it shows

- **Home**: an animated masthead (the newest covers flip in, then settle), a sticky lead story between the latest stream and Editor's
  Picks (posts marked *Featured*), Must Read, Recent Updates, one block per category, an About + newsletter band and a dark series block.
- **Post page**: a split opening screen (story on black, cover beside it), the Ricos body rendered on the server with
  `@wix/astro-ricos`, a newsletter sign-up halfway through, tags, author card, "More from" the category and the latest posts. A
  reading bar slides in once the opening screen is gone: title, share links and a reading-progress line.
- **Category, tag, author and section pages**: a centred head with the post count and the related tags, then the posts four to a row
  with pagination.
- **Header**: a news ticker of the newest posts, category menus that preview their latest posts on hover, an All Categories panel, and
  a search popup that shows the most viewed posts and filters every post instantly as you type.
- **About, Contact, legal pages and 404**, all in the same design system (`src/styles/global.css`, Tailwind v4 tokens).
- RSS at `/rss.xml` (also served at `/blog-feed.xml`, the address Wix SEO advertises).

## Wix apps and data it uses

| Source | Used for |
| --- | --- |
| **Wix Blog** (`@wix/blog`) | posts, categories, tags, featured flag, view counts (popular posts), the Ricos body |
| **Wix Members** (`@wix/members`) | author names and photos for bylines |
| **Wix Forms** (`@wix/forms`) | the **Contact** form (fields rendered from its schema) and the **Newsletter** form, both looked up by name |
| **Wix CMS** (`@wix/data`) | `SiteContent` (page copy by `key`: `site`, `home`, `updates`, `welcome`, `about`, `subscribe`, `contact`, `footer`), `SocialLinks`, `TeamMembers`, `LegalPages`, `Sections` |
| **Wix SEO** (`@wix/seo`) | per-page SEO tags the owner edits in the dashboard (post and category pages) |

The only hardcoded copy is interface wording (labels such as *Read more*, *Popular Posts*, *Latest Posts*, *Editor's Picks*) in
`src/lib/site.ts` and the page markup. The top bar's exchange rates (EUR and GBP in USD) are read from the National Bank of Ukraine's
public daily feed (`src/lib/rates.ts`); remove that module and its markup in `SiteLayout.astro` if you don't want them.

## Quick start

```bash
npm install
npm run dev
```

Build with `npm run build`. Release to Wix hosting with the Wix CLI (`npx wix build && npx wix release`) from a project created by
`wix headless init`.

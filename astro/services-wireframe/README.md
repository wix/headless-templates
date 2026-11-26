# Services Wireframe (Wix CMS)

A non-branded wireframe for a business that shows **what it offers, who delivers it and where**, and takes enquiries: clinics,
studios, consultancies, schools, salons. Everything the owner edits lives in Wix CMS collections and Wix Forms; the code only
renders it.

## What it shows

- **Home**: a bento first screen (search, featured services, categories, locations), featured services, benefits, awards,
  about + team, FAQ, locations.
- **Services**: list with search, category chips, sort and pagination; a page per category (figures, services, About The
  Service, team, FAQ) and per service (details, team, locations, gallery, FAQ).
- **Team** and **Locations**: lists with search and sort, and a page each.
- **About** (values, story, team, numbers, testimonials), **Contact** (details, socials and the Wix Forms contact form), legal
  pages from the CMS, 404.
- A header **city picker**: services are filtered to the locations in the chosen city.

## Wix apps

- **Wix CMS** (`@wix/data`) – collections `Services`, `ServiceCategories`, `TeamMembers`, `Locations`, `Faq`, `ServiceAbout`,
  `Awards`, `Benefits`, `Stats`, `Testimonials`, `SocialLinks`, `LegalPages` and `SiteContent` (page copy by `key`).
- **Wix Forms** (`@wix/forms`) – the form named "Contact"; its fields are rendered from the form schema.

## Notes

- Prices: the CMS `price` field is a plain number; set its currency in `CURRENCY` (`src/lib/site.ts`, default `USD`).
- Interface labels (button and control wording) are in the code; all page copy and data come from the CMS.

## Quick start

```bash
npm install
npm run dev
```

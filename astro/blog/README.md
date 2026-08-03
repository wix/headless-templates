# Wix Astro Blog Template

A blog website template built with [Astro](https://astro.build) and
[Wix Headless](https://dev.wix.com/docs/go-headless). Posts are managed in the
Wix Blog and fetched with the `@wix/blog` SDK (`src/lib/blog.ts`); rich content
is rendered with `@wix/astro-ricos`, and each post page (`/blog/[slug]`) gets
its SEO tags (title, description, canonical, Open Graph) from Wix as the source
of truth. Pages: `/` (home), `/blog` (all posts), `/blog/[slug]` (single post),
and `/about`.

This template is a thin wireframe meant as a starting point — its job is to
demonstrate how to connect an Astro site to Wix business solutions the right way.

## Getting started

The template expects a Wix site with the Wix Blog app installed
([Wix CLI quick start](https://dev.wix.com/docs/go-headless/miscellaneous/other-wix-cli-flows/quick-start)):

```bash
npm install
npx @wix/cli@latest login
npm run dev                  # develop against your Wix site (prompts to pick or create a site)
npm run build                # production build
npm run release              # deploy to Wix hosting
```

# Guidance for agents working on this repo

This repo holds the Astro templates behind `wix headless init`. Each template is a **thin wireframe for an agent to start from**: its job is to demonstrate how to connect to a Wix business solution the right way, with as little UI code as that requires. Keep code lightweight, but never remove pages, routes, or functionality in the name of thinness — simplify implementations in place.

## Wix is the source of truth

Never hardcode data the site owns. Every one of these was a real review finding:

- **Services** (names, durations, prices): render from `services.queryServices()`, keyed by real `_id` — no hardcoded "free"/"premium" tiers.
- **Forms**: render fields from `forms.getForm()` (labels, required flags, options, steps). Checkbox groups must render as checkboxes and submit **arrays** (`formData.getAll`), numbers as numbers, booleans as booleans.
- **Products**: query with explicit fields (`CURRENCY`, `PLAIN_DESCRIPTION`, `VARIANT_OPTION_CHOICE_NAMES`); resolve variants from `variantsInfo` — never blindly add `variants[0]` for a product with options.
- **Prices and totals**: display the SDK's `formattedAmount`; cart totals come from `estimateCurrentCartTotals()`/`priceSummary`. Never prefix `$` or do `parseFloat` money math — stores run in EUR/GBP too.
- **Timezones**: query availability and format times in the visitor's timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), never hardcoded UTC.
- **Blog content**: render Ricos via `RicosViewer` from `@wix/astro-ricos` (with `renameKeysFromSDKRequestToRESTRequest`), not a hand-rolled node renderer. Source per-post SEO tags (title/description/canonical/OG) from `post.seoData.tags`, falling back to title/excerpt/cover.
- Placeholder copy ("Business Name", template marketing text) is acceptable; placeholder *data* that shadows a Wix API is not.

## Build & integration standards

- Hosting: `@wix/astro` (current major) with `@wix/astro-wix-hosting-adapter` where an explicit adapter is needed. Never `@wix/cloud-provider-fetch-adapter` or `isBuild`-conditional adapters — that pattern was removed repo-wide.
- Auth/client: rely on the `@wix/astro` integration context — module-level SDK imports just work. No `createClient`, no OAuth boilerplate, no client IDs in source. Member auth routes come from `wix({ auth: true })`.
- Don't ship a React integration unless the template actually has `.jsx`/`.tsx` files. If it does, server-render islands with `client:load` (never `client:only` for primary content — it kills SEO) and trim serialized props to what the UI uses.
- Never commit `.wix/` (topology.json carries real site IDs) or `.env.local` — both belong in `.gitignore`.
- Pin dependencies with caret ranges, never `"latest"`. Unknown dynamic-route lookups return **404**, not a redirect. Log caught errors before returning fallbacks, and show users generic messages, not raw SDK errors. No dead UI: no forms without handlers, no `<p>` pseudo-links, no href-less icons.

## How the templates.json catalog works

`templates.json` at the repo root is the catalog behind `wix headless init` (`npx @wix/create-new headless`). The CLI fetches it at runtime from this repo's **main branch** (`https://raw.githubusercontent.com/wix/headless-templates/main/templates.json`), so merging a change here updates every installed CLI immediately — no CLI release needed. Unknown fields are ignored by the CLI's parser, so the manifest can gain metadata without breaking older versions.

Each entry looks like:

```json
{
  "name": "scheduler",                                   // the --site-template CLI value
  "title": "Scheduler (Wix Bookings)",                   // shown in the CLI picker
  "subtitle": "Appointment booking and calendar",
  "siteTemplateId": "72ade0e3-1871-4c04-ac54-419ca874d9d3",
  "gitPath": "astro/scheduler",                          // code folder in this repo
  "vibeCompatible": false
}
```

When a user picks a template, the CLI does two things:

1. **Provisions a Wix site** from `siteTemplateId` — the Wix site template that installs the business apps and seeds their content (Bookings services, the Forms form, the Stores catalog). This ID is created on the Wix side; it cannot be invented in this repo.
2. **Copies the code** from `gitPath`, cloned from this repo's default branch, and wires up the project (`wix.config.json`, `.env.local` with the site's client ID).

Consequences to keep in mind:

- The code and the site template are a **pair**: any hardcoded resource GUID in a template (e.g. the registration form ID) must match what its `siteTemplateId` provisions.
- Changing `gitPath` code is safe to ship independently; changing which resources the code expects requires a matching site-template update.
- The headless registry mirrors this catalog — new/changed catalog templates need their bundle republished to the registry after merge.
- A template without a catalog entry (like `blog`, or anything under `inspiration/`) is not CLI-selectable; it can still be used via `--template-path <local copy>` combined with an existing `--site-template` whose provisioned site has the needed apps.

## Inspiration templates

`inspiration/` holds community-contributed templates that are **not** in the CLI catalog: no `siteTemplateId` pairing, no registry publishing, maintained by their contributors. The source-of-truth and no-secrets rules above still apply; see `inspiration/README.md` for contribution guidelines.

## Testing a template end-to-end

```bash
npx @wix/create-new headless init \
  --site-template <catalog-name> \
  --template-path <path-to-template-copy-without-node_modules> \
  --business-name "Test" --folder-name test-app --skip-git --no-publish
```

This provisions a real site from the catalog's `siteTemplateId` and copies your local code — exactly what users get post-merge. Then `npm run dev` and exercise the flows; `npm run build && npm run release` publishes to Wix hosting.

Gotchas: `--template-path` must point at a copy **without `node_modules`** (the generator runs files through EJS and chokes on `<%` inside dependencies). Plain `astro build` inside the monorepo can fail on workspace hoisting and missing `wix.config.json` — verify builds from a standalone copy with a dummy `WIX_CLIENT_ID` instead.

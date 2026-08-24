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

## Catalog pairing

Each `templates.json` entry pairs a `gitPath` (code) with a `siteTemplateId` (the Wix site template that provisions the backing site — services, forms, catalog). Any hardcoded resource GUID in a template (e.g. a form ID) must match what its `siteTemplateId` provisions. New/changed catalog templates also need their bundle republished to the headless registry after merge.

**There are three template lists, and they are not automatically in sync:**

1. **`templates.json`** (this repo) — the intended source of truth for name/title/`siteTemplateId`/`gitPath` pairing. Merging here does not, by itself, change what any system serves today.
2. **The `@wix/create-new` CLI's hardcoded list** — the released CLI ships its own template enum; `--site-template` accepts only those names (as of 0.0.105: `commerce`, `scheduler`, `registration`, `blank`) and rejects new names and raw GUIDs. A runtime fetch of `templates.json` is planned in wix-private/wix-cli but until it ships, adding a template here does NOT make it CLI-selectable — that requires a CLI release.
3. **The live headless registry** (`GET manage.wix.com/_api/headless-business-setup/v1/headless-sites/templates`) — what `CreateSiteFromTemplate` and the template gallery actually serve. Populated only by the employee-only publish flow (see the `add-template` skill); its entries use a different schema than `templates.json` (`displayTitle`/`description`/`categories`/`author`/`kind: FUNCTIONAL|INSPIRATIONAL`/`deployedUrl`, mapped from `title`/`subtitle` here).

When checking "is template X available", say which list you checked — they diverge routinely.

## Testing a template end-to-end

```bash
npx @wix/create-new headless init \
  --site-template <cli-enum-name> \
  --template-path <path-to-template-copy-without-node_modules> \
  --business-name "Test" --folder-name test-app --skip-git --no-publish
```

This provisions a real site from that entry's `siteTemplateId` and copies your local code. **`--site-template` only accepts names from the released CLI's hardcoded enum** (see Catalog pairing above) — so:

- **Existing catalog template**: use its own name. This is exactly what users get post-merge.
- **New template**: full CLI e2e is impossible pre-publish. Test the code by pairing `--template-path <your new template>` with an existing enum name whose provisioned site has the Wix apps your template needs (e.g. a forms template against `registration`). This validates the code against a real site, but NOT that your newly minted `siteTemplateId` provisions the right resources — that can only be verified after the registry publish. If no enum entry has the right apps, fall back to the standalone build check below plus `--site-template blank` and installing the apps manually in the dashboard.

Then `npm run dev` and exercise the flows; `npm run build && npm run release` publishes to Wix hosting.

Gotchas:
- Make the clean copy with `git archive HEAD astro/<name> | tar -x -C <dir>` (committed files only). `--template-path` must point at a copy **without `node_modules`** — the generator runs files through EJS and chokes on `<%` inside dependencies.
- Plain `astro build` inside the monorepo can fail on workspace hoisting and missing `wix.config.json` — verify builds from a standalone copy with a dummy `WIX_CLIENT_ID` instead.
- On a Wix machine, tooling may rewrite the root `.npmrc` and `package-lock.json` to point at the internal registry (`npm.dev.wixpress.com`). Never commit those rewrites to this public repo — check `git diff package-lock.json` for internal URLs before committing.

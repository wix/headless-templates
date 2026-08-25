---
name: add-template
description: Turn a Wix headless CLI site into an official Astro template — release it, mint a Wix site template from it, restructure the code to the repo layout, and open a PR to headless-templates. For Wix employees.
---

# Add a Headless Template

Guides a Wix employee through contributing a new Astro template: a working headless site becomes (a) a **Wix site template** (the backend blueprint new sites are created from) and (b) a **code template** in this repo (what the CLI scaffolds).

Work through the steps in order. Each step states what to run and what to capture for later steps. Ask the user for anything you can't derive (site directory, template name, title/subtitle).

## Inputs to collect up front

- **Project directory**: a Wix headless CLI project (has `wix.config.json` with a `siteId`). If the user doesn't have one yet, do Step 1; otherwise skip to Step 2.
- **Template name**: 4–20 chars, lowercase letters/digits/hyphens/underscores, must not end with a hyphen (server pattern: `^[a-z0-9_-]{3,19}[a-z0-9_]$`). Must not collide with an existing `astro/<name>` directory or `templates.json` entry.
- **Title + subtitle**: human-facing card copy, e.g. `"Commerce (Wix Stores)"` / `"Product catalog, checkout, and more"`.

## Step 1 — Build the headless site

Only if the user is starting fresh:

```bash
npm create @wix/new@latest -- headless    # scaffolds a headless project (prompts for template + site)
cd <project> && npm install && npx wix dev
```

The user iterates until the site looks how they want. The site's business apps (Stores, Bookings, Forms, …) define what the future template ships with — install them now, not after minting.

## Step 2 — Release it

The site must be released so the template is minted from a working, published state:

```bash
npx wix build && npx wix release
```

Verify the released site URL loads before continuing.

## Step 3 — Mint the Wix site template

The `headless-business-setup` service exposes an employee-only endpoint that duplicates the site, marks the clone as a template, and transfers it to the headless-stack account (the source site is untouched):

```
POST https://manage.wix.com/_api/headless-business-setup/v1/headless-sites/wix-templates/{metaSiteId}?name=<template-name>
```

It authenticates with the **Wix CLI's own login token** — the employee is already logged in from Steps 1–2, so run this from the project directory:

```bash
SITE_ID=$(node -p "require('./wix.config.json').siteId")
TOKEN=$(node -p "require(require('os').homedir()+'/.wix/auth/account.json').accessToken")
curl -sS -X POST \
  "https://manage.wix.com/_api/headless-business-setup/v1/headless-sites/wix-templates/${SITE_ID}?name=<template-name>" \
  -H "Authorization: ${TOKEN}"
```

Expected response: `{"wixTemplateId":"<guid>","name":"<template-name>"}`.

**Capture the returned `wixTemplateId`** — it becomes `siteTemplateId` in `templates.json` (Step 6) and the `wixTemplateId` of the post-merge registry publish.

Troubleshooting:
- **401** — the CLI token expired (they live 4 hours). Run any CLI command that touches the account (e.g. `npx wix login`) and retry.
- **403** — the logged-in user isn't recognized as a Wix employee, or lacks read access to the source site (the duplicate is authorized against the caller's identity).
- **400** — the name violates the pattern (4–20 chars, lowercase letters/digits/hyphens/underscores, no trailing hyphen).
- **502 `duplicateMetaSite failed`** — the `metaSiteId` doesn't exist or the caller can't read it; double-check `wix.config.json`'s `siteId`.

## Step 4 — Prep the code for template structure

Copy the project into `astro/<template-name>` in this repo, then strip everything site-specific. A template is a clean scaffold — the CLI generates the site binding when someone uses it:

Remove:
- `wix.config.json` (site binding — must NOT be in the template)
- `.env`, `.env.local`, `.env.production` (credentials)
- `node_modules/`, `dist/`, `.wix/`, `.astro/`, `.git/`, lockfiles (`package-lock.json`, `yarn.lock`)
- Any hardcoded site-specific IDs in `src/` — move them to constants with a comment explaining where the value comes from, or read them from env

Normalize:
- `package.json`: `name` → `wix-astro-<template-name>`, `version` → `0.0.1`, scripts exactly `{ "astro": "astro", "dev": "astro dev", "build": "astro build" }` — no `wix` scripts
- Adapter/hosting setup per the repo's `AGENTS.md` build standards (currently `@wix/astro` + `@wix/astro-wix-hosting-adapter` where an explicit adapter is needed)
- `.gitignore`: copy from `astro/blank` (ignores `.wix/`, `dist/`, `.astro/`, `node_modules/`, env files)
- `README.md`: what the template shows, which Wix apps it uses, quick-start commands

Sanity check: `npm install && npm run build` must succeed from a **standalone copy** of the cleaned directory with a dummy `WIX_CLIENT_ID` (building inside the monorepo can fail on workspace hoisting — see "Testing a template end-to-end" in `AGENTS.md`). Make clean copies with `git archive HEAD astro/<name> | tar -x -C <dir>` (committed files only, no `node_modules`) — the same recipe the e2e test needs.

## Step 5 — Review the code against AGENTS.md

Before opening the PR, **read the repo root `AGENTS.md` in full** — it is the review standard for this repo and evolves; do not rely on a remembered copy. Then review every file of the new template against it and fix findings in place. Cover at minimum each of its sections:

- **Thin wireframe** — lightweight code that demonstrates the integration; simplify implementations, but never drop pages, routes, or functionality for thinness.
- **Wix is the source of truth** — no hardcoded data the site owns (services, form fields, products, prices, timezones, blog content…). Every rule in that section was a real past review finding; check the template against each one that applies to its business solution.
- **Build & integration standards** — adapter choice, SDK usage via the `@wix/astro` context (no `createClient`/OAuth boilerplate/client IDs), React-island rules, nothing site-specific committed, pinned deps, 404-not-redirect, error handling, no dead UI.
- **Catalog pairing** — any resource GUID hardcoded in the template (e.g. a form ID) must match what the Step 3 `wixTemplateId` actually provisions.

Then test as far as pre-publish reality allows. **Full CLI e2e for a NEW template is impossible before the registry publish**: the released `@wix/create-new` hardcodes `--site-template` to a fixed name enum (`commerce`, `scheduler`, `registration`, `blank` as of 0.0.105) — it does not read `templates.json` and rejects new names and raw GUIDs. So:

1. **Code check** (always): the standalone `npm install && npm run build` from Step 4.
2. **Live-site check** (recommended): `npx @wix/create-new headless init --site-template <existing-enum-name> --template-path <clean copy of your template>` — pick the enum entry whose provisioned site has the Wix apps your template needs; if none fits, use `blank` and install the apps in the dashboard. Exercise the flows with `npm run dev`.
3. What this does NOT verify: that your minted `wixTemplateId` provisions the right resources (the GUIDs your code expects). That is only verifiable after the registry publish — note it in the PR as an untested pairing.

Report what was checked and what was fixed — a clean review is a PR-body bullet, not a silent step.

## Step 6 — Open the PR

1. Add the catalog entry to `templates.json`:

```json
{
  "name": "<template-name>",
  "title": "<Title>",
  "subtitle": "<Subtitle>",
  "siteTemplateId": "<wixTemplateId from Step 3>",
  "gitPath": "astro/<template-name>",
  "vibeCompatible": false
}
```

Note: merging this entry does **not** make the template CLI-selectable — the released CLI ships a hardcoded template enum (see `AGENTS.md` → Catalog pairing). CLI availability requires a wix-cli release; registry/gallery availability requires the publish below.

2. Add a row to the Templates table in the root `README.md` (Astro section). It's a hand-written HTML table, 4 columns:

```html
<tr>
  <td><a href="https://github.com/wix/headless-templates/tree/main/astro/<template-name>"><Title></a></td>
  <td><One-sentence description.></td>
  <td></td><!-- live demo link, if any -->
  <td><Wix apps used, comma-separated></td>
</tr>
```

3. Branch from `main`, commit **only** `astro/<template-name>` + `templates.json` + `README.md`, push, and `gh pr create` against `main` with a body covering: what the template demonstrates, which Wix apps it uses, the minted `wixTemplateId`, and the released demo URL from Step 2.

⚠️ On a Wix machine, tooling may rewrite the **root** `.npmrc` and `package-lock.json` to internal Artifactory URLs (`npm.dev.wixpress.com`). This is a public repo — check `git diff` and exclude those rewrites from every commit.

## After the PR merges — registry publish

The template only becomes servable by `CreateSiteFromTemplate` / the gallery after it's published to the headless registry. **This is a write against a shared production registry, owned by the headless team — do not attempt it unless the user owns this flow; otherwise stop here and hand off, stating the minted `wixTemplateId` and the merged `gitPath`.** For owners, the actual contract (verified 2026-08-05):

- Endpoint: `POST https://manage.wix.com/_api/headless-business-setup/v1/headless-sites/templates/<name>?wixTemplateId=<guid>` — `wixTemplateId` is the **source metasite to clone** (the Step 3 mint result). A same-name POST updates the existing entry and bumps its version.
- Auth: BO employee cookie — `Cookie: WixBoAuthentication_1_19_0=<boCookie from ~/.dpx-ng/auth.json>; XSRF-TOKEN=nocheck` plus header `X-XSRF-TOKEN: nocheck`.
- Body: multipart. `bundle` = zip of the built template's `dist/` + `.wix/` (build with `WIX_CLOUD_PROVIDER=KUBERNETES WIX_CLIENT_ID=WIX_CLIENT_ID_PLACEHOLDER NODE_ENV=production npx astro build`); `source` = zip of the rest (minus `node_modules`/`dist`/`.wix`/`.astro`). **Known quirk: two files in one request arrive empty — POST bundle alone first, then bundle+source in a second POST.**
- Gallery metadata via query params (carried forward when omitted): `displayTitle`, `description`, `categories` (comma-separated), `author`, `previewUrl`, `kind` (`FUNCTIONAL`|`INSPIRATIONAL`), `visibility` (`draft`|`published`). Mapping from `templates.json`: `title`→`displayTitle`, `subtitle`→`description`; `categories`/`author`/`kind` exist only in the registry.
- The publish deploy-validates inline: it provisions/updates a demo site (that's where `deployedUrl` comes from) by pushing files through `wix-code-app-deployments`. Two failure modes: deploys slower than the ~60s gateway timeout return **504 while the backend may still be working**, and any single built file over **~4MB** is rejected outright (gRPC message limit — check `dist` for oversized server chunks before publishing).
- Verify: `GET …/v1/headless-sites/templates` lists entries (no version field); deploy success/failure is only visible in the service's Grafana app-logs (`artifact_id = 'com.wixpress.coreservices.headless-business-setup'`, log markers `deployTemplateSite.deployFiles`).

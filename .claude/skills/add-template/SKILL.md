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

**Capture the returned `wixTemplateId`** — it becomes `siteTemplateId` in `templates.json` (Step 5).

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

Sanity check: `npm install && npm run build` must succeed from a **standalone copy** of the cleaned directory with a dummy `WIX_CLIENT_ID` (building inside the monorepo can fail on workspace hoisting — see "Testing a template end-to-end" in `AGENTS.md`).

## Step 5 — Review the code against AGENTS.md

Before opening the PR, **read the repo root `AGENTS.md` in full** — it is the review standard for this repo and evolves; do not rely on a remembered copy. Then review every file of the new template against it and fix findings in place. Cover at minimum each of its sections:

- **Thin wireframe** — lightweight code that demonstrates the integration; simplify implementations, but never drop pages, routes, or functionality for thinness.
- **Wix is the source of truth** — no hardcoded data the site owns (services, form fields, products, prices, timezones, blog content…). Every rule in that section was a real past review finding; check the template against each one that applies to its business solution.
- **Build & integration standards** — adapter choice, SDK usage via the `@wix/astro` context (no `createClient`/OAuth boilerplate/client IDs), React-island rules, nothing site-specific committed, pinned deps, 404-not-redirect, error handling, no dead UI.
- **Catalog pairing** — any resource GUID hardcoded in the template (e.g. a form ID) must match what the Step 3 `wixTemplateId` actually provisions.

Then prove it end-to-end with the recipe from `AGENTS.md`'s "Testing a template end-to-end" section: provision a real site from the minted template with `npx @wix/create-new headless init --site-template … --template-path …` and exercise the flows with `npm run dev`. Report what was checked and what was fixed — a clean review is a PR-body bullet, not a silent step.

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

2. Add a row to the Templates table in the root `README.md` (Astro section).
3. Branch, commit `astro/<template-name>` + `templates.json` + `README.md`, push, and `gh pr create` against `main` with a body covering: what the template demonstrates, which Wix apps it uses, the minted `wixTemplateId`, and the released demo URL from Step 2.

## After the PR merges

The template still needs to be published into the headless template registry (bundle upload to `POST /v1/headless-sites/templates/<name>` with gallery metadata) before `CreateSiteFromTemplate` can serve it — that's a separate, employee-only publish flow owned by the headless team; flag it in the PR description as a follow-up.

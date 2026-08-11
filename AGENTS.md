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

## SEO and mobile responsiveness

These are shipped-site quality bars, not nice-to-haves — templates go live as real customer sites. Every one of these has a real gap in the repo today; don't repeat it in new or edited templates:

- **SEO on Wix-hosted main pages**: `@wix/astro`'s middleware auto-injects `<title>`/meta description/canonical/OG/structured data from the Dashboard SEO settings — don't duplicate it (see `astro/cms-catalog/src/layouts/Layout.astro`). That auto-injection does not cover **item/detail pages** for dynamic content (a product, a service, a blog post) — those need per-item tags sourced from the item's own data.
- **Per-item SEO**: follow the `astro/blog/src/pages/blog/[...slug].astro` pattern — read `post.seoData.tags`, filter out `disabled`, and render `<link rel="canonical">` plus OG/Twitter tags from those, falling back to the item's own title/excerpt/cover when a tag is missing. Apply the same pattern to product and service detail pages; don't hardcode `<Layout title="Brand Name">` with no description or OG data.
- **Mobile responsiveness**: every template's global stylesheet needs `@media` breakpoints for its grids, nav, and any multi-column layout — don't ship a template with zero responsive rules (`cms-catalog`, `scheduler`, and `registration` currently have none). Include `width=device-width, initial-scale=1.0` in the viewport meta tag (not just `width=device-width`). Prefer fluid sizing (`min(380px, 100vw)`) over fixed pixel widths for panels/drawers that must fit small screens. Test both portrait and landscape on mobile — don't lock orientation or let a fixed-height header/footer crowd out the main content in landscape.

## Accessibility standards

Based on [Wix's accessibility scoring KB](https://accessibility.wixanswers.com/kb/en/article/accessibility-scoring-kb) (WCAG-derived). Templates are real customer-facing sites, so these apply to every interactive element and page you touch, not just new features:

**Keyboard**
- Never set a positive `tabindex`. Only `0` or `-1`.
- Every interactive element (button, link, input, custom widget) must be reachable by Tab, in visual order, with no keyboard traps and no tabbing into off-screen/hidden content.
- Don't add a tab stop to a non-interactive element, and don't leave adjacent links pointing at the same target — merge them.
- Every focusable element needs a visible focus ring (use the shared focus-ring style, not a 1px border or an outline that gets clipped/obscured) — check it under a forced `:focus` state, not just on hover.
- Match native keyboard behavior: buttons respond to Enter **and** Space, links to Enter, checkboxes toggle on Space, radio groups navigate with arrow keys (looping) and land on the checked item first, selects open with Enter/Space, navigate with arrow keys, and close with Esc. Modals/dialogs must close on Esc.
- After an action, move focus somewhere meaningful: into an opened modal (not left on the trigger button), to the first invalid field on a form error (not the submit button, not a wrapper div around the input).

**Screen reader** (test matrix: NVDA on desktop, VoiceOver on iOS)
- DOM order must match visual order — don't let CSS reorder content in a way that makes screen-reader reading order skip or scramble sections.
- One clear heading per page (`h1` for a full page, `h2` for a section-level widget), no skipped levels, and headings must actually describe the content that follows — no heading tag used for visual styling alone, no heading text split across two tags.
- Every interactive element needs a correct role (don't build custom "clickable" divs with no role, don't mark a link as a button or a checkbox), an accessible name that includes any visible text, and correct state/properties (`aria-expanded`, `aria-current`, `aria-haspopup`, etc.) kept in sync with visual state. Accessible names must come from i18n keys, never hardcoded English strings, and never fall back to something like a raw filename.
- Non-interactive elements (nav, images, groups, regions) need a correct role and name too: real `alt` text on content images (see SEO section — pull from Wix media data), `aria-hidden="true"` on purely decorative ones, unique labels on landmarks/navs, `title` on iframes.
- Every user action needs screen-reader feedback: state changes (expanded/collapsed, checked/unchecked) must be announced, and after any navigation/focus move the destination needs an accessible name — don't let a page refresh or filter action leave the screen reader silent.
- Hide what's visually hidden (`aria-hidden`, not just `display:none` bypassed by ARIA) and never leave a "removed" tab stop (`tabindex="-1"`) still readable by a screen reader — remove its semantics too.
- Modals must trap screen-reader reading the same way they trap Tab — don't let SR content "bleed" to what's behind the modal.
- Set `<html lang>` correctly (don't default to `en` on a non-English template), and give each page a unique, descriptive `<title>` that updates on client-side navigation, not just on hard page loads.

**Display**
- Color contrast: 4.5:1 for regular text, 3:1 for large text and non-text UI (icons, buttons, badges) — check every state (default/hover/focus/placeholder), and wire colors through the site's color palette tokens rather than hardcoded hex so a palette change doesn't break contrast.
- Never use color, shape, or direction as the only signal (no "click the green button", no error shown only via red text). Text links need either ≥3:1 contrast from surrounding text plus a non-color cue (underline is simplest), or both.
- Support zoom to 400% / a 320px viewport: no content or functionality may disappear, and there must be no horizontal scrollbar (vertical-only reflow) — check any fixed-width grid or sidebar against this.
- Don't use fixed-height containers for text that clips content when a user increases browser text/line/paragraph spacing.
- Body/paragraph text must never render smaller than 14px — check computed font size, not just the CSS value, since inherited styles or scaling can shrink it further.

**Forms**
- Every field needs a visible `<label>` programmatically connected to its input (not just `aria-label` — that breaks "click label to focus input"), unless it's a single, unambiguous field like a bare search box.
- Errors must be informative and specific (not generic, not blaming the user), connected to the field via `aria-describedby`, and the field must get `aria-invalid="true"` (cleared back to `false` once fixed).
- Required fields need both a visual indicator and the `required`/`aria-required` attribute — never rely on one alone.
- Use the right `type`/`inputmode` per field (`email`, `tel`, `number`, `url`) so mobile keyboards match the expected input.
- Don't re-ask for information the app already has (e.g. a signed-in user's name/email) unless re-entry is required for security or the data may have changed.

**Other**
- Minimum target size for interactive elements is 24×24px (48×48pt in the native mobile apps) — if an element is smaller, make sure no other interactive target intersects a 24×24px circle around it.
- Hover/focus-triggered content (tooltips, menus) must be dismissible without moving the pointer, stay open while the pointer moves onto it, and stay visible until the user dismisses it. Never use the `title` attribute for tooltip content.
- Prefer an always-enabled submit button with a validation message over a disabled submit button with no explanation.
- Don't shift page context on focus or input alone (e.g. auto-filtering content when a field changes) without warning the user first.
- Respect `prefers-reduced-motion` for autoplaying/animated content, give video a pause control, and never ship content that flashes more than 3 times per second.
- If a template supports uploading video/audio as user content, provide a way to attach captions/transcripts — burned-in captions alone aren't enough.
- Run Lighthouse (desktop + mobile) for HTML/ARIA syntax issues as a baseline check — it won't catch everything above, but it catches cheap syntax mistakes (e.g. an image inside a labeled button still needs its own `alt`).

## Build & integration standards

- Hosting: `@wix/astro` (current major) with `@wix/astro-wix-hosting-adapter` where an explicit adapter is needed. Never `@wix/cloud-provider-fetch-adapter` or `isBuild`-conditional adapters — that pattern was removed repo-wide.
- Auth/client: rely on the `@wix/astro` integration context — module-level SDK imports just work. No `createClient`, no OAuth boilerplate, no client IDs in source. Member auth routes come from `wix({ auth: true })`.
- Don't ship a React integration unless the template actually has `.jsx`/`.tsx` files. If it does, server-render islands with `client:load` (never `client:only` for primary content — it kills SEO) and trim serialized props to what the UI uses.
- Never commit `.wix/` (topology.json carries real site IDs) or `.env.local` — both belong in `.gitignore`.
- Pin dependencies with caret ranges, never `"latest"`. Unknown dynamic-route lookups return **404**, not a redirect. Log caught errors before returning fallbacks, and show users generic messages, not raw SDK errors. No dead UI: no forms without handlers, no `<p>` pseudo-links, no href-less icons.

## Catalog pairing

`templates.json` at the repo root is the CLI's catalog: each entry pairs a `gitPath` (code) with a `siteTemplateId` (the Wix site template that provisions the backing site — services, forms, catalog). Any hardcoded resource GUID in a template (e.g. a form ID) must match what its `siteTemplateId` provisions. New/changed catalog templates also need their bundle republished to the headless registry after merge.

## Testing a template end-to-end

```bash
npx @wix/create-new headless init \
  --site-template <catalog-name> \
  --template-path <path-to-template-copy-without-node_modules> \
  --business-name "Test" --folder-name test-app --skip-git --no-publish
```

This provisions a real site from the catalog's `siteTemplateId` and copies your local code — exactly what users get post-merge. Then `npm run dev` and exercise the flows; `npm run build && npm run release` publishes to Wix hosting.

Gotchas: `--template-path` must point at a copy **without `node_modules`** (the generator runs files through EJS and chokes on `<%` inside dependencies). Plain `astro build` inside the monorepo can fail on workspace hoisting and missing `wix.config.json` — verify builds from a standalone copy with a dummy `WIX_CLIENT_ID` instead.
